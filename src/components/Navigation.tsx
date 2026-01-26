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
    Menu,
    X
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
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic">
                            FinFlow
                        </h1>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
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
                                    onClick={() => setIsOpen(false)}
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
        </>
    );
};

export default Navigation;
