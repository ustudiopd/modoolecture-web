import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/admin/questions?event_id=uuid
 * 질문 목록 조회 (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'event_id는 필수입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('modu_questions')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('질문 목록 조회 실패:', error);
      return NextResponse.json(
        { error: '질문 목록을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: data || [] });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/questions
 * 질문 생성 (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      title,
      content,
      category,
      tags,
      display_name_raw,
      display_name_masked,
      // 새로운 태그 필드
      primary_topic,
      secondary_topics,
      intent,
      confidence,
      classified_by,
    } = body;

    // 필수 필드 검증
    if (!event_id || !content) {
      return NextResponse.json(
        { error: 'event_id, content는 필수입니다.' },
        { status: 400 }
      );
    }

    // title이 없으면 content의 첫 100자를 title로 사용
    const finalTitle = title || content.substring(0, 100).trim() || '질문';

    // 이벤트 존재 확인
    const { data: event } = await supabaseAdmin
      .from('modu_events')
      .select('id')
      .eq('id', event_id)
      .single();

    if (!event) {
      return NextResponse.json(
        { error: '존재하지 않는 이벤트입니다.' },
        { status: 400 }
      );
    }

    // 질문 생성
    const { data, error } = await supabaseAdmin
      .from('modu_questions')
      .insert({
        event_id,
        title: finalTitle,
        content,
        category: category || null, // 호환성 유지
        tags: tags || [],
        display_name_raw: display_name_raw || null,
        display_name_masked: display_name_masked || null,
        // 새로운 태그 필드
        primary_topic: primary_topic || null,
        secondary_topics: secondary_topics || [],
        intent: intent || null,
        confidence: confidence || null,
        classified_by: classified_by || null,
        category_version: 1, // 현재 버전
        like_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('질문 생성 실패:', error);
      return NextResponse.json(
        { error: '질문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


