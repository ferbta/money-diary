import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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
            startDate = new Date(parseInt(year), 0, 1);
            endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        }

        const budgets = await prisma.budget.findMany({
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
        const { categoryId, amount } = body;

        if (!categoryId || amount === undefined) {
            return NextResponse.json({ error: "Category ID and amount are required" }, { status: 400 });
        }

        const budget = await prisma.budget.upsert({
            where: { categoryId },
            update: { amount: parseFloat(amount) },
            create: {
                categoryId,
                amount: parseFloat(amount),
            },
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error("Failed to set budget:", error);
        return NextResponse.json({ error: "Failed to set budget" }, { status: 500 });
    }
}
