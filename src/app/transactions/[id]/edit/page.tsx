"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Category, TransactionType, TransactionWithCategoryAndReceipts } from "@/lib/types";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import ReceiptUpload from "@/components/ReceiptUpload";
import Link from "next/link";
import { numberToVietnameseWords } from "@/lib/vietnamese-words";

const EditTransactionPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Form State
    const [type, setType] = React.useState<TransactionType>("EXPENSE");
    const [amount, setAmount] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [date, setDate] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [receipts, setReceipts] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, txRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch(`/api/transactions/${id}`)
                ]);

                const cats = await catRes.json();
                const tx: TransactionWithCategoryAndReceipts = await txRes.json();

                setCategories(cats);
                setType(tx.type);
                setAmount(tx.amount.toString());
                setCategoryId(tx.categoryId);
                setDate(new Date(tx.date).toISOString().split("T")[0]);
                setDescription(tx.description || "");
                setReceipts(tx.receipts.map((r: { publicId: string }) => r.publicId));
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load transaction data");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId || !date) return;

        try {
            setIsSubmitting(true);
            setError(null);
            const response = await fetch(`/api/transactions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    type,
                    date,
                    description,
                    categoryId,
                    receipts,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update transaction");
            }

            router.push(`/transactions/${id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-500">Đang tải biểu mẫu...</div>;

    return (
        <div className="max-w-3xl mx-auto w-full space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-800">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Sửa Giao Dịch</h1>
                    <p className="text-slate-400 mt-1">Cập nhật thông tin giao dịch của bạn</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card title="Chi tiết giao dịch">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 ml-1 mb-2">Loại giao dịch</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setType("EXPENSE")}
                                        className={`py-2 text-sm font-bold rounded-xl transition-all ${type === "EXPENSE" ? "bg-rose-500 text-white shadow-lg shadow-rose-900/40" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Chi phí
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("INCOME")}
                                        className={`py-2 text-sm font-bold rounded-xl transition-all ${type === "INCOME" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        Thu nhập
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Số tiền (₫)"
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

                            <Select
                                label="Danh mục"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                options={filteredCategories.map(c => ({ label: c.name, value: c.id }))}
                                required
                            />

                            <Input
                                label="Ngày giao dịch"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </Card>

                    <Card title="Ghi chú">
                        <textarea
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            placeholder="Thêm mô tả..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Hóa đơn">
                        <ReceiptUpload onUpload={setReceipts} initialPublicIds={receipts} />
                    </Card>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button variant="outline" type="button" className="flex-1" onClick={() => router.back()}>
                            Hủy
                        </Button>
                        <Button type="submit" className="flex-[2] py-4" isLoading={isSubmitting}>
                            <Save size={18} className="mr-2" />
                            Cập nhật giao dịch
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditTransactionPage;
