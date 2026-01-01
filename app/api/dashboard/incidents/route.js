import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function POST(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { siteId, cameraId, personId, type, object, zone, status, snapshot, duration } = body;

        if (!siteId || !cameraId || !snapshot) {
            return NextResponse.json({ error: 'Missing critical incident data' }, { status: 400 });
        }

        await dbManager.logIncident({
            companyId: auth.companyId,
            siteId,
            cameraId,
            personId: personId || null,
            type: type || 'PPE_VIOLATION',
            object: object || 'Unknown',
            zone: zone || 'Global',
            status: status || 'VIOLATION',
            snapshot,
            duration: duration || 0
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Incident Logging Error:', error);
        return NextResponse.json({ error: 'Failed to log incident' }, { status: 500 });
    }
}
