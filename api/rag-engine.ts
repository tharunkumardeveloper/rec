import { readFileSync } from 'fs';
import { join } from 'path';

// Load knowledge base from JSON file
const knowledgeBasePath = join(process.cwd(), 'api', 'knowledge-base.json');
const knowledgeBase = JSON.parse(readFileSync(knowledgeBasePath, 'utf-8'));

export interface KnowledgeEntry {
  id: string;
  category: 'workout' | 'feature' | 'navigation' | 'fitness';
  title: string;
  content: string;
  keywords: string[];
}

interface ScoredEntry {
  entry: KnowledgeEntry;
  score: number;
}

/**
 * Retrieve relevant context from knowledge base using keyword matching
 * @param query User's question
 * @param currentTab Current tab user is on (training, discover, report, roadmap)
 * @returns Top 3 most relevant knowledge entries
 */
export function retrieveContext(query: string, currentTab: string): KnowledgeEntry[] {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2); // Filter out short words

  // Flatten all knowledge entries
  const allEntries: KnowledgeEntry[] = [
    ...(knowledgeBase.workouts as KnowledgeEntry[]),
    ...(knowledgeBase.features as KnowledgeEntry[]),
    ...(knowledgeBase.navigation as KnowledgeEntry[]),
    ...(knowledgeBase.fitness as KnowledgeEntry[])
  ];

  // Score each knowledge entry
  const scored: ScoredEntry[] = allEntries.map(entry => {
    let score = 0;

    // Exact title match: +10
    if (entry.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Keyword matches: +2 each
    entry.keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    // Content matches: +1 per word
    queryWords.forEach(word => {
      if (entry.content.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    // Boost if category matches current tab
    if (currentTab === 'training' && entry.category === 'workout') {
      score += 3;
    }
    if (currentTab === 'training' && entry.category === 'feature') {
      score += 2; // Features are also relevant on training tab
    }
    if (currentTab === 'report' && entry.id === 'report-tab') {
      score += 5;
    }
    if (currentTab === 'roadmap' && (entry.id === 'roadmap-tab' || entry.id === 'badges')) {
      score += 5;
    }

    // Boost navigation entries when query contains "how", "where", "access", "find"
    if (entry.category === 'navigation' && /how|where|access|find|start|begin|navigate/.test(queryLower)) {
      score += 3;
    }

    return { entry, score };
  });

  // Return top 3 entries with score > 0
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.entry);
}

/**
 * Build system prompt with FitFranken personality and context
 */
export function buildSystemPrompt(
  context: KnowledgeEntry[],
  userContext: {
    userName: string;
    userRole: string;
    recentWorkouts: any[];
    currentStats: any;
  },
  currentTab: string
): string {
  const contextText = context
    .map(entry => `${entry.title}: ${entry.content}`)
    .join('\n\n');

  const recentWorkoutsText = userContext.recentWorkouts.length > 0
    ? `Recent workouts: ${userContext.recentWorkouts.map(w => w.name).join(', ')}`
    : 'No recent workouts yet';

  return `You are FitFranken, the AI fitness assistant for Talent Track. You're warm, encouraging, and speak like a real coach - not a bot.

PERSONALITY:
- Friendly and conversational, like texting a supportive friend
- Use emojis sparingly (💪 🎯 🔥 👻)
- Keep responses SHORT - 1-2 sentences for simple questions, max 3-4 for complex ones
- Be direct and helpful, skip the fluff
- NEVER use the user's actual name - always call them "athlete" or "champ"

CONTEXT:
- Current Tab: ${currentTab}
- ${recentWorkoutsText}
- Streak: ${userContext.currentStats?.weeklyStreak || 0} days | Workouts: ${userContext.currentStats?.totalWorkouts || 0}

KNOWLEDGE:
${contextText || 'No specific context for this query.'}

RULES:
- Keep it SHORT and conversational
- If you don't know, say so quickly and suggest alternatives
- When mentioning workouts, use their exact names: push-ups, pull-ups, sit-ups, vertical jump, shuttle run, sit reach, broad jump
- Focus on being helpful, not wordy

You're here to help athletes succeed! 💪`;
}
