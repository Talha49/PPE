import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ppe_saas');
        
        // ping the database to verify connection
        await db.command({ ping: 1 });
        
        return NextResponse.json({ 
            status: 'online', 
            database: 'connected',
            timestamp: new Date().toISOString()
        }, { status: 200 });
        
    } catch (error) {
        console.error('Database Connection Error:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Failed to connect to database',
            error: error.message 
        }, { status: 500 });
    }
}
