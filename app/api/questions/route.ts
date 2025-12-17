import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/questions
 * 질문 등록 (공개 API)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      author_name,
      author_email,
      title,
      content,
      category,
    } = body;

    // 필수 필드 검증
    if (!event_id || !content) {
      return NextResponse.json(
        { error: 'event_id, content는 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증 (입력된 경우)
    if (author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author_email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이벤트 존재 확인
    const { data: event, error: eventError } = await supabaseAdmin
      .from('modu_events')
      .select('id, status')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: '존재하지 않는 이벤트입니다.' },
        { status: 400 }
      );
    }

    // 이벤트가 닫혀있는지 확인
    if (event.status === 'closed') {
      return NextResponse.json(
        { error: '이 이벤트는 질문 등록이 마감되었습니다.' },
        { status: 400 }
      );
    }

    // title이 없으면 content의 첫 100자를 title로 사용
    const finalTitle = title?.trim() || content.substring(0, 100).trim() || '질문';

    // 질문 생성
    const { data, error } = await supabaseAdmin
      .from('modu_questions')
      .insert({
        event_id,
        title: finalTitle,
        content,
        category: category || null,
        display_name_raw: author_name?.trim() || null,
        author_email: author_email?.trim() || null,
        like_count: 0,
        is_answered: false,
        is_hidden: false,
        source: 'live', // 직접 입력한 질문
      })
      .select()
      .single();

    if (error) {
      console.error('질문 생성 오류:', error);
      return NextResponse.json(
        { error: '질문 등록에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      question: data,
      message: '질문이 등록되었습니다.',
    });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
