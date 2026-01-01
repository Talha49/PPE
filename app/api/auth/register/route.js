import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const { email, password, name, companyName } = await req.json();

        // 1. Basic validation
        if (!email || !password || !name || !companyName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Check if user already exists
        const existing = await dbManager.getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // 3. Create Company First
        const companyResult = await dbManager.createCompany({ name: companyName });
        const companyId = companyResult.insertedId;

        // 4. Hash password and create User
        const hashedPassword = await bcrypt.hash(password, 12);
        const userResult = await dbManager.createUser({
            email,
            password: hashedPassword,
            name,
            role: 'admin',
            companyId
        });

        // 5. Generate token for immediate login
        const token = await createToken({
            userId: userResult.insertedId.toString(),
            companyId: companyId.toString(),
            role: 'admin'
        });

        const response = NextResponse.json({ 
            success: true, 
            message: 'Organization created successfully' 
        }, { status: 201 });

        // HTTP-Only cookie for security
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
