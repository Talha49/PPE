import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { dbManager } from '@/lib/db_manager';

export async function GET(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await dbManager.getUserByEmail(auth.email || ''); // Assuming email is in payload or logic to fetch user
        // For now, return what's in the token + any DB additions
        return NextResponse.json({
            id: auth.userId,
            companyId: auth.companyId,
            role: auth.role,
            name: user?.name || 'Site Manager',
            email: user?.email
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
