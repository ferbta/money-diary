import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year") || new Date().getFullYear().toString();

        let startDate: Date;
        let endDate: Date;

        if (month) {
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        } else {
            // Full year
            startDate = new Date(parseInt(year), 0, 1);
            endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        }

        // 1. Monthly Trends (Income vs Expense)
        const transactions = await prisma.transaction.findMany({
            where: {
                date: { gte: startDate, lte: endDate },
            },
        });

        const monthlyData: any = {};
        if (month) {
            // Just one month broken down by day or just a summary
            monthlyData[month] = { income: 0, expense: 0 };
        } else {
            // Initialize all months
            for (let i = 1; i <= 12; i++) {
                monthlyData[i] = { income: 0, expense: 0 };
            }
        }

        transactions.forEach((tx) => {
            const txMonth = tx.date.getMonth() + 1;
            if (tx.type === TransactionType.INCOME) {
                monthlyData[txMonth].income += tx.amount;
            } else {
                monthlyData[txMonth].expense += tx.amount;
            }
        });

        const monthlyTrendArray = Object.keys(monthlyData).map((m) => ({
            month: m,
            income: monthlyData[m].income,
            expense: monthlyData[m].expense,
        }));

        // 2. Category Breakdown
        const categoryAggregation = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                date: { gte: startDate, lte: endDate },
                type: TransactionType.EXPENSE, // Usually breakdown expesnes
            },
            _sum: { amount: true },
        });

        const categories = await prisma.category.findMany({
            where: { id: { in: categoryAggregation.map((a) => a.categoryId) } },
        });

        const categoryBreakdown = categoryAggregation.map((agg) => {
            const category = categories.find((c) => c.id === agg.categoryId);
            return {
                id: category?.id,
                category: category?.name || "Unknown",
                amount: agg._sum.amount || 0,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for chart
            };
        });

        return NextResponse.json({
            monthlyTrend: monthlyTrendArray,
            categoryBreakdown,
        });
    } catch (error) {
        console.error("Failed to generate report:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
