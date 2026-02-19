import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://172.28.16.1:1234';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${LM_STUDIO_URL}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ alive: false, error: `HTTP ${res.status}` });
    }

    const data = await res.json();
    const models = data?.data?.map((m: any) => m.id) || [];

    return NextResponse.json({
      alive: true,
      url: LM_STUDIO_URL,
      models,
      activeModel: models[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      alive: false,
      url: LM_STUDIO_URL,
      error: error.name === 'AbortError' ? 'Timeout' : error.message,
    });
  }
}
