import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * PUT /api/admin/questions/[id]/answers
 * 답변 저장 (2슬롯: Gemini/GPT) (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    const body = await request.json();
    const { answer_gemini, answer_gpt } = body;

    // 업데이트할 필드만 구성
    const updateData: any = {};
    if (answer_gemini !== undefined) updateData.answer_gemini = answer_gemini;
    if (answer_gpt !== undefined) updateData.answer_gpt = answer_gpt;

    // 답변 저장
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
      console.error('답변 저장 실패:', error);
      return NextResponse.json(
        { error: '답변 저장에 실패했습니다.' },
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


