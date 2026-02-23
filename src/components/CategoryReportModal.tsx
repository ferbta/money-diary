"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TransactionList from "@/components/TransactionList";
import { TransactionWithCategoryAndReceipts, Category } from "@/lib/types";
import { Archive } from "lucide-react";

interface CategoryReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryReportModal: React.FC<CategoryReportModalProps> = ({ isOpen, onClose }) => {
    const [transactions, setTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());
    const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

    // Fetch categories on mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/categories");
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch transactions when filters change
    React.useEffect(() => {
        if (!isOpen) return;

        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                const queryParams = new URLSearchParams();

                if (selectedMonth !== 0) {
                    queryParams.append("month", selectedMonth.toString());
                }

                if (selectedYear !== 0) {
                    queryParams.append("year", selectedYear.toString());
                }
                if (selectedCategory !== "all") {
                    queryParams.append("categoryId", selectedCategory);
                }

                const response = await fetch(`/api/transactions?${queryParams.toString()}`);
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [isOpen, selectedMonth, selectedYear, selectedCategory]);

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const totalIncome = transactions
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome > 0 ? totalIncome - totalExpense : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Báo cáo theo danh mục"
            maxWidth="4xl"
        >
            <div className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Tháng"
                        options={[
                            { label: "Tất cả tháng", value: 0 },
                            ...Array.from({ length: 12 }, (_, i) => ({
                                label: `Tháng ${i + 1}`,
                                value: i + 1
                            }))
                        ]}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    />
                    <Select
                        label="Năm"
                        options={[
                            { label: "Tất cả năm", value: 0 },
                            ...Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return { label: year.toString(), value: year };
                            })
                        ]}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    />
                    <Select
                        label="Danh mục"
                        options={[
                            { label: "Tất cả danh mục", value: "all" },
                            ...categories.map(c => ({ label: c.name, value: c.id }))
                        ]}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                        <p className="text-xs font-bold text-emerald-500 uppercase">Tổng thu</p>
                        <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                            +{totalIncome.toLocaleString("vi-VN")}₫
                        </p>
                    </div>
                    <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                        <p className="text-xs font-bold text-rose-500 uppercase">Tổng chi</p>
                        <p className="text-xl md:text-2xl font-bold text-rose-400 mt-1">
                            -{totalExpense.toLocaleString("vi-VN")}₫
                        </p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                        <p className="text-xs font-bold text-blue-500 uppercase">Số dư</p>
                        <p className={`text-xl md:text-2xl font-bold mt-1 ${balance >= 0 ? "text-blue-400" : "text-rose-400"}`}>
                            {balance >= 0 ? "+" : ""}{balance.toLocaleString("vi-VN")}₫
                        </p>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="min-h-[300px] max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                            <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <TransactionList transactions={transactions} isMobile={isMobile} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Archive size={48} className="opacity-20 mb-4" />
                            <p>Không có giao dịch nào</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default CategoryReportModal;
