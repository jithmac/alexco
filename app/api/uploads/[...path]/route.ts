import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

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
        const uploadsBaseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage/uploads");
        const filePath = path.join(uploadsBaseDir, ...pathSegments);
        console.log(`[Uploads GET] Request for pathSegments: ${JSON.stringify(pathSegments)}`);
        console.log(`[Uploads GET] Resolved filePath: ${filePath}`);

        // Security check: ensure path is within storage/uploads
        if (!filePath.startsWith(uploadsBaseDir)) {
            console.warn(`[Uploads GET] Security check failed for: ${filePath}`);
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Check file exists
        await stat(filePath);
        console.log(`[Uploads GET] File stat successful.`);

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
            const { path: pathSegments } = await params.catch(() => ({ path: [] }));
            const uploadsBaseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage/uploads");
            console.error(`[Uploads GET] ENOENT File Not Found error for pathSegments: ${JSON.stringify(pathSegments)}. BaseDir was: ${uploadsBaseDir}. Full attempted path: ${path.join(uploadsBaseDir, ...(pathSegments || []))}`);
            return new NextResponse("File Not Found", { status: 404 });
        }
        console.error("[Uploads GET] Error serving uploaded file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
