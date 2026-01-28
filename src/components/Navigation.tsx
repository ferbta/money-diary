"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Tags,
    Wallet,
    BarChart3,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Giao dịch", href: "/transactions", icon: ArrowLeftRight },
    { name: "Danh mục", href: "/categories", icon: Tags },
    { name: "Ngân sách", href: "/budgets", icon: Wallet },
    { name: "Báo cáo", href: "/reports", icon: BarChart3 },
];

const Navigation = () => {
    const pathname = usePathname();

    return (
        <>
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800">
                <div className="flex flex-col h-full">
                    <Link href="/dashboard" className="p-8 pb-4 flex items-center gap-4 group">
                        <div className="shrink-0 w-14 h-14 rounded-[1.25rem] overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic leading-tight">
                            Quản lý tài chính
                        </h1>
                    </Link>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "transition-colors",
                                        isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                    )} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                JD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Người dùng</p>
                                <p className="text-xs text-slate-500 truncate">Gói cao cấp</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Top Navigation for Mobile (Logo) */}
            <header className="lg:hidden sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 p-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic">
                        Quản lý tài chính
                    </h1>
                </Link>
            </header>

            {/* Bottom Navigation for Mobile/Tablet */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                                isActive ? "text-blue-400" : "text-slate-500"
                            )}
                        >
                            <item.icon size={22} className={cn(
                                "transition-colors",
                                isActive ? "text-blue-400" : "text-slate-500"
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Navigation;
