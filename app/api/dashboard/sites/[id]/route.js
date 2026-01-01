import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function PATCH(req, { params }) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const data = await req.json();
        
        const result = await dbManager.updateSite(id, data);
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Site not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        await dbManager.deleteSite(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
    }
}
