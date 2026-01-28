// Microsoft Edge TTS Service - Natural humanized female voice
// Uses browser's Speech Synthesis API with best available voice

class EdgeTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadBestVoice();
    }
  }

  private loadBestVoice() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      
      console.log('🎤 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Priority order for natural female voices
      this.selectedVoice = 
        // 1. Microsoft Jenny Neural (most natural)
        voices.find(v => v.name.includes('Jenny') && v.lang.startsWith('en-US')) ||
        // 2. Microsoft Aria Neural
        voices.find(v => v.name.includes('Aria') && v.lang.startsWith('en-US')) ||
        // 3. Microsoft Zira
        voices.find(v => v.name.includes('Zira') && v.lang.startsWith('en-US')) ||
        // 4. Google US English Female
        voices.find(v => v.name.includes('Google') && v.name.includes('Female') && v.lang.startsWith('en-US')) ||
        // 5. Any Microsoft US English (not male)
        voices.find(v => 
          v.name.includes('Microsoft') && 
          v.lang.startsWith('en-US') &&
          !v.name.includes('David') &&
          !v.name.includes('Mark') &&
          !v.name.includes('Guy')
        ) ||
        // 6. Any US English female
        voices.find(v => 
          v.lang.startsWith('en-US') &&
          (v.name.toLowerCase().includes('female') || 
           v.name.toLowerCase().includes('woman') ||
           !v.name.toLowerCase().includes('male'))
        ) ||
        // 7. First US English voice
        voices.find(v => v.lang.startsWith('en-US')) ||
        // 8. First English voice
        voices.find(v => v.lang.startsWith('en')) ||
        // 9. Any voice
        voices[0];

      if (this.selectedVoice) {
        console.log('✅ Selected Voice:', this.selectedVoice.name, '(' + this.selectedVoice.lang + ')');
      } else {
        console.warn('⚠️ No suitable voice found');
      }
    };

    // Load voices immediately and on change
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    
    // Fallback: try again after a delay
    setTimeout(loadVoices, 100);
  }

  /**
   * Speak with natural voice - respects 3 second interval
   */
  speak(text: string, force: boolean = false): void {
    if (!this.synth || !this.isEnabled || this.isSpeaking) return;

    const now = Date.now();
    
    // Enforce 3 second interval unless forced
    if (!force && (now - this.lastSpeakTime) < this.SPEAK_INTERVAL) {
      return;
    }

    try {
      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use selected voice
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      
      // Natural, encouraging settings
      utterance.rate = 1.05; // Slightly faster for energy
      utterance.pitch = 1.1; // Slightly higher for enthusiasm
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.lastSpeakTime = Date.now();
        console.log('🎤 Speaking:', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        console.error('Speech error:', error);
      };

      this.synth.speak(utterance);
      
    } catch (error) {
      console.error('TTS error:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Generate natural, encouraging feedback
   */
  getEncouragement(repCount: number, isCorrect: boolean): string {
    if (!isCorrect) {
      const corrections = [
        "Watch your form!",
        "Keep your body straight!",
        "Go lower!",
        "Adjust your posture!"
      ];
      return corrections[Math.floor(Math.random() * corrections.length)];
    }

    // Natural, varied encouragements
    const templates = [
      `${repCount} reps! You're crushing it!`,
      `${repCount} down! Keep that energy!`,
      `${repCount}! Looking strong!`,
      `${repCount} reps! You got this!`,
      `${repCount}! Amazing work!`,
      `${repCount} reps! Don't stop now!`,
      `${repCount}! You're on fire!`,
      `${repCount} reps! Keep pushing!`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Start message with enthusiasm
   */
  announceStart(activityName: string): void {
    this.speak(`Let's do this! ${activityName} time!`, true);
  }

  /**
   * End message with celebration
   */
  announceEnd(totalReps: number, accuracy: number): void {
    if (accuracy >= 80) {
      this.speak(`Awesome! ${totalReps} reps with ${accuracy}% accuracy! Great job!`, true);
    } else if (accuracy >= 60) {
      this.speak(`Nice work! ${totalReps} reps, ${accuracy}% accuracy. Keep improving!`, true);
    } else {
      this.speak(`${totalReps} reps completed. Focus on form next time!`, true);
    }
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
