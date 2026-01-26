import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, type } = body;

        const category = await prisma.category.update({
            where: { id },
            data: { name, type },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Failed to update category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if category has transactions
        const transactionCount = await prisma.transaction.count({
            where: { categoryId: id },
        });

        if (transactionCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with existing transactions" },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}
