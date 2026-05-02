import { NextRequest, NextResponse } from 'next/server';
import { Log } from '@/logging_middleware';

const BASE_URL = 'http://20.207.122.201/evaluation-service';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now() / 1000;
  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  await Log('frontend', 'info', 'auth', 'Fetching new auth token for notifications API route');

  const res = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    await Log('frontend', 'error', 'auth', `Auth failed with status ${res.status}`);
    throw new Error('Auth failed');
  }

  const data = await res.json();
  // expires_in is an absolute Unix timestamp from this server
  cachedToken = { token: data.access_token, expiresAt: data.expires_in };
  await Log('frontend', 'info', 'auth', 'Auth token obtained and cached');
  return data.access_token;
}

export async function GET(req: NextRequest) {
  await Log('frontend', 'info', 'api', 'GET /api/notifications called');

  try {
    const { searchParams } = new URL(req.url);
    const token = await getToken();

    const upstream = new URL(`${BASE_URL}/notifications`);
    ['limit', 'page', 'notification_type'].forEach(k => {
      const v = searchParams.get(k);
      if (v) upstream.searchParams.set(k, v);
    });

    await Log('frontend', 'debug', 'api', `Proxying to: ${upstream.toString()}`);

    const res = await fetch(upstream.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      await Log('frontend', 'error', 'api', `Upstream notifications API returned ${res.status}`);
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status });
    }

    const data = await res.json();
    await Log('frontend', 'info', 'api', `Fetched ${data.notifications?.length ?? 0} notifications`);
    return NextResponse.json(data);
  } catch (error) {
    await Log('frontend', 'error', 'api', `Notifications fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
