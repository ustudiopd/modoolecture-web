export interface Question {
  id: string;
  title: string;
  content: string;
  answer?: string | null;
  answer_gemini?: string | null;
  answer_gpt?: string | null;
  category?: string;
  tags?: string[];
  event?: {
    title: string;
  };
}

/**
 * LLM 프롬프트용 Markdown 생성
 * LLM에게 태스킹하기 위한 프롬프트 (아카이빙용이 아님)
 */
export const generatePromptMarkdown = (question: Question): string => {
  // LLM에게 역할을 부여하고 답변 가이드를 제시하는 프롬프트
  return `당신은 기업 실무 효율화와 AI 자동화 분야의 최고 전문가입니다.
현업 실무자가 겪고 있는 아래의 구체적인 고민에 대해 솔루션을 제시해주세요.

[답변 가이드라인]
1. 원론적이거나 추상적인 이야기는 배제하고, "당장 내일 출근해서 시도해볼 수 있는" 구체적인 방법 3~4가지를 제안하세요.
2. 답변의 길이는 너무 길어지지 않게(500자 내외), 가독성 좋은 리스트 형태로 작성하세요.
3. 질문자의 상황(제한된 권한, 비개발자 등)을 충분히 고려하여 현실적인 도구(무료 툴, 노코드 등)를 추천하세요.

---
[실무자의 질문]
${question.content}
---

위 질문에 대해 전문가로서 통찰력 있고 실현 가능한 답변을 작성해주세요.`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};



