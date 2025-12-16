import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Insert newsletter subscription
    const { error } = await supabase.from('newsletter_subscriptions').insert({
      email,
    });

    if (error) {
      // If duplicate, return success anyway
      if (error.code === '23505') {
        return NextResponse.redirect(new URL('/?subscribed=true', request.url));
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.redirect(new URL('/?subscribed=true', request.url));
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

