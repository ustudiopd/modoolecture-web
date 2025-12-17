import { NextRequest, NextResponse } from 'next/server';
import type { QuestionClassification, QuestionTopicTag, QuestionIntentTag } from '@/lib/types/question-tags';

/**
 * POST /api/admin/questions/categorize
 * Gemini 2.0 Flash API를 사용하여 질문의 태그를 자동 분류
 * 질문태그.md 명세에 따른 구조화된 JSON 반환
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

    // 질문태그.md 명세에 따른 시스템 프롬프트
    const systemPrompt = `You are a strict classifier for Korean audience questions.
Classify a single question into topic tags and intent tag.
Return ONLY valid JSON. No markdown. No extra text.

Rules:
1) Choose exactly 1 primary_topic from the allowed list.
2) Choose 0 to 2 secondary_topics from the same allowed list, excluding primary_topic.
3) Choose exactly 1 intent from the allowed list.
4) If the question is empty, only punctuation, or meaningless (e.g., "없음", "...", "-"), set primary_topic="none", intent="other", confidence>=0.95, should_route_to="ignore".
5) confidence must be a number 0..1.
6) reason_short must be <= 40 Korean characters.
7) keywords: up to 5 short keywords extracted from the question.

Allowed primary_topic/secondary_topics:
- none
- getting_started
- workflow_automation
- prompting
- tools_models
- accuracy_verification
- security_privacy
- copyright_ethics
- cost_roi
- trends_learning_career

Allowed intent:
- howto
- recommend
- troubleshoot
- explain
- strategy
- other

Routing:
- should_route_to="ignore" if primary_topic="none"
- should_route_to="expert" if primary_topic is security_privacy or copyright_ethics (unless confidence < 0.55 then ops)
- otherwise should_route_to="ops"

Output JSON schema:
{
  "primary_topic": "...",
  "secondary_topics": ["..."],
  "intent": "...",
  "confidence": 0.0,
  "reason_short": "...",
  "keywords": ["..."],
  "should_route_to": "ops|expert|ignore"
}`;

    // Gemini 2.0 Flash API 호출
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
                  text: `${systemPrompt}\n\nQuestion: ${question}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API 오류:', errorData);
      return NextResponse.json(
        { error: '태그 분류에 실패했습니다.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!responseText) {
      return NextResponse.json(
        { error: '태그 분류 결과를 받을 수 없습니다.' },
        { status: 500 }
      );
    }

    // JSON 파싱 시도
    let classification: QuestionClassification;
    try {
      // 마크다운 코드 블록 제거
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      classification = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError, 'Response:', responseText);
      return NextResponse.json(
        { error: '태그 분류 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 유효성 검증
    const validTopics: QuestionTopicTag[] = [
      "none",
      "getting_started",
      "workflow_automation",
      "prompting",
      "tools_models",
      "accuracy_verification",
      "security_privacy",
      "copyright_ethics",
      "cost_roi",
      "trends_learning_career",
    ];

    const validIntents: QuestionIntentTag[] = [
      "howto",
      "recommend",
      "troubleshoot",
      "explain",
      "strategy",
      "other",
    ];

    // primary_topic 검증
    if (!validTopics.includes(classification.primary_topic as QuestionTopicTag)) {
      classification.primary_topic = 'none';
    }

    // secondary_topics 검증 및 필터링
    if (Array.isArray(classification.secondary_topics)) {
      classification.secondary_topics = classification.secondary_topics
        .filter((topic): topic is QuestionTopicTag => 
          validTopics.includes(topic as QuestionTopicTag) && 
          topic !== classification.primary_topic
        )
        .slice(0, 2); // 최대 2개
    } else {
      classification.secondary_topics = [];
    }

    // intent 검증
    if (!validIntents.includes(classification.intent as QuestionIntentTag)) {
      classification.intent = 'other';
    }

    // confidence 검증 (0~1 범위)
    if (typeof classification.confidence !== 'number' || classification.confidence < 0 || classification.confidence > 1) {
      classification.confidence = 0.5;
    }

    // should_route_to 검증
    if (!['ops', 'expert', 'ignore'].includes(classification.should_route_to)) {
      if (classification.primary_topic === 'none') {
        classification.should_route_to = 'ignore';
      } else if (['security_privacy', 'copyright_ethics'].includes(classification.primary_topic) && classification.confidence >= 0.55) {
        classification.should_route_to = 'expert';
      } else {
        classification.should_route_to = 'ops';
      }
    }

    return NextResponse.json({
      classification,
    });
  } catch (error) {
    console.error('태그 분류 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

