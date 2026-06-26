import { NextRequest, NextResponse } from 'next/server';
import { getTournaments } from '@/lib/dal/liga-b';
import { z } from 'zod';

const ParamsSchema = z.object({
  leagueId: z.coerce.number().int().positive(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }

  try {
    const data = await getTournaments(parsed.data.leagueId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Tournaments] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
