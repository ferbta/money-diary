"use client";

import React from "react";
import TransactionList from "@/components/TransactionList";
import { TransactionWithCategoryAndReceipts } from "@/lib/types";
import { Search, Filter, Download, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Link from "next/link";

const TransactionsPage = () => {
    const [transactions, setTransactions] = React.useState<TransactionWithCategoryAndReceipts[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("/api/transactions");
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(tx =>
        tx.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Transaction History</h1>
                    <p className="text-slate-400 mt-1">A detailed list of all your financial activities</p>
                </div>
                <Link href="/transactions/new">
                    <Button className="flex items-center gap-2">
                        <Plus size={18} />
                        Add New
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by category or description..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download size={18} />
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 min-h-[600px] shadow-xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 bg-slate-800 rounded-full mb-4" />
                        <div className="h-4 w-32 bg-slate-800 rounded mb-2" />
                        <div className="h-3 w-48 bg-slate-800 rounded" />
                    </div>
                ) : (
                    <TransactionList transactions={filteredTransactions} />
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
