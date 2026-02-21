import { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { retrieveContext, buildSystemPrompt } from './rag-engine.js';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Rate limiting storage (in-memory for serverless)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_PER_USER = 10; // messages per minute
const RATE_LIMIT_PER_IP = 20; // messages per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

interface ChatRequest {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  userContext: {
    userName: string;
    userRole: string;
    recentWorkouts: any[];
    currentStats: any;
  };
  currentTab: string;
  userId?: string;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    payload: any;
  }>;
  error?: string;
}

/**
 * Check rate limit for a given key
 */
function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

/**
 * Extract action suggestions from bot response
 */
function extractActions(response: string): Array<{ type: string; label: string; payload: any }> {
  const actions: Array<{ type: string; label: string; payload: any }> = [];
  const responseLower = response.toLowerCase();

  // Detect workout mentions with proper mapping
  const workoutMap: Record<string, string> = {
    'push-up': 'push-ups',
    'pushup': 'push-ups',
    'pull-up': 'pull-ups',
    'pullup': 'pull-ups',
    'sit-up': 'sit-ups',
    'situp': 'sit-ups',
    'vertical jump': 'vertical-jump',
    'shuttle run': 'shuttle-run',
    'sit reach': 'sit-reach',
    'sit and reach': 'sit-reach',
    'broad jump': 'broad-jump'
  };

  Object.entries(workoutMap).forEach(([keyword, workoutId]) => {
    if (responseLower.includes(keyword) && actions.length < 2) {
      const label = workoutId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      actions.push({
        type: 'start_workout',
        label: `Start ${label}`,
        payload: { workoutId }
      });
    }
  });

  // Detect feature mentions
  if (responseLower.includes('ghost mode') && actions.length < 2) {
    actions.push({
      type: 'navigate',
      label: 'Open Ghost Mode',
      payload: { destination: 'ghost-mode' }
    });
  }

  if (responseLower.includes('test mode') && actions.length < 2) {
    actions.push({
      type: 'navigate',
      label: 'Open Test Mode',
      payload: { destination: 'test-mode' }
    });
  }

  // Detect tab mentions
  if ((responseLower.includes('report tab') || responseLower.includes('view your progress')) && actions.length < 2) {
    actions.push({
      type: 'navigate',
      label: 'Go to Report',
      payload: { destination: 'report' }
    });
  }

  if ((responseLower.includes('roadmap') || responseLower.includes('badges')) && actions.length < 2) {
    actions.push({
      type: 'navigate',
      label: 'Go to Roadmap',
      payload: { destination: 'roadmap' }
    });
  }

  // Limit to 2 actions to avoid clutter
  return actions.slice(0, 2);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      res.status(500).json({
        error: 'Chat service unavailable',
        message: 'FitFranken is taking a break. Please try again later.'
      });
      return;
    }

    // Parse request body
    const { message, conversationHistory, userContext, currentTab, userId }: ChatRequest = req.body;

    // Validate required fields
    if (!message || !userContext || !currentTab) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide message, userContext, and currentTab.'
      });
      return;
    }

    // Rate limiting
    const userKey = userId || userContext.userName || 'anonymous';
    const ipKey = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    if (!checkRateLimit(`user:${userKey}`, RATE_LIMIT_PER_USER)) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: "I'm getting a lot of questions! Give me a moment... ⏳"
      });
      return;
    }

    if (!checkRateLimit(`ip:${ipKey}`, RATE_LIMIT_PER_IP)) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: "I'm getting a lot of questions! Give me a moment... ⏳"
      });
      return;
    }

    // Perform RAG retrieval
    const relevantContext = retrieveContext(message, currentTab);

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(relevantContext, userContext, currentTab);

    // Prepare conversation history (last 10 messages)
    const recentHistory = (conversationHistory || []).slice(-10);

    // Call Groq API with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let completion;

    while (attempts < maxAttempts) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system' as const, content: systemPrompt },
            ...recentHistory.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content
            })),
            { role: 'user' as const, content: message }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          stream: false
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        attempts++;
        if (error?.status === 429 && attempts < maxAttempts) {
          // Rate limit from Groq, wait and retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          continue;
        }
        throw error; // Re-throw if not rate limit or max attempts reached
      }
    }

    if (!completion) {
      throw new Error('Failed to get response from Groq API');
    }

    const responseMessage = completion.choices[0]?.message?.content || 
      "Sorry, I couldn't generate a response. Can you rephrase your question?";

    // Extract actions from response
    const actions = extractActions(responseMessage);

    // Return successful response
    const response: ChatResponse = {
      message: responseMessage,
      actions: actions.length > 0 ? actions : undefined
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error?.status === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: "I'm getting a lot of questions! Give me a moment... ⏳"
      });
      return;
    }

    if (error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT') {
      res.status(504).json({
        error: 'Request timeout',
        message: 'Connection timed out. Please check your internet and try again.'
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: "I'm having trouble connecting right now. Please try again in a moment."
    });
  }
}
