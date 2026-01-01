import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function GET(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const sites = await dbManager.getSitesByCompany(auth.companyId);
        return NextResponse.json(sites);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
    }
}

export async function POST(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, address } = await req.json();
        if (!name) return NextResponse.json({ error: 'Site name is required' }, { status: 400 });

        const result = await dbManager.createSite({
            name,
            address,
            companyId: auth.companyId
        });

        return NextResponse.json({ success: true, id: result.insertedId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
    }
}
