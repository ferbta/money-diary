"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { ArrowLeft, Edit, Trash2, Calendar, Tag, FileText, ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Card from "@/components/ui/Card";

const TransactionDetailPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [transaction, setTransaction] = React.useState<TransactionWithCategoryAndReceipts | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeImage, setActiveImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await fetch(`/api/transactions/${id}`);
                if (!response.ok) throw new Error("Not found");
                const data = await response.json();
                setTransaction(data);
            } catch (err) {
                console.error("Failed to fetch transaction:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchTransaction();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này không?")) return;

        try {
            const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (response.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-500">Đang tải chi tiết...</div>;
    if (!transaction) return <div className="p-20 text-center text-slate-500">Không tìm thấy giao dịch</div>;

    return (
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-800"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Chi tiết giao dịch</h1>
                </div>
                <div className="flex gap-2">
                    <Link href={`/transactions/${id}/edit`}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Edit size={16} />
                            Sửa
                        </Button>
                    </Link>
                    <Button variant="danger" className="flex items-center gap-2" onClick={handleDelete}>
                        <Trash2 size={16} />
                        Xóa
                    </Button>
                </div>
            </div>

            {/* Hero Image / Gallery Section */}
            {transaction.receipts.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            Bộ sưu tập hóa đơn
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                            {transaction.receipts.length} ảnh
                        </span>
                    </div>
                    <div className="p-8">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {transaction.receipts.map((receipt: { id: string; publicId: string }, idx: number) => (
                                <div
                                    key={receipt.id}
                                    className="relative min-w-[200px] h-[300px] rounded-2xl overflow-hidden border border-slate-800 cursor-pointer hover:border-blue-500 transition-all group"
                                    onClick={() => setActiveImage(receipt.publicId)}
                                >
                                    <img
                                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${receipt.publicId}`}
                                        alt="Receipt"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-xs text-white font-medium">Nhấn để phóng to</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="flex flex-col items-center justify-center py-12 text-center">
                        <div className={`p-4 rounded-3xl mb-6 ${transaction.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                            {transaction.type === "INCOME" ? <Calendar size={48} /> : <Calendar size={48} />}
                        </div>
                        <h2 className="text-5xl font-black text-white mb-2">
                            {transaction.amount.toLocaleString("vi-VN")}₫
                        </h2>
                        <p className="text-slate-400 font-medium">
                            {transaction.type === "INCOME" ? "Đã cộng vào số dư của bạn" : "Đã trừ từ tài khoản của bạn"}
                        </p>
                    </Card>

                    <Card title="Ghi chú">
                        <p className="text-slate-300 leading-relaxed italic">
                            {transaction.description || "Không có ghi chú cụ thể cho giao dịch này."}
                        </p>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Thông tin">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-950 rounded-xl text-blue-500">
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Danh mục</p>
                                    <p className="text-sm font-semibold text-white">{transaction.category.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-950 rounded-xl text-indigo-500">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Ngày</p>
                                    <p className="text-sm font-semibold text-white">
                                        {format(new Date(transaction.date), "dd MMMM, yyyy", { locale: vi })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-950 rounded-xl text-emerald-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Loại</p>
                                    <p className="text-sm font-semibold text-white capitalize">
                                        {transaction.type === "INCOME" ? "Thu nhập" : "Chi phí"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Lightbox Mock (Simplified) */}
            {activeImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-xl">
                    <button onClick={() => setActiveImage(null)} className="absolute top-8 right-8 text-white hover:text-rose-500 transition-colors">
                        <X size={32} />
                    </button>
                    <img
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${activeImage}`}
                        alt="Receipt Full"
                        className="max-w-full max-h-full rounded-2xl shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
};

export default TransactionDetailPage;
