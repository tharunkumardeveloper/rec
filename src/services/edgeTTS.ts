// Microsoft Edge TTS Service - Natural humanized female voice
// Uses Web Speech API with enhanced voice selection

class EdgeTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initializeVoices();
    }
  }

  private async initializeVoices() {
    if (!this.synth) return;

    // Function to load and select voice
    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      
      if (voices.length === 0) {
        console.log('⏳ Waiting for voices to load...');
        return false;
      }

      console.log('🎤 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Priority order for natural, humanized female voices
      // Ava Neural is prioritized as the most natural voice
      this.selectedVoice = 
        // 1. Microsoft Ava Neural (most natural and humanized)
        voices.find(v => v.name.includes('Ava') && v.name.includes('Neural')) ||
        voices.find(v => v.name.includes('Ava') && v.lang.startsWith('en-US')) ||
        
        // 2. Other top Microsoft Neural voices
        voices.find(v => v.name.includes('Jenny') && v.name.includes('Neural')) ||
        voices.find(v => v.name.includes('Aria') && v.name.includes('Neural')) ||
        
        // 3. Australian English Neural voices
        voices.find(v => v.name.includes('Natasha') && v.name.includes('Neural') && v.lang.startsWith('en-AU')) ||
        
        // 4. Australian English female voices
        voices.find(v => v.name.includes('Catherine') && v.lang.startsWith('en-AU')) ||
        voices.find(v => v.name.includes('Karen') && v.lang.startsWith('en-AU')) ||
        voices.find(v => v.lang.startsWith('en-AU') && !v.name.toLowerCase().includes('male')) ||
        
        // 5. US English Neural voices
        voices.find(v => v.name.includes('Jenny') && v.lang.startsWith('en-US')) ||
        voices.find(v => v.name.includes('Aria') && v.lang.startsWith('en-US')) ||
        voices.find(v => v.name.includes('Michelle') && v.lang.startsWith('en-US')) ||
        
        // 6. British English female voices
        voices.find(v => v.name.includes('Hazel') && v.lang.startsWith('en-GB')) ||
        voices.find(v => v.name.includes('Susan') && v.lang.startsWith('en-GB')) ||
        
        // 7. Google female voices (any English)
        voices.find(v => v.name.includes('Google') && v.name.includes('Female') && v.lang.startsWith('en')) ||
        
        // 8. Any Microsoft English female (not male names)
        voices.find(v => 
          v.name.includes('Microsoft') && 
          v.lang.startsWith('en') &&
          !v.name.includes('David') &&
          !v.name.includes('Mark') &&
          !v.name.includes('Guy') &&
          !v.name.includes('James') &&
          !v.name.includes('George')
        ) ||
        
        // 9. Samantha (macOS/iOS - very natural)
        voices.find(v => v.name.includes('Samantha')) ||
        
        // 10. Any English female voice
        voices.find(v => 
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('female') || 
           v.name.toLowerCase().includes('woman') ||
           (!v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('man')))
        ) ||
        
        // 11. First English voice
        voices.find(v => v.lang.startsWith('en')) ||
        
        // 12. Any voice as last resort
        voices[0];

      if (this.selectedVoice) {
        console.log('✅ Selected Voice:', this.selectedVoice.name, '(' + this.selectedVoice.lang + ')');
        console.log('   Local:', this.selectedVoice.localService ? 'Yes' : 'No');
        this.voicesLoaded = true;
        return true;
      } else {
        console.warn('⚠️ No suitable voice found');
        return false;
      }
    };

    // Try loading immediately
    if (loadVoices()) return;

    // Set up event listener for when voices are loaded
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        loadVoices();
      };
    }
    
    // Fallback: try multiple times with delays
    const retryIntervals = [100, 500, 1000, 2000];
    for (const delay of retryIntervals) {
      await new Promise(resolve => setTimeout(resolve, delay));
      if (loadVoices()) break;
    }
  }

  /**
   * Speak with natural voice - respects 3 second interval
   */
  async speak(text: string, force: boolean = false): Promise<void> {
    if (!this.synth || !this.isEnabled) return;

    // Wait for voices to load if not ready
    if (!this.voicesLoaded) {
      console.log('⏳ Voices not loaded yet, waiting...');
      await this.initializeVoices();
    }

    if (this.isSpeaking && !force) return;

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
        console.log('🎤 Using voice:', this.selectedVoice.name);
      } else {
        console.warn('⚠️ No voice selected, using default');
      }
      
      // Natural, humanized settings
      utterance.rate = 0.95; // Slightly slower for more natural, clear speech
      utterance.pitch = 1.05; // Subtle pitch increase for warmth
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.lastSpeakTime = Date.now();
        console.log('🎤 Speaking:', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        console.log('✅ Speech ended');
      };

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        console.error('❌ Speech error:', error);
      };

      this.synth.speak(utterance);
      
    } catch (error) {
      console.error('❌ TTS error:', error);
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
   * Get info about current voice
   */
  getVoiceInfo(): string {
    if (!this.selectedVoice) {
      return 'No voice selected';
    }
    return `${this.selectedVoice.name} (${this.selectedVoice.lang})`;
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
