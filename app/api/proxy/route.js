import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Device responded with ${response.status}`);
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    const isLocal = targetUrl.includes('192.168.') || targetUrl.includes('10.') || targetUrl.includes('127.0.0.1');
    
    console.error(`Proxy failure for ${targetUrl}:`, error.message);

    // If we are in the cloud and trying to reach a local IP, it's a guaranteed failure.
    // We return a "Gateway Timeout" (504) which is technically accurate for a cloud-to-local barrier.
    return new NextResponse(JSON.stringify({ 
      error: 'NETWORK_BARRIER',
      message: isTimeout ? 'Connection Timed Out' : error.message,
      isLocalBarrier: isLocal && !process.env.VERCEL_URL?.includes('localhost')
    }), { 
      status: 504,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
