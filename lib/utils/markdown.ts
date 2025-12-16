export interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  category?: string;
  event?: {
    title: string;
  };
}

export const generatePromptMarkdown = (question: Question): string => {
  return `# 주제: ${question.title}

## ❓ 질문 내용
${question.content}

## 💡 전문가 답변
${question.answer ? question.answer : '(아직 답변이 등록되지 않았습니다.)'}

---
*출처: 모두의특강 ${question.event?.title || '2025 AI 결산'}*
`.trim();
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

