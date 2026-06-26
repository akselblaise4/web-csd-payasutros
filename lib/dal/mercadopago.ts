import 'server-only';
import { z } from 'zod';

const MERCADO_PAGO_API = 'https://api.mercadopago.com';

// Schema to validate checkout request payload in server
export const CreatePreferenceSchema = z.object({
  title: z.string().min(3).max(100),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export type CreatePreferenceInput = z.infer<typeof CreatePreferenceSchema>;

export interface PreferenceDTO {
  id: string;
  initPoint: string;
}

export async function createCheckoutPreference(input: CreatePreferenceInput): Promise<PreferenceDTO> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    console.error('[DAL MercadoPago] Access token is missing');
    throw new Error('Payment service configuration error');
  }

  // Double check validation in DAL
  const validated = CreatePreferenceSchema.parse(input);

  try {
    const response = await fetch(`${MERCADO_PAGO_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: validated.title,
            quantity: validated.quantity,
            unit_price: validated.unitPrice,
            currency_id: 'CLP', // Chile Peso for Ley 21.719 context
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/pending`,
        },
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      throw new Error(`Mercado Pago returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Return only sanitized DTO fields to client
    return {
      id: String(data.id),
      initPoint: String(data.init_point),
    };
  } catch (error) {
    console.error('[DAL MercadoPago] Failed to create preference:', error);
    throw new Error('Failed to process payment creation securely');
  }
}
