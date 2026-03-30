export const externalKnowledgeSources = {
  generalQA: {
    source: "ChatGPT/Gemini Knowledge",
    topics: ["معلومات عامة", "نصائح محاسبية", "أفضل الممارسات", "قوانين الضرائب"]
  },
  technicalQA: {
    source: "System Documentation",
    topics: ["أخطاء الربط", "مشاكل الطباعة", "تحديثات المتصفح"]
  }
};

export async function fetchExternalKnowledge(query: string) {
  // This would typically call an external API or search a vector DB
  // For now, we'll return a placeholder that indicates we can use AI to fill this
  return null;
}
