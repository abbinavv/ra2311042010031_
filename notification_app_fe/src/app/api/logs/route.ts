import { NextRequest, NextResponse } from 'next/server';
import { Log } from '@/logging_middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stack, level, package: pkg, message } = body;
    await Log(stack, level, pkg, message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
