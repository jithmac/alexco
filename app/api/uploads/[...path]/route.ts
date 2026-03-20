import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Determine content type manually if mime is missing
function getContentType(ext: string): string {
    const map: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.jfif': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm'
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathSegments } = await params;
        const filePath = path.join(process.cwd(), "storage/uploads", ...pathSegments);

        // Security check: ensure path is within storage/uploads
        const uploadsDir = path.join(process.cwd(), "storage/uploads");
        if (!filePath.startsWith(uploadsDir)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Check file exists
        await stat(filePath);

        // Read file
        const fileBuffer = await readFile(filePath);

        const ext = path.extname(filePath);
        const contentType = getContentType(ext);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable" // aggressive caching once served
            }
        });

    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return new NextResponse("File Not Found", { status: 404 });
        }
        console.error("Error serving uploaded file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
