export interface ConversationContext {
  userId: string;
  userName: string;
  lastTopics: string[];
  userMood: 'neutral' | 'happy' | 'angry';
  askedBefore: string[];
  pendingTasks: string[];
  lastMessageAt: Date;
}

const contextStore = new Map<string, ConversationContext>();

export function getContext(userId: string, userName: string = 'العميل'): ConversationContext {
  if (!contextStore.has(userId)) {
    contextStore.set(userId, {
      userId,
      userName,
      lastTopics: [],
      userMood: 'neutral',
      askedBefore: [],
      pendingTasks: [],
      lastMessageAt: new Date()
    });
  }
  return contextStore.get(userId)!;
}

export function updateContext(userId: string, updates: Partial<ConversationContext>) {
  const current = getContext(userId);
  contextStore.set(userId, { ...current, ...updates, lastMessageAt: new Date() });
}
