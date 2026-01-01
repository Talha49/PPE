import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function POST(req) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { siteId, cameraId, detections } = body;

        if (!siteId || !cameraId || !detections) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Process each detection and add auth context
        const promises = detections.map(d => dbManager.logDetection({
            ...d,
            companyId: auth.companyId,
            siteId: siteId,
            cameraId: cameraId
        }));

        await Promise.all(promises);

        return NextResponse.json({ success: true, count: detections.length });
    } catch (error) {
        console.error('Detection Logging Error:', error);
        return NextResponse.json({ error: 'Failed to log detections' }, { status: 500 });
    }
}
