// Microsoft Edge TTS Service - Simple and fast
// Uses browser's built-in Edge TTS for natural voice

class EdgeTTSService {
  private synth: SpeechSynthesis | null = null;
  private edgeVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 5000; // 5 seconds

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadEdgeVoice();
    }
  }

  private loadEdgeVoice() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // ONLY use US English Microsoft female voices - NO Indian voices
      this.edgeVoice = 
        // First priority: Microsoft Zira (US English female)
        voices.find(v => 
          v.name.includes('Microsoft') && 
          v.name.includes('Zira') &&
          v.lang === 'en-US'
        ) ||
        // Second priority: Microsoft Aria (US English female)
        voices.find(v => 
          v.name.includes('Microsoft') && 
          v.name.includes('Aria') &&
          v.lang === 'en-US'
        ) ||
        // Third priority: Any Microsoft US English female
        voices.find(v => 
          v.name.includes('Microsoft') && 
          v.lang === 'en-US' &&
          !v.name.includes('Male') &&
          !v.name.includes('Guy') &&
          !v.name.includes('David')
        ) ||
        // Fourth priority: Google US English female
        voices.find(v => 
          v.name.includes('Google') && 
          v.lang === 'en-US' &&
          v.name.includes('Female')
        ) ||
        // Last resort: Any US English female (NOT Indian)
        voices.find(v => 
          v.lang === 'en-US' &&
          !v.lang.includes('IN') &&
          !v.name.includes('Indian') &&
          !v.name.includes('Heera') &&
          !v.name.includes('Neerja') &&
          !v.name.includes('Male')
        );

      if (this.edgeVoice) {
        console.log('✅ Selected Voice:', this.edgeVoice.name, '(' + this.edgeVoice.lang + ')');
      } else {
        console.warn('⚠️ No suitable US English female voice found. Voice coach disabled.');
        this.isEnabled = false;
      }
    };

    loadVoices();
    this.synth.onvoiceschanged = loadVoices;
  }

  /**
   * Speak with Edge TTS - respects 5 second interval
   */
  speak(text: string, force: boolean = false): void {
    if (!this.synth || !this.isEnabled || this.isSpeaking) return;

    // MUST have Microsoft Edge voice, otherwise don't speak
    if (!this.edgeVoice || !this.edgeVoice.name.includes('Microsoft')) {
      console.warn('Microsoft Edge voice not available');
      return;
    }

    const now = Date.now();
    
    // Enforce 5 second interval unless forced
    if (!force && (now - this.lastSpeakTime) < this.SPEAK_INTERVAL) {
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use ONLY Microsoft Edge voice
    utterance.voice = this.edgeVoice;
    utterance.rate = 1.1; // Slightly faster for quick feedback
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.lastSpeakTime = Date.now();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.synth.speak(utterance);
  }

  /**
   * Generate short, concise encouragement with rep count
   */
  getEncouragement(repCount: number, isCorrect: boolean): string {
    if (!isCorrect) {
      const corrections = [
        "Fix your form",
        "Check posture",
        "Adjust form"
      ];
      return corrections[Math.floor(Math.random() * corrections.length)];
    }

    // Very short encouragements with rep count
    const templates = [
      `${repCount} reps! Great job!`,
      `${repCount}! Keep going!`,
      `${repCount} done! Nice work!`,
      `${repCount}! You're doing great!`,
      `${repCount} reps! Strong!`,
      `${repCount}! Excellent!`,
      `${repCount} reps! Keep it up!`,
      `${repCount}! Looking good!`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Start message
   */
  announceStart(activityName: string): void {
    this.speak(`Let's go! ${activityName} time!`, true);
  }

  /**
   * End message
   */
  announceEnd(totalReps: number, accuracy: number): void {
    this.speak(`Done! ${totalReps} reps, ${accuracy}% accuracy!`, true);
  }

  /**
   * Enable/disable TTS
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Stop all speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Reset timer
   */
  reset(): void {
    this.lastSpeakTime = 0;
    this.stop();
  }
}

export const edgeTTS = new EdgeTTSService();
