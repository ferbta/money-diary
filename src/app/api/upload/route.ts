import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { file } = body;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const public_id = await uploadImage(file);

        return NextResponse.json({ public_id });
    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
