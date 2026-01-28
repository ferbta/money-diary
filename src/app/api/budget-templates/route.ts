import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const templates = await prisma.budgetTemplate.findMany({
            include: {
                category: true,
            },
            orderBy: {
                category: {
                    name: 'asc'
                }
            }
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Failed to fetch budget templates:", error);
        return NextResponse.json({ error: "Failed to fetch budget templates" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templates } = body;

        if (!Array.isArray(templates)) {
            return NextResponse.json({ error: "Templates must be an array" }, { status: 400 });
        }

        // Use transaction to save all templates
        const results = await prisma.$transaction(
            templates.map((template: { categoryId: string; amount: number }) =>
                prisma.budgetTemplate.upsert({
                    where: {
                        categoryId: template.categoryId
                    },
                    update: {
                        amount: parseFloat(template.amount.toString())
                    },
                    create: {
                        categoryId: template.categoryId,
                        amount: parseFloat(template.amount.toString())
                    }
                })
            )
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error("Failed to save budget templates:", error);
        return NextResponse.json({ error: "Failed to save budget templates" }, { status: 500 });
    }
}
