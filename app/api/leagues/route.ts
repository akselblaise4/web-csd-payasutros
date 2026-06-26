import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/dal/liga-b';

export async function GET() {
  try {
    const data = await getLeagues();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Leagues] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
