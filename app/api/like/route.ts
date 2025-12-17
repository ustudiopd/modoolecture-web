import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { question_id, session_id, user_id } = await request.json();

    if (!question_id || !session_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already liked (user_id or session_id)
    const likeQuery = supabase.from('modu_likes').select('id');
    
    if (user_id) {
      likeQuery.eq('user_id', user_id).eq('question_id', question_id);
    } else {
      likeQuery.eq('session_id', session_id).eq('question_id', question_id);
    }

    const { data: existingLikes } = await likeQuery;

    if (existingLikes && existingLikes.length > 0) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Insert like (트리거가 자동으로 like_count를 증가시킴)
    const { error: insertError } = await supabase.from('modu_likes').insert({
      question_id,
      user_id: user_id || null,
      session_id,
    });

    if (insertError) {
      console.error('Like insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Get updated like count
    const { data: question, error: questionError } = await supabase
      .from('modu_questions')
      .select('like_count')
      .eq('id', question_id)
      .single();

    if (questionError) {
      console.error('Question fetch error:', questionError);
      return NextResponse.json({ error: questionError.message }, { status: 500 });
    }

    return NextResponse.json({ like_count: question.like_count || 0 });
  } catch (error: any) {
    console.error('Like API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}




