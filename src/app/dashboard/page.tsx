"use client";

import React from "react";
import Calendar from "@/components/Calendar";
import TransactionList from "@/components/TransactionList";
import DashboardSummary from "@/components/DashboardSummary";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { Plus, Filter, Download } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { format } from "date-fns";

const DashboardPage = () => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
    const [transactions, setTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                // In a real app, we'd fetch by month/year based on calendar view
                const response = await fetch("/api/transactions");
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const highlightedDates = transactions.map(tx => new Date(tx.date));

    // Calculate totals for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
        .filter(tx => tx.type === "INCOME")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = monthlyTransactions
        .filter(tx => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <div className="max-w-7xl mx-auto w-full space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Tổng Quan Tài Chính</h1>
                    <p className="text-slate-400 mt-1">Quản lý và theo dõi tài sản của bạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        <Download size={18} />
                        Xuất dữ liệu
                    </Button>
                    <Link href="/transactions/new">
                        <Button className="flex items-center gap-2 pr-5">
                            <Plus size={18} />
                            Thêm giao dịch
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Section */}
            <DashboardSummary income={totalIncome} expense={totalExpense} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar & Filters */}
                <div className="lg:col-span-4 space-y-6">
                    <Calendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        highlightedDates={highlightedDates}
                    />

                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Filter size={18} className="text-blue-500" />
                                Lọc nhanh
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-1.5 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-600/20 hover:bg-blue-600/20 transition-colors">
                                Tuần này
                            </button>
                            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg border border-slate-700 hover:text-white transition-colors">
                                Chưa phân loại
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transactions */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 min-h-[600px] shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                Giao dịch
                                <span className="ml-3 text-sm font-medium text-slate-500">
                                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Gần đây"}
                                </span>
                            </h2>
                            <Link href="/transactions" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                                Xem tất cả lịch sử
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                                <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                                <div className="h-3 w-48 bg-slate-800 rounded" />
                            </div>
                        ) : (
                            <TransactionList transactions={transactions} selectedDate={selectedDate} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
