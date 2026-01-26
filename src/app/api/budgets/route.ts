import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const budgets = await prisma.budget.findMany({
            include: {
                category: true,
            },
        });

        // Calculate usage for each budget (based on current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const budgetsWithUsage = await Promise.all(
            budgets.map(async (budget) => {
                const transactions = await prisma.transaction.aggregate({
                    where: {
                        categoryId: budget.categoryId,
                        date: { gte: startOfMonth, lte: endOfMonth },
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
