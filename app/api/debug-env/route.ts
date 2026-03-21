import { NextResponse } from "next/server";
import { stat, readdir } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const p = searchParams.get('path');
    
    return NextResponse.json({
        cwd: process.cwd(),
        envUploadDir: process.env.UPLOAD_DIR || 'not set',
        __dirname: __dirname,
    });
}
