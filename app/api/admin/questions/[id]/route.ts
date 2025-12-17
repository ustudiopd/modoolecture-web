import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/admin/questions/[id]
 * 질문 조회 (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { data, error } = await supabaseAdmin
      .from('modu_questions')
      .select(`
        *,
        event:modu_events (
          id,
          title,
          slug
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '질문을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('질문 조회 실패:', error);
      return NextResponse.json(
        { error: '질문을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: data });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/questions/[id]
 * 질문 수정 (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();
    const {
      title,
      content,
      category,
      tags,
      display_name_raw,
      display_name_masked,
      author_email,
    } = body;

    // 업데이트할 필드만 구성
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (display_name_raw !== undefined) updateData.display_name_raw = display_name_raw;
    if (display_name_masked !== undefined) updateData.display_name_masked = display_name_masked;
    if (author_email !== undefined) {
      // 이메일 형식 검증 (입력된 경우)
      if (author_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author_email)) {
        return NextResponse.json(
          { error: '올바른 이메일 형식을 입력해주세요.' },
          { status: 400 }
        );
      }
      updateData.author_email = author_email?.trim() || null;
    }

    // 질문 수정
    const { data, error } = await supabaseAdmin
      .from('modu_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '질문을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('질문 수정 실패:', error);
      return NextResponse.json(
        { error: '질문 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: data });
  } catch (error) {
    console.error('예상치 못한 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * 질문 삭제 (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const { error } = await supabaseAdmin
      .from('modu_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('질문 삭제 실패:', error);
      return NextResponse.json(
        { error: '질문 삭제에 실패했습니다.' },
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

