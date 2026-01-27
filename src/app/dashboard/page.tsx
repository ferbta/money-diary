"use client";

import React from "react";
import Calendar from "@/components/Calendar";
import TransactionList from "@/components/TransactionList";
import DashboardSummary from "@/components/DashboardSummary";
import { TransactionWithCategoryAndReceipts, Category } from "@/lib/types";
import { Plus, Filter, Download } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { format } from "date-fns";

const DashboardPage = () => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
    const [transactions, setTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch transactions
                const txResponse = await fetch("/api/transactions");
                const txData = await txResponse.json();
                setTransactions(txData);

                // Fetch categories
                const catResponse = await fetch("/api/categories");
                const catData = await catResponse.json();
                setCategories(catData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const highlightedDates = transactions.map(tx => new Date(tx.date));

    // Calculate totals for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(tx => {
        const d = new Date(tx.date);
        const matchesDate = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

        if (selectedCategory) {
            return matchesDate && tx.categoryId === selectedCategory;
        }

        return matchesDate;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Tổng Quan Tài Chính</h1>
                    <p className="text-slate-400 text-sm md:text-base mt-1">Quản lý và theo dõi tài sản của bạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                        <Download size={18} />
                        Xuất dữ liệu
                    </Button>
                    <Link href="/transactions/new" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto flex items-center justify-center gap-2 pr-5">
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
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${selectedCategory === category.id
                                        ? "bg-blue-600 text-white border-blue-500"
                                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600"
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Transactions */}
                <div className="lg:col-span-8">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-8 min-h-[400px] md:min-h-[600px] shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Giao dịch
                                <span className="ml-3 text-xs md:text-sm font-medium text-slate-500">
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
                            <TransactionList transactions={monthlyTransactions} selectedDate={selectedDate} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
