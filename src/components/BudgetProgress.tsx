"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertTriangle } from "lucide-react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BudgetProgressProps {
    category: string;
    limit: number;
    used: number;
    onClick?: () => void;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ category, limit, used, onClick }) => {
    const percentage = Math.min((used / limit) * 100, 100);
    const remaining = limit - used;
    const isOver = used > limit;

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all",
                onClick && "cursor-pointer hover:bg-slate-900/60 active:scale-[0.98] group"
            )}
        >
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{category}</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">{used.toLocaleString("vi-VN")}₫</span>
                        <span className="text-slate-600 text-sm font-medium">trên {limit.toLocaleString("vi-VN")}₫</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md border flex items-center gap-1",
                        isOver ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                        {isOver ? <AlertTriangle size={26} /> : `Còn ${Math.round(100 - percentage)}%`}
                    </span>
                </div>
            </div>

            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div
                    className={cn(
                        "h-full transition-all duration-1000 ease-out",
                        isOver ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-500">
                <span>Đã dùng: {used.toLocaleString("vi-VN")}₫</span>
                <span className={isOver ? "text-rose-500" : "text-emerald-500"}>
                    {isOver ? `Vượt hạn mức ${Math.abs(remaining).toLocaleString("vi-VN")}₫` : `Còn lại: ${remaining.toLocaleString("vi-VN")}₫`}
                </span>
            </div>
        </div>
    );
};

export default BudgetProgress;
