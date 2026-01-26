import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                category: true,
                receipts: true,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Failed to fetch transaction:", error);
        return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { amount, type, date, description, categoryId, receipts } = body;

        // Delete existing receipts and create new ones if provided
        // This is a simple approach; in production, you might want to compare and only delete/add what's changed.
        if (receipts) {
            await prisma.receipt.deleteMany({
                where: { transactionId: id },
            });
        }

        const transaction = await prisma.transaction.update({
            where: { id },
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

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Failed to update transaction:", error);
        return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.transaction.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete transaction:", error);
        return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}
