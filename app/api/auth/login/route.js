import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // 1. Find User
        const user = await dbManager.getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Verify Password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Generate Token
        const token = await createToken({
            userId: user._id.toString(),
            companyId: user.companyId.toString(),
            role: user.role
        });

        const response = NextResponse.json({ 
            success: true,
            user: { name: user.name, email: user.email, role: user.role }
        });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24
        });

        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
