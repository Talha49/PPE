import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function GET(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const siteId = req.nextUrl.searchParams.get('siteId');
    if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 });

    try {
        const cameras = await dbManager.getCamerasBySite(siteId);
        return NextResponse.json(cameras);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
    }
}

export async function POST(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, siteId, sourceType, streamUrl } = await req.json();
        
        if (!name || !siteId) {
            return NextResponse.json({ error: 'Name and SiteId are required' }, { status: 400 });
        }

        const result = await dbManager.createCamera({
            name,
            siteId,
            sourceType,
            streamUrl,
            companyId: auth.companyId
        });

        return NextResponse.json({ success: true, id: result.insertedId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create camera' }, { status: 500 });
    }
}
