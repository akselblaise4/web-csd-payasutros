import { NextRequest, NextResponse } from 'next/server';
import { getStandings } from '@/lib/dal/liga-b';
import { z } from 'zod';

const ParamsSchema = z.object({
  groupId: z.coerce.number().int().positive(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  // Capa 5: Safe parsing with Zod and generic 400 errors
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  }

  try {
    const data = await getStandings(parsed.data.groupId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Standings] Error:', error);
    // Generic 500 error, never leaking API details or stack traces
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
