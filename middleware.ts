import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'alexco-secret-key-change-in-production'
);

// Routes that require authentication
const PROTECTED_ROUTES = ['/paths'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route needs protection
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Verify token using jose (Edge-compatible)
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userRole = payload.role as string;

        // Note: Permission-based access control is now handled at the page/component level
        // via getCurrentUser().permissions checks in the AdminLayout and route handlers.
        // The middleware only verifies the user is authenticated.

        // Add user info to request headers for downstream use
        const response = NextResponse.next();
        response.headers.set('x-user-id', payload.userId as string);
        response.headers.set('x-user-role', userRole);
        return response;

    } catch (error) {
        // Invalid token - redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

export const config = {
    matcher: ['/paths/:path*'],
};

