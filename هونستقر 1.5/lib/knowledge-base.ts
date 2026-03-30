import { query } from "@/lib/db";

export interface KnowledgeArticle {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  language: string;
}

export async function searchKnowledgeBase(text: string, language: string = 'ar'): Promise<KnowledgeArticle[]> {
  try {
    // Basic keyword extraction (simplified)
    const keywords = text.split(/\s+/).filter(word => word.length > 3);
    
    let sql = `SELECT * FROM knowledge_base WHERE language = ? AND (question LIKE ? OR answer LIKE ?`;
    const params: any[] = [language, `%${text}%`, `%${text}%`];

    if (keywords.length > 0) {
      keywords.forEach(kw => {
        sql += ` OR question LIKE ? OR answer LIKE ?`;
        params.push(`%${kw}%`, `%${kw}%`);
      });
    }

    sql += `) ORDER BY used_count DESC LIMIT 5`;

    const results = await query<any>(sql, params);
    
    return results.map((r: any) => ({
      ...r,
      keywords: typeof r.keywords === 'string' ? JSON.parse(r.keywords) : r.keywords
    }));
  } catch (error) {
    console.error("Knowledge Base Search Error:", error);
    return [];
  }
}

export async function incrementArticleUsage(id: number) {
  try {
    const { execute } = await import("@/lib/db");
    await execute("UPDATE knowledge_base SET used_count = used_count + 1 WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error incrementing usage:", error);
  }
}
