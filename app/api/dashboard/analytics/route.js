import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function GET(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const siteId = searchParams.get('siteId');

        const analytics = await dbManager.getAnalyticsSummary(auth.companyId, siteId);
        
        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
