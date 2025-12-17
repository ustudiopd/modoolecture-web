import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/admin/events/[id]
 * 이벤트 조회 (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { data, error } = await supabaseAdmin
      .from('modu_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('이벤트 조회 실패:', { error, id, errorCode: error.code, errorMessage: error.message });
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '이벤트를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: '이벤트를 불러올 수 없습니다.', details: error.message },
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

/**
 * PUT /api/admin/events/[id]
 * 이벤트 수정 (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();
    const { slug, title, event_date, status, notebooklm_url } = body;

    // 업데이트할 필드만 구성
    const updateData: any = {};
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (event_date !== undefined) updateData.event_date = event_date;
    if (status !== undefined) updateData.status = status;
    if (notebooklm_url !== undefined) updateData.notebooklm_url = notebooklm_url;

    // slug 변경 시 중복 확인
    if (slug) {
      const { data: existing } = await supabaseAdmin
        .from('modu_events')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: '이미 존재하는 slug입니다.' },
          { status: 400 }
        );
      }
    }

    // 이벤트 수정
    const { data, error } = await supabaseAdmin
      .from('modu_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '이벤트를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('이벤트 수정 실패:', error);
      return NextResponse.json(
        { error: '이벤트 수정에 실패했습니다.' },
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

/**
 * DELETE /api/admin/events/[id]
 * 이벤트 삭제 (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { error } = await supabaseAdmin
      .from('modu_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('이벤트 삭제 실패:', error);
      return NextResponse.json(
        { error: '이벤트 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


