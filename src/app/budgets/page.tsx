"use client";

import React from "react";
import { Category, BudgetWithCategory } from "@/lib/types";
import { Wallet, Plus, AlertCircle, TrendingUp, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import BudgetProgress from "@/components/BudgetProgress";
import { numberToVietnameseWords } from "@/lib/vietnamese-words";
import Modal from "@/components/ui/Modal";
import TransactionList from "@/components/TransactionList";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const BudgetsPage = () => {
    const [budgets, setBudgets] = React.useState<(BudgetWithCategory & { usedAmount: number })[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Period state
    const [viewMode, setViewMode] = React.useState<"month" | "year">("month");
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());

    // Modal state for transactions
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [categoryTransactions, setCategoryTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [isFetchingTransactions, setIsFetchingTransactions] = React.useState(false);

    // Form state
    const [categoryId, setCategoryId] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [formMonth, setFormMonth] = React.useState(new Date().getMonth() + 1);
    const [formYear, setFormYear] = React.useState(new Date().getFullYear());

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams();
            if (viewMode === "month") queryParams.append("month", month.toString());
            queryParams.append("year", year.toString());

            const [budRes, catRes] = await Promise.all([
                fetch(`/api/budgets?${queryParams.toString()}`),
                fetch("/api/categories?type=EXPENSE")
            ]);
            if (!budRes.ok) throw new Error("Failed to fetch budgets");
            if (!catRes.ok) throw new Error("Failed to fetch categories");

            const budgetsData = await budRes.json();
            const categoriesData = await catRes.json();

            setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            if (Array.isArray(categoriesData) && categoriesData.length > 0 && !categoryId) setCategoryId(categoriesData[0].id);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [month, year, viewMode]);

    const handlePrev = () => {
        if (viewMode === "month") {
            if (month === 1) {
                setMonth(12);
                setYear(prev => prev - 1);
            } else {
                setMonth(prev => prev - 1);
            }
        } else {
            setYear(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (viewMode === "month") {
            if (month === 12) {
                setMonth(1);
                setYear(prev => prev + 1);
            } else {
                setMonth(prev => prev + 1);
            }
        } else {
            setYear(prev => prev + 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !amount) return;

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, amount: parseFloat(amount), month: formMonth, year: formYear }),
            });

            if (!response.ok) throw new Error("Failed to set budget");

            setAmount("");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error saving budget");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBudgetClick = async (budget: BudgetWithCategory) => {
        setSelectedCategory(budget.category);
        setIsModalOpen(true);
        setIsFetchingTransactions(true);
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("categoryId", budget.categoryId);
            if (viewMode === "month") queryParams.append("month", month.toString());
            queryParams.append("year", year.toString());

            const response = await fetch(`/api/transactions?${queryParams.toString()}`);
            const data = await response.json();
            setCategoryTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setIsFetchingTransactions(false);
        }
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);

    return (
        <div className="max-w-6xl mx-auto w-full space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Quản Lý Ngân Sách</h1>
                    <p className="text-slate-400 text-sm md:text-base mt-1 italic">Kiểm soát chi tiêu bằng cách đặt hạn mức</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                        <button
                            onClick={() => setViewMode("month")}
                            className={cn(
                                "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                viewMode === "month" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-400"
                            )}
                        >
                            Tháng
                        </button>
                        <button
                            onClick={() => setViewMode("year")}
                            className={cn(
                                "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                viewMode === "year" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-400"
                            )}
                        >
                            Năm
                        </button>
                    </div>

                    {/* Period Navigator */}
                    <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl px-2 py-1">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-2">
                            <CalendarIcon size={18} className="text-blue-500" />
                            <span className="text-lg font-black text-white min-w-[140px] text-center">
                                {viewMode === "month" ? `Tháng ${month.toString().padStart(2, '0')} ${year}` : `Năm ${year}`}
                            </span>
                        </div>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-slate-700"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Form */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 border-none shadow-2xl shadow-indigo-900/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-xl text-white">
                                <Wallet size={20} />
                            </div>
                            <h3 className="font-bold text-white outline-none">Tóm tắt kế hoạch</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-tighter opacity-80 mb-1">Tổng ngân sách tháng</p>
                                <p className="text-4xl font-black text-white">{totalBudget.toLocaleString("vi-VN")}₫</p>
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between">
                                <div>
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-tighter opacity-80 mb-1">Đã dùng</p>
                                    <p className="text-xl font-bold text-white">{totalUsed.toLocaleString("vi-VN")}₫</p>
                                </div>
                                <div className="text-right">
<<<<<<< Updated upstream
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-tighter opacity-80 mb-1">Cần lại</p>
                                    <p className="text-xl font-bold text-white">{(totalBudget - totalUsed).toLocaleString("vi-VN")}₫</p>
=======
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-tighter opacity-80 mb-1">Vượt mức</p>
                                    <p className="text-xl font-bold text-white">{totalUsed > totalBudget ? (totalUsed - totalBudget).toLocaleString("vi-VN") : "0"}₫</p>
>>>>>>> Stashed changes
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Thiết lập ngân sách" subtitle="Thêm hoặc cập nhật hạn mức chi tiêu">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Select
                                label="Danh mục"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                options={categories.map(c => ({ label: c.name, value: c.id }))}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Tháng"
                                    value={formMonth}
                                    onChange={(e) => setFormMonth(parseInt(e.target.value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }))}
                                    required
                                />
                                <Select
                                    label="Năm"
                                    value={formYear}
                                    onChange={(e) => setFormYear(parseInt(e.target.value))}
                                    options={Array.from({ length: 5 }, (_, i) => ({ label: `${new Date().getFullYear() - 2 + i}`, value: new Date().getFullYear() - 2 + i }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    label="Số tiền ngân sách (₫)"
                                    type="text"
                                    placeholder="0"
                                    value={amount ? parseInt(amount).toLocaleString("vi-VN") : ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        setAmount(val);
                                    }}
                                    required
                                />
                                {amount && (
                                    <p className="text-blue-400 text-xs font-medium ml-1 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                        {numberToVietnameseWords(parseInt(amount))}
                                    </p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                <Plus size={18} className="mr-2" />
                                Thiết lập ngân sách
                            </Button>
                        </form>
                    </Card>

                    <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-start gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 mt-1">
                            <Info size={20} />
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                            Ngân sách giúp bạn chi tiêu có kế hoạch. Chúng tôi sẽ tự động tính toán chi tiêu của bạn dựa trên các giao dịch trong tháng hiện tại.
                        </p>
                    </div>
                </div>

                {/* Right Column: Progress Bars */}
                <div className="lg:col-span-2 space-y-4">
                    {budgets.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-slate-600">
                            <TrendingUp size={48} className="opacity-20 mb-4" />
                            <p className="font-semibold">Chưa có ngân sách nào được thiết lập</p>
                            <p className="text-sm mt-1">Bắt đầu bằng cách thêm hạn mức chi tiêu cho một danh mục</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {budgets.map((budget) => (
                            <BudgetProgress
                                key={budget.id}
                                category={budget.category.name}
                                limit={budget.amount}
                                used={budget.usedAmount}
                                onClick={() => handleBudgetClick(budget)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Giao dịch: ${selectedCategory?.name || ""}`}
                maxWidth="3xl"
            >
                {isFetchingTransactions ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                        <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                        <div className="h-3 w-48 bg-slate-800 rounded" />
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <TransactionList transactions={categoryTransactions} />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BudgetsPage;
