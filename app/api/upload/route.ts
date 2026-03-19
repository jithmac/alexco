import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file: File | null = formData.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.replaceAll(" ", "_");

        // Create unique name to prevent collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const uniqueFilename = `${uniqueSuffix}-${filename}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads/products");
        await mkdir(uploadDir, { recursive: true });

        // Write file
        await writeFile(
            path.join(uploadDir, uniqueFilename),
            buffer
        );

        return NextResponse.json({
            success: true,
            url: `/uploads/products/${uniqueFilename}`
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
