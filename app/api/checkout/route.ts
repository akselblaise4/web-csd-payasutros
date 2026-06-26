import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutPreference, CreatePreferenceSchema } from '@/lib/dal/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Capa 5: safeParse runtime validation
    const parsed = CreatePreferenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const checkout = await createCheckoutPreference(parsed.data);
    return NextResponse.json(checkout);
  } catch (error) {
    console.error('[API Checkout] Error:', error);
    // Generic error to client
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
