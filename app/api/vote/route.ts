import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { question_id, voter_key, user_id } = await request.json();

    if (!question_id || !voter_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already voted
    const voteQuery = supabase.from('modu_votes').select('id');
    
    if (user_id) {
      voteQuery.eq('user_id', user_id).eq('question_id', question_id);
    } else {
      voteQuery.eq('session_id', voter_key).eq('question_id', question_id);
    }

    const { data: existingVotes } = await voteQuery;

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Insert vote
    const { error: insertError } = await supabase.from('modu_votes').insert({
      question_id,
      user_id: user_id || null,
      session_id: voter_key,
    });

    if (insertError) {
      console.error('Vote insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Get updated vote count
    const { data: question, error: questionError } = await supabase
      .from('modu_questions')
      .select('vote_count')
      .eq('id', question_id)
      .single();

    if (questionError) {
      console.error('Question fetch error:', questionError);
      return NextResponse.json({ error: questionError.message }, { status: 500 });
    }

    // Update vote_count (using RPC function if available, otherwise direct update)
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('modu_questions')
      .update({ vote_count: (question.vote_count || 0) + 1 })
      .eq('id', question_id)
      .select('vote_count')
      .single();

    if (updateError) {
      console.error('Vote count update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ vote_count: updatedQuestion.vote_count });
  } catch (error: any) {
    console.error('Vote API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

