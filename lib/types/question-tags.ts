/**
 * 질문 태그 타입 정의
 * 질문태그.md 명세에 따른 태그 시스템
 */

export type QuestionTopicTag =
  | "none"                 // 무응답/의미없음
  | "getting_started"      // 입문/일반 활용/시작
  | "workflow_automation"  // 실무 적용/자동화/워크플로
  | "prompting"            // 프롬프트/질문법
  | "tools_models"         // 툴/모델 선택·비교·연동
  | "accuracy_verification"// 정확도/환각/검증
  | "security_privacy"     // 보안/개인정보/사내정책
  | "copyright_ethics"     // 저작권/윤리/표절/출처
  | "cost_roi"             // 비용/구독/ROI
  | "trends_learning_career"; // 트렌드/학습/미래·커리어

export type QuestionIntentTag =
  | "howto"        // 방법/가이드 요청
  | "recommend"    // 추천/비교/선택
  | "troubleshoot" // 문제/불편/장애
  | "explain"      // 개념/원리 이해
  | "strategy"     // 전략/전망/의사결정
  | "other";       // 애매함

export type QuestionRouteTo = "ops" | "expert" | "ignore";

export interface QuestionClassification {
  primary_topic: QuestionTopicTag;
  secondary_topics: QuestionTopicTag[];
  intent: QuestionIntentTag;
  confidence: number; // 0~1
  reason_short: string; // 40자 이내
  keywords: string[]; // 최대 5개
  should_route_to: QuestionRouteTo;
}

// 유효한 토픽 태그 목록
export const VALID_TOPIC_TAGS: QuestionTopicTag[] = [
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

// 유효한 인텐트 태그 목록
export const VALID_INTENT_TAGS: QuestionIntentTag[] = [
  "howto",
  "recommend",
  "troubleshoot",
  "explain",
  "strategy",
  "other",
];

/**
 * 복합 태그를 개별 태그로 분리
 * 예: trends_learning_career → ["트랜드", "러닝", "커리어"]
 */
export function splitCompoundTag(tag: string): string[] {
  const tagMap: Record<string, string[]> = {
    "trends_learning_career": ["트랜드", "러닝", "커리어"],
    "getting_started": ["시작", "입문"],
    "workflow_automation": ["워크플로", "자동화"],
    "accuracy_verification": ["정확도", "검증"],
    "security_privacy": ["보안", "개인정보"],
    "copyright_ethics": ["저작권", "윤리"],
    "cost_roi": ["비용", "ROI"],
    "tools_models": ["툴", "모델"],
    "explain": ["설명", "이해"],
    "howto": ["방법", "가이드"],
    "recommend": ["추천", "비교"],
    "troubleshoot": ["문제", "해결"],
    "strategy": ["전략", "전망"],
  };

  // 매핑이 있으면 분리된 태그 반환
  if (tagMap[tag]) {
    return tagMap[tag];
  }

  // 매핑이 없으면 언더스코어로 분리하거나 원본 반환
  if (tag.includes("_")) {
    return tag.split("_").map(t => {
      // 영어를 한글로 변환 (간단한 매핑)
      const simpleMap: Record<string, string> = {
        "trends": "트랜드",
        "learning": "러닝",
        "career": "커리어",
        "getting": "시작",
        "started": "입문",
        "workflow": "워크플로",
        "automation": "자동화",
        "prompting": "프롬프트",
        "tools": "툴",
        "models": "모델",
        "accuracy": "정확도",
        "verification": "검증",
        "security": "보안",
        "privacy": "개인정보",
        "copyright": "저작권",
        "ethics": "윤리",
        "cost": "비용",
        "roi": "ROI",
      };
      return simpleMap[t.toLowerCase()] || t;
    });
  }

  return [tag];
}

