"use client";

import React from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DashboardSummaryProps {
    income: number;
    expense: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ income, expense }) => {
    const balance = income - expense;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-xl shadow-blue-900/20 group">
                <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Wallet size={120} />
                </div>
                <div className="relative z-10">
                    <p className="text-blue-100 text-sm font-medium opacity-80 mb-1">Số dư hiện tại</p>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {balance.toLocaleString("vi-VN")}₫
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 w-fit px-3 py-1 rounded-full text-white backdrop-blur-sm border border-white/10">
                        Tổng tài sản
                    </div>
                </div>
            </div>

            {/* Income Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl group hover:border-emerald-500/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Thu nhập tháng</p>
                        <h3 className="text-2xl font-bold text-white">{income.toLocaleString("vi-VN")}₫</h3>
                    </div>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[70%]" /> {/* Mock trend */}
                </div>
            </div>

            {/* Expense Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl group hover:border-rose-500/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Chi tiêu tháng</p>
                        <h3 className="text-2xl font-bold text-white">{expense.toLocaleString("vi-VN")}₫</h3>
                    </div>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[45%]" /> {/* Mock trend */}
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;
