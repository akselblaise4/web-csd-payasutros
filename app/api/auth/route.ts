import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const AuthSchema = z.object({
  action: z.enum(['login', 'signup', 'signout']),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Capa 5: safeParse runtime validation
    const parsed = AuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { action, email, password } = parsed.data;
    const supabase = createClient();

    if (action === 'signout') {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return NextResponse.json(
          { error: 'Sign out failed' },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    // Email and password are required for login/signup
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Credentials are required' },
        { status: 400 }
      );
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Return a generic security-conscious message (prevents user enumeration)
        return NextResponse.json(
          { error: 'Invalid login credentials' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user.id, email: data.user.email },
      });
    }

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: 'Sign up failed' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
      });
    }

    return NextResponse.json(
      { error: 'Action not supported' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API Auth] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
