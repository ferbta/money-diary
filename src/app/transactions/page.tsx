"use client";

import React from "react";
import TransactionList from "@/components/TransactionList";
import { TransactionWithCategoryAndReceipts, Category } from "@/lib/types";
import { Search, Download, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const TransactionsPage = () => {
    const [transactions, setTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [txRes, catRes] = await Promise.all([
                    fetch("/api/transactions"),
                    fetch("/api/categories")
                ]);
                const txData = await txRes.json();
                const catData = await catRes.json();
                setTransactions(txData);
                setCategories(catData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryId === "" || tx.categoryId === selectedCategoryId;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Lịch Sử Giao Dịch</h1>
                    <p className="text-slate-400 text-sm md:text-base mt-1">Danh sách chi tiết các hoạt động tài chính của bạn</p>
                </div>
                <Link href="/transactions/new" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Thêm mới
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-[2]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mô tả..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 box-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-1 gap-2">
                    <div className="relative flex-1">
                        <Select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            options={[
                                { label: "Tất cả danh mục", value: "" },
                                ...categories.map(c => ({ label: c.name, value: c.id }))
                            ]}
                            className="w-full"
                        />
                        {selectedCategoryId && (
                            <button
                                onClick={() => setSelectedCategoryId("")}
                                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                                title="Xóa lọc"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button variant="outline" className="shrink-0 p-3">
                        <Download size={18} />
                    </Button>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-8 min-h-[400px] md:min-h-[600px] shadow-xl">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner size={40} />
                    </div>
                ) : (
                    <TransactionList transactions={filteredTransactions} />
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
