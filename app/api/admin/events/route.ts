import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/admin/events
 * 이벤트 생성 (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, title, event_date, status, notebooklm_url } = body;

    // 필수 필드 검증
    if (!slug || !title) {
      return NextResponse.json(
        { error: 'slug와 title은 필수입니다.' },
        { status: 400 }
      );
    }

    // slug 중복 확인
    const { data: existing } = await supabaseAdmin
      .from('modu_events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 slug입니다.' },
        { status: 400 }
      );
    }

    // 날짜 형식 변환 (YYYY-MM-DD -> ISO 8601)
    let formattedDate = null;
    if (event_date) {
      try {
        // YYYY-MM-DD 형식을 ISO 8601로 변환
        const date = new Date(event_date);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString();
        }
      } catch (e) {
        console.error('날짜 형식 변환 실패:', e);
      }
    }

    // 이벤트 생성
    const { data, error } = await supabaseAdmin
      .from('modu_events')
      .insert({
        slug,
        title,
        event_date: formattedDate,
        status: status || 'open',
        notebooklm_url: notebooklm_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('이벤트 생성 실패:', error);
      return NextResponse.json(
        { 
          error: '이벤트 생성에 실패했습니다.',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

