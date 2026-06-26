import { NextRequest, NextResponse } from 'next/server';
import { getMatchDays } from '@/lib/dal/liga-b';
import { z } from 'zod';

const ParamsSchema = z.object({
  stageId: z.coerce.number().int().positive(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }

  try {
    const data = await getMatchDays(parsed.data.stageId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API MatchDays] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
