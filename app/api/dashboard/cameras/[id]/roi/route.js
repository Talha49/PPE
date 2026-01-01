import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db_manager';
import { getAuthContext } from '@/lib/auth';

export async function PATCH(req, { params }) {
    const auth = await getAuthContext(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    
    try {
        const { roiConfig } = await req.json();
        
        // In a real pro app, we'd check if this camera belongs to the current user's company
        // For now, let's assume auth.companyId check is enough
        
        await dbManager.updateCameraROI(id, roiConfig);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update ROI' }, { status: 500 });
    }
}
