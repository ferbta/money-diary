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

const BudgetsPage = () => {
    const [budgets, setBudgets] = React.useState<(BudgetWithCategory & { usedAmount: number })[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Form state
    const [categoryId, setCategoryId] = React.useState("");
    const [amount, setAmount] = React.useState("");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [budRes, catRes] = await Promise.all([
                fetch("/api/budgets"),
                fetch("/api/categories?type=EXPENSE")
            ]);
            const budgetsData = await budRes.json();
            const categoriesData = await catRes.json();

            setBudgets(budgetsData);
            setCategories(categoriesData);
            if (categoriesData.length > 0) setCategoryId(categoriesData[0].id);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !amount) return;

        try {
            setIsSubmitting(true);
            const response = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, amount: parseFloat(amount) }),
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

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);

    return (
        <div className="max-w-6xl mx-auto w-full space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản Lý Ngân Sách</h1>
                    <p className="text-slate-400 mt-1">Kiểm soát thói quen chi tiêu của bạn bằng cách đặt hạn mức</p>
                </div>
                <div className="p-1 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2">
                    <span className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">Tháng 01/2026</span>
                    <span className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Tháng hiện tại</span>
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
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-tighter opacity-80 mb-1">Cần lại</p>
                                    <p className="text-xl font-bold text-white">{(totalBudget - totalUsed).toLocaleString("vi-VN")}₫</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map((budget) => (
                            <BudgetProgress
                                key={budget.id}
                                category={budget.category.name}
                                limit={budget.amount}
                                used={budget.usedAmount}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetsPage;
