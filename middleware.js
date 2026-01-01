import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Public routes that don't need auth
    if (
        pathname === '/' ||
        pathname === '/auth' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/health') ||
        pathname.includes('favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Check for auth token in cookies
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
        // If it's an API request, return 401
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Otherwise redirect to main page/login
        return NextResponse.redirect(new URL('/', req.url));
    }

    try {
        // Verify token (Edge compatible)
        await jwtVerify(token, SECRET);
        return NextResponse.next();
    } catch (err) {
        // Token invalid or expired
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', req.url));
    }
}

// See more usage: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/dashboard/:path*',
    ],
};
