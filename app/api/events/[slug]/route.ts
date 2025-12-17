import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/events/[slug]
 * 이벤트 상세 조회 (Public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const { data, error } = await supabase
      .from('modu_events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '이벤트를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('이벤트 조회 실패:', error);
      return NextResponse.json(
        { error: '이벤트를 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


