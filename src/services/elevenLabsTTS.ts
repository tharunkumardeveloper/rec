// ElevenLabs TTS Service - Ultra-realistic AI voice
// Most natural and human-like voice available

class ElevenLabsTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private currentAudio: HTMLAudioElement | null = null;
  
  // ElevenLabs API configuration
  private readonly API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  private readonly API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
  
  // Best voices for workout coaching (female, energetic)
  // Rachel - Natural, warm, encouraging
  private readonly VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (default)
  
  // Alternative voices you can use:
  // Bella: 'EXAVITQu4vr4xnSDxMaL' - Young, energetic
  // Elli: 'MF3mGyEYCl7XYWbV9V6O' - Friendly, clear
  // Nicole: 'piTKgcLEGmPE4e6mEKli' - Professional, warm
  
  // Fallback to browser TTS
  private synth: SpeechSynthesis | null = null;
  private browserVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initBrowserVoice();
      }
    }
    
    if (!this.API_KEY) {
      console.warn('⚠️ ElevenLabs API key not found. Using browser TTS fallback.');
    } else {
      console.log('✅ ElevenLabs TTS initialized');
    }
  }

  private initBrowserVoice() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      if (voices.length === 0) return;

      this.browserVoice = 
        voices.find(v => v.name.includes('Ava') && v.name.includes('Neural')) ||
        voices.find(v => v.name.includes('Jenny') && v.name.includes('Neural')) ||
        voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')) ||
        voices[0];
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Generate audio using ElevenLabs API
   */
  private async generateElevenLabsAudio(text: string): Promise<Blob> {
    if (!this.API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.API_URL}/${this.VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2', // Fastest model, great quality
        voice_settings: {
          stability: 0.5, // More expressive
          similarity_boost: 0.75, // Natural voice
          style: 0.5, // Balanced style
          use_speaker_boost: true // Enhanced clarity
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    return await response.blob();
  }

  /**
   * Speak using ElevenLabs with browser fallback
   */
  async speak(text: string, force: boolean = false): Promise<void> {
    if (!this.isEnabled || (this.isSpeaking && !force)) return;

    const now = Date.now();
    if (!force && (now - this.lastSpeakTime) < this.SPEAK_INTERVAL) {
      return;
    }

    try {
      this.isSpeaking = true;
      this.lastSpeakTime = Date.now();

      // Stop any current audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      // Try ElevenLabs first
      if (this.API_KEY) {
        try {
          console.log('🎙️ Generating ElevenLabs audio...');
          const audioBlob = await this.generateElevenLabsAudio(text);
          const audioUrl = URL.createObjectURL(audioBlob);

          this.currentAudio = new Audio(audioUrl);
          
          this.currentAudio.onended = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            console.log('✅ ElevenLabs TTS completed');
          };

          this.currentAudio.onerror = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            console.error('❌ ElevenLabs playback error');
          };

          await this.currentAudio.play();
          console.log('🎙️ Playing ElevenLabs audio:', text);
          
        } catch (elevenLabsError) {
          console.warn('☁️ ElevenLabs unavailable, using browser fallback:', elevenLabsError);
          this.speakWithBrowser(text);
        }
      } else {
        // No API key, use browser TTS
        this.speakWithBrowser(text);
      }
      
    } catch (error) {
      console.error('❌ TTS error:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * Fallback to browser speech synthesis
   */
  private speakWithBrowser(text: string): void {
    if (!this.synth) {
      this.isSpeaking = false;
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.browserVoice) {
      utterance.voice = this.browserVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      console.log('🎤 Browser TTS:', text);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('✅ Browser TTS completed');
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      console.error('❌ Browser TTS error');
    };

    this.synth.speak(utterance);
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

  announceStart(activityName: string): void {
    this.speak(`Let's do this! ${activityName} time!`, true);
  }

  announceEnd(totalReps: number, accuracy: number): void {
    if (accuracy >= 80) {
      this.speak(`Awesome! ${totalReps} reps with ${accuracy}% accuracy! Great job!`, true);
    } else if (accuracy >= 60) {
      this.speak(`Nice work! ${totalReps} reps, ${accuracy}% accuracy. Keep improving!`, true);
    } else {
      this.speak(`${totalReps} reps completed. Focus on form next time!`, true);
    }
  }

  getVoiceInfo(): string {
    if (this.API_KEY) {
      return 'ElevenLabs Rachel (Ultra-realistic AI voice)';
    }
    return 'Browser TTS (ElevenLabs API key not configured)';
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  reset(): void {
    this.lastSpeakTime = 0;
    this.stop();
  }
}

export const elevenLabsTTS = new ElevenLabsTTSService();
