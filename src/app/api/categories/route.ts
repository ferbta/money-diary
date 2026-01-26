import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CategoryType } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") as CategoryType | null;

        const categories = await prisma.category.findMany({
            where: type ? { type } : {},
            orderBy: { name: "asc" },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, type, icon } = body;

        if (!name || !type) {
            return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name, type, icon },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create category:", error);
        return NextResponse.json({
            error: "Failed to create category",
            details: error.message
        }, { status: 500 });
    }
}
