"use client";

import React from "react";
import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Receipt, ChevronRight } from "lucide-react";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { IconRenderer } from "@/components/ui/IconPicker";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TransactionListProps {
    transactions: TransactionWithCategoryAndReceipts[];
    selectedDate?: Date | null;
    isMobile?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, selectedDate, isMobile }) => {
    const filteredTransactions = selectedDate
        ? transactions.filter(tx => isSameDay(new Date(tx.date), selectedDate))
        : transactions;

    // Group by date
    const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
        const dateStr = format(new Date(tx.date), "yyyy-MM-dd");
        if (!groups[dateStr]) groups[dateStr] = [];
        groups[dateStr].push(tx);
        return groups;
    }, {} as Record<string, TransactionWithCategoryAndReceipts[]>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
                <Receipt size={48} className="opacity-20" />
                <p className="text-lg">Không tìm thấy giao dịch</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {sortedDates.map((dateStr) => (
                <div key={dateStr} className="space-y-4">
                    <div className="flex items-center justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur-sm py-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {isMobile
                                ? format(new Date(dateStr), "EEEEEE, dd/MM/yyyy", { locale: vi })
                                : format(new Date(dateStr), "EEEE, d MMMM yyyy", { locale: vi })}
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                            {groupedTransactions[dateStr].length} mục
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {groupedTransactions[dateStr].map((tx: TransactionWithCategoryAndReceipts) => (
                            <Link
                                key={tx.id}
                                href={`/transactions/${tx.id}`}
                                className={cn(
                                    "group flex items-center justify-between bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20",
                                    isMobile ? "p-2.5 gap-2" : "p-4 gap-4"
                                )}
                            >
                                <div className={cn("flex items-center", isMobile ? "gap-2" : "gap-4")}>
                                    <div className={cn(
                                        "rounded-xl flex items-center justify-center shrink-0",
                                        tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500",
                                        isMobile ? "p-2" : "p-3"
                                    )}>
                                        <IconRenderer name={tx.category.icon || "Tag"} size={isMobile ? 22 : 28} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-xs md:text-base truncate">
                                            {tx.category.name}
                                        </h4>
                                        <p className="text-[10px] md:text-sm text-slate-500 truncate max-w-[80px] sm:max-w-[200px]">
                                            {tx.description || "Không có mô tả"}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn("flex items-center", isMobile ? "gap-2" : "gap-6")}>
                                    <div className="text-right min-w-0">
                                        <p className={cn(
                                            "font-bold truncate",
                                            tx.type === "INCOME" ? "text-emerald-500" : "text-white",
                                            isMobile ? "text-sm" : "text-base md:text-lg"
                                        )}>
                                            {tx.type === "INCOME" ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")}₫
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                            {tx.receipts.length > 0 && <Receipt size={isMobile ? 10 : 12} className="text-slate-500" />}
                                            <span className="text-[8px] md:text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                                                {tx.type === "INCOME" ? "Thu nhập" : "Chi phí"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={isMobile ? 14 : 18} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))
            }
        </div >
    );
};

export default TransactionList;
