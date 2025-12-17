import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/questions/generate-title
 * Gemini 2.0 Flash API를 사용하여 질문의 간단한 제목을 자동 생성
 */
export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: '질문 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Gemini 2.0 Flash API 호출 - 간단한 제목 생성
    const prompt = `다음 질문 내용을 바탕으로 간단하고 명확한 제목을 만들어주세요.

질문 내용:
${question}

요구사항:
- 50자 이내로 간결하게
- 질문의 핵심을 담아야 함
- 마크다운이나 특수문자 없이 순수 텍스트만
- 제목만 답변해주세요 (설명 없이)`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API 오류:', errorData);
      return NextResponse.json(
        { error: '제목 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    let title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!title) {
      // 폴백: 질문의 첫 50자 사용
      title = question.substring(0, 50).trim();
    } else {
      // 마크다운 제거 및 정리
      title = title
        .replace(/^#+\s*/, '') // 마크다운 헤더 제거
        .replace(/\*\*/g, '') // 볼드 제거
        .replace(/\*/g, '') // 이탤릭 제거
        .replace(/`/g, '') // 코드 블록 제거
        .trim();
      
      // 50자 제한
      if (title.length > 50) {
        title = title.substring(0, 50).trim();
      }
    }

    return NextResponse.json({
      title,
    });
  } catch (error) {
    console.error('제목 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}




