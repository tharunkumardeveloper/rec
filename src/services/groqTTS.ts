// Groq AI-powered TTS Coach Service
// Generates extremely humanized, context-aware encouragement

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GroqTTSService {
  private messageCache: Map<string, string> = new Map();
  private isGenerating: boolean = false;

  /**
   * Generate AI-powered encouragement message
   */
  async generateEncouragement(
    context: {
      workoutType: string;
      repNumber: number;
      isCorrectForm: boolean;
      totalReps?: number;
      accuracy?: number;
    }
  ): Promise<string> {
    // Create cache key
    const cacheKey = `${context.workoutType}-${context.repNumber}-${context.isCorrectForm}`;
    
    // Check cache first
    if (this.messageCache.has(cacheKey)) {
      return this.messageCache.get(cacheKey)!;
    }

    // If already generating, return a default message
    if (this.isGenerating) {
      return this.getDefaultMessage(context);
    }

    try {
      this.isGenerating = true;

      const prompt = this.buildPrompt(context);
      const message = await this.callGroqAPI(prompt);
      
      // Cache the result
      this.messageCache.set(cacheKey, message);
      
      return message;
    } catch (error) {
      console.error('Groq API error:', error);
      return this.getDefaultMessage(context);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Build context-aware prompt for Groq
   */
  private buildPrompt(context: {
    workoutType: string;
    repNumber: number;
    isCorrectForm: boolean;
    totalReps?: number;
    accuracy?: number;
  }): string {
    const { workoutType, repNumber, isCorrectForm, totalReps, accuracy } = context;

    if (!isCorrectForm) {
      return `You are a supportive, friendly female fitness coach giving real-time voice feedback during a workout. 
The athlete just completed a ${workoutType} rep with incorrect form.
Generate a SHORT (max 15 words), extremely encouraging and gentle correction message.
Be warm, supportive, and conversational like a real human coach would speak.
Use natural speech patterns with contractions (you're, let's, that's).
Examples: "Hey, let's adjust that form a bit. You're doing great!" or "Almost perfect! Just straighten your back a little."
Generate ONE short, natural message:`;
    }

    if (repNumber === 1) {
      return `You are a supportive, friendly female fitness coach giving real-time voice feedback.
The athlete just completed their FIRST ${workoutType} rep.
Generate a SHORT (max 15 words), enthusiastic and encouraging message to start them off strong.
Be warm and conversational like a real human coach.
Examples: "Perfect! First one down, you're off to a great start!" or "Yes! That's how you do it, let's keep going!"
Generate ONE short, natural message:`;
    }

    if (repNumber % 10 === 0) {
      return `You are a supportive, friendly female fitness coach giving real-time voice feedback.
The athlete just completed ${repNumber} ${workoutType} reps! This is a milestone.
Generate a SHORT (max 20 words), very enthusiastic celebration message.
Be genuinely excited and proud like a real human coach.
Examples: "Wow! ${repNumber} reps! You're absolutely crushing this!" or "Amazing! ${repNumber} already! Your strength is incredible!"
Generate ONE short, natural message:`;
    }

    if (repNumber % 5 === 0) {
      return `You are a supportive, friendly female fitness coach giving real-time voice feedback.
The athlete just completed ${repNumber} ${workoutType} reps.
Generate a SHORT (max 15 words), encouraging message to keep them motivated.
Be warm and conversational like a real human coach.
Examples: "Great job! ${repNumber} reps, keep that energy up!" or "Yes! ${repNumber} down, you're doing amazing!"
Generate ONE short, natural message:`;
    }

    // Random encouragement
    return `You are a supportive, friendly female fitness coach giving real-time voice feedback.
The athlete is doing ${workoutType} and just completed rep ${repNumber}.
Generate a SHORT (max 12 words), quick encouraging comment.
Be natural and conversational like a real human coach.
Examples: "You're doing great!" or "Keep it up, looking strong!" or "Perfect form!"
Generate ONE short, natural message:`;
  }

  /**
   * Call Groq API
   */
  private async callGroqAPI(prompt: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a supportive female fitness coach. Respond with ONLY the encouragement message, nothing else. Keep it SHORT and natural.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and high quality
        messages: messages,
        temperature: 0.9, // High creativity for natural variation
        max_tokens: 50, // Keep responses short
        top_p: 0.95
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content?.trim() || '';
    
    // Clean up the message (remove quotes if present)
    return message.replace(/^["']|["']$/g, '');
  }

  /**
   * Get default message if API fails
   */
  private getDefaultMessage(context: {
    workoutType: string;
    repNumber: number;
    isCorrectForm: boolean;
  }): string {
    const { repNumber, isCorrectForm } = context;

    if (!isCorrectForm) {
      const corrections = [
        "Let's adjust that form a bit, you're doing great!",
        "Almost perfect! Just a small tweak needed.",
        "Good effort! Let's focus on form for the next one."
      ];
      return corrections[Math.floor(Math.random() * corrections.length)];
    }

    if (repNumber === 1) {
      return "Perfect! First one down, great start!";
    }

    if (repNumber % 10 === 0) {
      return `Wow! ${repNumber} reps! You're crushing it!`;
    }

    if (repNumber % 5 === 0) {
      return `Great! ${repNumber} reps, keep going!`;
    }

    const encouragements = [
      "You're doing amazing!",
      "Keep it up!",
      "Perfect form!",
      "Looking strong!"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  /**
   * Generate workout start message
   */
  async generateWorkoutStart(workoutType: string): Promise<string> {
    const prompt = `You are a supportive, friendly female fitness coach.
The athlete is about to start their ${workoutType} workout.
Generate a SHORT (max 15 words), enthusiastic and motivating message to get them pumped up.
Be warm and conversational like a real human coach.
Examples: "Alright! Let's do this! Time to crush these ${workoutType}!" or "Ready? Let's make these ${workoutType} count!"
Generate ONE short, natural message:`;

    try {
      return await this.callGroqAPI(prompt);
    } catch (error) {
      return `Let's do this! Time for some ${workoutType}!`;
    }
  }

  /**
   * Generate workout end message
   */
  async generateWorkoutEnd(
    totalReps: number,
    correctReps: number,
    workoutType: string
  ): Promise<string> {
    const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
    
    const prompt = `You are a supportive, friendly female fitness coach.
The athlete just finished their ${workoutType} workout with ${totalReps} total reps and ${accuracy}% accuracy.
Generate a SHORT (max 25 words), proud and celebratory message.
Be genuinely proud and warm like a real human coach.
Examples: "Amazing work! ${totalReps} reps with ${accuracy}% accuracy! You should be so proud!" or "Wow! You crushed ${totalReps} reps! That was incredible!"
Generate ONE short, natural message:`;

    try {
      return await this.callGroqAPI(prompt);
    } catch (error) {
      if (accuracy >= 80) {
        return `Amazing! ${totalReps} reps with ${accuracy}% accuracy! You're a champion!`;
      } else {
        return `Great work! ${totalReps} reps completed! You did awesome!`;
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.messageCache.clear();
  }
}

export const groqTTS = new GroqTTSService();
