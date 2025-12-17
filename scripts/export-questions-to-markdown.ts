/**
 * 질문과 답변을 마크다운 파일로 내보내는 스크립트
 * 
 * 사용법:
 * npx tsx scripts/export-questions-to-markdown.ts
 * 
 * 또는 Node.js 환경에서:
 * node --loader ts-node/esm scripts/export-questions-to-markdown.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function exportQuestionsToMarkdown() {
  try {
    console.log('질문 데이터를 가져오는 중...');
    
    // 모든 질문 가져오기 (답변이 있는 것만)
    const { data: questions, error } = await supabase
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
      console.log('답변이 있는 질문이 없습니다.');
      return;
    }

    console.log(`총 ${questions.length}개의 질문을 찾았습니다.`);

    // 마크다운 생성 - 서두 부분
    let markdown = `# 질문과 답변 모음

## 📖 문서 소개

이 문서는 **2025 AI 결산 질문 보드**에서 수집된 실무자들의 질문에 대해, **ChatGPT (gpt-5.2-thinking)**와 **Gemini (gemini 3.0 pro)** 두 AI 모델이 각각 답변한 결과를 비교 분석할 수 있도록 정리한 자료입니다.

각 질문마다 두 AI의 답변을 나란히 비교함으로써:
- **다양한 관점과 접근 방식**을 동시에 확인할 수 있습니다
- **모델별 특성과 강점**을 파악할 수 있습니다
- **교차 검증을 통한 인사이트**를 얻을 수 있습니다
- **실무에 바로 적용 가능한 구체적인 방법론**을 비교 선택할 수 있습니다

---

## 🏷️ 태그 체계

이 문서의 질문들은 **총 17개의 태그**로 분류되어 있으며, **10개의 토픽 카테고리**와 **6개의 의도 카테고리**로 구성됩니다.

### 📌 토픽 태그 (10개)

1. **시작/입문** (getting_started) - 입문/일반 활용/시작
2. **워크플로/자동화** (workflow_automation) - 실무 적용/자동화/워크플로
3. **프롬프트** (prompting) - 프롬프트/질문법
4. **툴/모델** (tools_models) - 툴/모델 선택·비교·연동
5. **정확도/검증** (accuracy_verification) - 정확도/환각/검증
6. **보안/개인정보** (security_privacy) - 보안/개인정보/사내정책
7. **저작권/윤리** (copyright_ethics) - 저작권/윤리/표절/출처
8. **비용/ROI** (cost_roi) - 비용/구독/ROI
9. **트랜드/러닝/커리어** (trends_learning_career) - 트렌드/학습/미래·커리어
10. **없음** (none) - 무응답/의미없음

### 🎯 의도 태그 (6개)

1. **방법/가이드** (howto) - 방법/가이드 요청
2. **추천/비교** (recommend) - 추천/비교/선택
3. **문제/해결** (troubleshoot) - 문제/불편/장애
4. **설명/이해** (explain) - 개념/원리 이해
5. **전략/전망** (strategy) - 전략/전망/의사결정
6. **기타** (other) - 애매함

각 질문은 **주제(primary_topic)**, **부주제(secondary_topics)**, **의도(intent)**로 태깅되어 있어, 특정 주제나 관심사에 따라 필터링하여 활용할 수 있습니다.

---

## 💡 노트북 LM 활용 가이드

이 문서를 **노트북 LM**에 업로드하여 다음과 같이 활용하시기 바랍니다:

### 1️⃣ 비교 분석 활용

**프롬프트 예시:**
\`\`\`
"워크플로 자동화 관련 질문들을 찾아서, ChatGPT와 Gemini의 답변을 비교 분석해줘. 
두 모델의 접근 방식 차이점과 각각의 강점을 정리해줘."
\`\`\`

**활용 포인트:**
- 같은 질문에 대한 두 AI의 답변을 나란히 비교
- 모델별 특성 파악 (예: ChatGPT는 실용적, Gemini는 구조적)
- 교차 검증을 통한 신뢰도 높은 인사이트 도출

### 2️⃣ 주제별 탐색

**프롬프트 예시:**
\`\`\`
"보안/개인정보 태그가 붙은 질문들을 모두 찾아서, 
두 AI가 제시한 보안 가이드라인을 비교하고 통합 정리해줘."
\`\`\`

**활용 포인트:**
- 특정 토픽(예: 프롬프트, 비용/ROI)에 집중한 학습
- 주제별 베스트 프랙티스 도출
- 실무 적용 시나리오별 답변 비교

### 3️⃣ 실무 적용 가이드 생성

**프롬프트 예시:**
\`\`\`
"AI 협업 관련 질문들의 답변을 종합해서, 
우리 팀이 바로 적용할 수 있는 실무 가이드라인을 만들어줘. 
ChatGPT와 Gemini의 제안을 모두 반영해서요."
\`\`\`

**활용 포인트:**
- 두 AI의 답변을 통합하여 실무 매뉴얼 작성
- 팀별 맞춤형 가이드라인 개발
- 단계별 체크리스트 및 액션 플랜 수립

### 4️⃣ 태그 기반 필터링

**프롬프트 예시:**
\`\`\`
"의도가 '전략/전망'인 질문들만 찾아서, 
AI 시대 대비 전략에 대한 두 모델의 관점을 비교 분석해줘."
\`\`\`

**활용 포인트:**
- 의도별(howto, strategy 등) 답변 패턴 분석
- 주제와 의도 조합으로 세밀한 탐색
- 관심사에 맞는 질문-답변 쌍 빠르게 찾기

### 5️⃣ 인사이트 요약 및 트렌드 파악

**프롬프트 예시:**
\`\`\`
"이 문서 전체를 분석해서, 실무자들이 가장 많이 궁금해하는 주제 TOP 5를 찾고, 
각 주제에 대해 ChatGPT와 Gemini가 공통적으로 강조하는 포인트를 정리해줘."
\`\`\`

**활용 포인트:**
- 전체 질문 트렌드 파악
- 두 AI가 공통으로 강조하는 핵심 인사이트 도출
- 실무자 관심사와 AI 답변 품질 간의 관계 분석

### 📝 활용 팁

- **태그 활용**: "태그: 보안/개인정보" 또는 "의도: 방법/가이드"로 검색하면 관련 질문만 빠르게 찾을 수 있습니다
- **비교 질문**: "ChatGPT와 Gemini의 차이점은?" 같은 질문으로 모델별 특성을 파악하세요
- **실무 연결**: "이 답변을 우리 회사 상황에 적용하려면?" 같은 질문으로 구체화하세요
- **통합 분석**: 여러 질문의 답변을 종합하여 종합 가이드라인을 만들어보세요

---

## 📊 문서 정보

**이벤트:** 모두의특강 2025-12-27 회차 - 인간지능 x 인공지능 토크쇼 2025년 AI 결산  
**생성일:** ${new Date().toLocaleString('ko-KR')}  
**총 질문 수:** ${questions.length}개  
**답변 모델:** ChatGPT (gpt-5.2-thinking), Gemini (gemini 3.0 pro)

이 문서는 **모두의특강 2025-12-27 회차 "인간지능 x 인공지능 토크쇼 2025년 AI 결산"** 콘텐츠로 제작되었습니다.

**문의:** admin@modoolecture.com

---

`;

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
      
      // LLM 프롬프트 생성 및 추가
      const questionContent = jsonContentToText(question.content);
      const llmPrompt = `당신은 기업 실무 효율화와 AI 자동화 분야의 최고 전문가입니다.
현업 실무자가 겪고 있는 아래의 구체적인 고민에 대해 솔루션을 제시해주세요.

[답변 가이드라인]
1. 원론적이거나 추상적인 이야기는 배제하고, "당장 내일 출근해서 시도해볼 수 있는" 구체적인 방법 3~4가지를 제안하세요.
2. 답변의 길이는 너무 길어지지 않게(500자 내외), 가독성 좋은 리스트 형태로 작성하세요.
3. 질문자의 상황(제한된 권한, 비개발자 등)을 충분히 고려하여 현실적인 도구(무료 툴, 노코드 등)를 추천하세요.

---
[실무자의 질문]
${questionContent}
---

위 질문에 대해 전문가로서 통찰력 있고 실현 가능한 답변을 작성해주세요.`;
      
      markdown += `### 📝 LLM 프롬프트\n\n`;
      markdown += `*아래 프롬프트를 ChatGPT와 Gemini에 각각 입력하여 답변을 생성했습니다.*\n\n`;
      markdown += `\`\`\`\n${llmPrompt}\n\`\`\`\n\n`;
      markdown += `---\n\n`;
      
      markdown += `### 질문 내용\n\n`;
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

    // 파일 저장
    const outputPath = path.join(process.cwd(), '질문답변모음.md');
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    
    console.log(`\n✅ 마크다운 파일이 생성되었습니다: ${outputPath}`);
    console.log(`총 ${questions.length}개의 질문이 포함되었습니다.`);
    
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
exportQuestionsToMarkdown();
