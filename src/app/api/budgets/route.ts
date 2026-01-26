import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month") || new Date().getMonth().toString()) + (searchParams.get("month") ? 0 : 1);
        const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

        // Calculate start and end date for usage calculation
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const budgets = await prisma.budget.findMany({
            where: {
                month: month,
                year: year
            },
            include: {
                category: true,
            },
        });

        const budgetsWithUsage = await Promise.all(
            budgets.map(async (budget) => {
                const transactions = await prisma.transaction.aggregate({
                    where: {
                        categoryId: budget.categoryId,
                        date: { gte: startDate, lte: endDate },
                    },
                    _sum: { amount: true },
                });

                return {
                    ...budget,
                    usedAmount: transactions._sum.amount || 0,
                };
            })
        );

        return NextResponse.json(budgetsWithUsage);
    } catch (error) {
        console.error("Failed to fetch budgets:", error);
        return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { categoryId, amount, month, year } = body;

        if (!categoryId || amount === undefined || !month || !year) {
            return NextResponse.json({ error: "Category ID, amount, month, and year are required" }, { status: 400 });
        }

        const budget = await prisma.budget.upsert({
            where: {
                categoryId_month_year: {
                    categoryId,
                    month,
                    year
                }
            },
            update: { amount: parseFloat(amount) },
            create: {
                categoryId,
                amount: parseFloat(amount),
                month,
                year
            },
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error("Failed to set budget:", error);
        return NextResponse.json({ error: "Failed to set budget" }, { status: 500 });
    }
}
