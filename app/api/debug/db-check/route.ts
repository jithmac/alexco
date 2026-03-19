import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("🔍 Checking database connection...");

        // 1. Check if we can run a simple query
        const startTime = Date.now();
        const productsCount = await query("SELECT COUNT(*) as count FROM products") as any[];
        const duration = Date.now() - startTime;

        // 2. Get some env info (carefully masked)
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

        return NextResponse.json({
            status: 'ok',
            message: 'Database connection successful',
            latency: `${duration}ms`,
            summary: {
                products_count: productsCount[0]?.count || 0,
                database_url_configured: !!process.env.DATABASE_URL,
                connection_string: maskedUrl,
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("❌ Database check failed:", error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            code: error.code,
            details: error.sqlMessage || 'No SQL message',
            database_url_configured: !!process.env.DATABASE_URL
        }, { status: 500 });
    }
}
