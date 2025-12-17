import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// JSONContent를 텍스트로 변환하는 함수
function jsonContentToText(content: any): string {
  if (!content) return '';
  
  // 문자열인 경우 그대로 반환
  if (typeof content === 'string') {
    return content;
  }
  
  // JSONContent인 경우 재귀적으로 텍스트 추출
  if (typeof content === 'object') {
    if (content.type === 'doc' && content.content) {
      return extractTextFromContent(content.content);
    }
    if (content.content) {
      return extractTextFromContent(content.content);
    }
  }
  
  return '';
}

function extractTextFromContent(content: any[]): string {
  if (!Array.isArray(content)) return '';
  
  return content.map((node: any) => {
    if (node.type === 'text' && node.text) {
      return node.text;
    }
    if (node.type === 'paragraph' && node.content) {
      return extractTextFromContent(node.content) + '\n\n';
    }
    if (node.type === 'heading' && node.content) {
      const level = node.attrs?.level || 1;
      const prefix = '#'.repeat(level) + ' ';
      return prefix + extractTextFromContent(node.content) + '\n\n';
    }
    if (node.type === 'bulletList' || node.type === 'orderedList') {
      return extractTextFromContent(node.content) + '\n';
    }
    if (node.type === 'listItem' && node.content) {
      return '- ' + extractTextFromContent(node.content).trim() + '\n';
    }
    if (node.type === 'hardBreak') {
      return '\n';
    }
    if (node.content) {
      return extractTextFromContent(node.content);
    }
    return '';
  }).join('');
}

export async function GET(request: NextRequest) {
  try {
    console.log('질문 데이터를 가져오는 중...');
    
    // 모든 질문 가져오기 (답변이 있는 것만)
    const { data: questions, error } = await supabaseAdmin
      .from('modu_questions')
      .select(`
        id,
        title,
        content,
        answer_gemini,
        answer_gpt,
        answer,
        primary_topic,
        secondary_topics,
        intent,
        like_count,
        gemini_like_count,
        gpt_like_count,
        created_at,
        event:modu_events(title, slug)
      `)
      .or('answer_gemini.not.is.null,answer_gpt.not.is.null,answer.not.is.null')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: '답변이 있는 질문이 없습니다.' }, { status: 404 });
    }

    console.log(`총 ${questions.length}개의 질문을 찾았습니다.`);

    // 마크다운 생성
    let markdown = `# 질문과 답변 모음\n\n`;
    markdown += `생성일: ${new Date().toLocaleString('ko-KR')}\n`;
    markdown += `총 질문 수: ${questions.length}개\n\n`;
    markdown += `---\n\n`;

    questions.forEach((question: any, index) => {
      const questionNum = index + 1;
      const eventTitle = (question.event && typeof question.event === 'object' && !Array.isArray(question.event)) 
        ? question.event.title 
        : '알 수 없음';
      
      markdown += `## 질문 ${questionNum}: ${question.title}\n\n`;
      markdown += `**이벤트:** ${eventTitle}\n\n`;
      
      // 태그 정보
      if (question.primary_topic || question.secondary_topics || question.intent) {
        markdown += `**태그:** `;
        const tags: string[] = [];
        if (question.primary_topic && question.primary_topic !== 'none') {
          tags.push(`주제: ${question.primary_topic}`);
        }
        if (question.secondary_topics && question.secondary_topics.length > 0) {
          const secondary = question.secondary_topics.filter((t: string) => t !== 'none' && t !== question.primary_topic);
          if (secondary.length > 0) {
            tags.push(`부주제: ${secondary.join(', ')}`);
          }
        }
        if (question.intent && question.intent !== 'other') {
          tags.push(`의도: ${question.intent}`);
        }
        markdown += tags.join(' | ') + '\n\n';
      }
      
      markdown += `**좋아요:** ${question.like_count || 0}개`;
      if (question.gemini_like_count || question.gpt_like_count) {
        markdown += ` (Gemini: ${question.gemini_like_count || 0}, GPT: ${question.gpt_like_count || 0})`;
      }
      markdown += `\n\n`;
      markdown += `**작성일:** ${new Date(question.created_at).toLocaleString('ko-KR')}\n\n`;
      
      markdown += `### 질문 내용\n\n`;
      const questionContent = jsonContentToText(question.content);
      markdown += questionContent + '\n\n';
      
      markdown += `---\n\n`;
      
      // 답변 섹션
      let hasAnswer = false;
      
      // Expert Answer
      if (question.answer) {
        hasAnswer = true;
        markdown += `### 💬 Expert Answer (전문가 답변)\n\n`;
        const expertAnswer = jsonContentToText(question.answer);
        markdown += expertAnswer + '\n\n';
        markdown += `---\n\n`;
      }
      
      // Gemini Answer
      if (question.answer_gemini) {
        hasAnswer = true;
        markdown += `### ✨ Gemini (gemini 3.0 pro)\n\n`;
        if (question.gemini_like_count) {
          markdown += `**좋아요:** ${question.gemini_like_count}개\n\n`;
        }
        const geminiAnswer = jsonContentToText(question.answer_gemini);
        markdown += geminiAnswer + '\n\n';
        markdown += `---\n\n`;
      }
      
      // GPT Answer
      if (question.answer_gpt) {
        hasAnswer = true;
        markdown += `### 🤖 ChatGPT (gpt-5.2-thinking)\n\n`;
        if (question.gpt_like_count) {
          markdown += `**좋아요:** ${question.gpt_like_count}개\n\n`;
        }
        const gptAnswer = jsonContentToText(question.answer_gpt);
        markdown += gptAnswer + '\n\n';
        markdown += `---\n\n`;
      }
      
      if (!hasAnswer) {
        markdown += `*답변이 없습니다.*\n\n`;
        markdown += `---\n\n`;
      }
      
      markdown += `\n\n`;
    });

    // 마크다운을 파일로 저장하거나 응답으로 반환
    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="질문답변모음_${new Date().toISOString().split('T')[0]}.md"`,
      },
    });
    
  } catch (error: any) {
    console.error('오류 발생:', error);
    return NextResponse.json(
      { error: error.message || '마크다운 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
