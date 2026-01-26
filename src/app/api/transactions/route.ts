import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const date = searchParams.get("date"); // YYYY-MM-DD
        const categoryId = searchParams.get("categoryId");
        const type = searchParams.get("type");

        let where: any = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (type) {
            where.type = type as TransactionType;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.date = { gte: startOfDay, lte: endOfDay };
        } else if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            where.date = { gte: startOfMonth, lte: endOfMonth };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                category: true,
                receipts: true,
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, type, date, description, categoryId, receipts } = body;

        if (!amount || !type || !date || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type: type as TransactionType,
                date: new Date(date),
                description,
                categoryId,
                receipts: receipts ? {
                    create: receipts.map((publicId: string) => ({ publicId }))
                } : undefined,
            },
            include: {
                category: true,
                receipts: true,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("Failed to create transaction:", error);
        return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}
