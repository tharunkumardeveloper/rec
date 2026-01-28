// ElevenLabs TTS Service - Ultra-realistic AI voice with emotional intelligence
// Dynamic, varied, and humanized coaching experience

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

interface CoachingContext {
  lastMessageType: string;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  personalBest: number;
  totalReps: number;
  sessionStartTime: number;
}

class ElevenLabsTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private currentAudio: HTMLAudioElement | null = null;
  
  // Coaching context for intelligent responses
  private context: CoachingContext = {
    lastMessageType: '',
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    personalBest: 0,
    totalReps: 0,
    sessionStartTime: Date.now()
  };
  
  // ElevenLabs API configuration
  private readonly API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  private readonly API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
  
  // Rachel - Natural, warm, encouraging (default)
  private voiceId: string = '21m00Tcm4TlvDq8ikWAM';
  
  // Voice settings (can be customized)
  private voiceSettings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true
  };
  
  // Fallback to browser TTS
  private synth: SpeechSynthesis | null = null;
  private browserVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initBrowserVoice();
      }
      
      // Load saved settings
      const saved = localStorage.getItem('elevenlabs_voice_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.voiceSettings = settings.voiceSettings || this.voiceSettings;
        this.voiceId = settings.voiceId || this.voiceId;
      }
    }
    
    if (!this.API_KEY) {
      console.warn('⚠️ ElevenLabs API key not found. Using browser TTS fallback.');
    } else {
      console.log('✅ ElevenLabs TTS initialized with emotional intelligence');
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
   * Update voice settings
   */
  updateVoiceSettings(settings: Partial<VoiceSettings>) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
    this.saveSettings();
  }

  /**
   * Change voice
   */
  setVoice(voiceId: string) {
    this.voiceId = voiceId;
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem('elevenlabs_voice_settings', JSON.stringify({
      voiceSettings: this.voiceSettings,
      voiceId: this.voiceId
    }));
  }

  getVoiceSettings() {
    return { ...this.voiceSettings };
  }

  /**
   * Generate audio using ElevenLabs API
   */
  private async generateElevenLabsAudio(text: string): Promise<Blob> {
    if (!this.API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.API_URL}/${this.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2',
        voice_settings: this.voiceSettings
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

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      if (this.API_KEY) {
        try {
          const audioBlob = await this.generateElevenLabsAudio(text);
          const audioUrl = URL.createObjectURL(audioBlob);

          this.currentAudio = new Audio(audioUrl);
          
          this.currentAudio.onended = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
          };

          this.currentAudio.onerror = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
          };

          await this.currentAudio.play();
          
        } catch (elevenLabsError) {
          console.warn('☁️ ElevenLabs unavailable, using browser fallback');
          this.speakWithBrowser(text);
        }
      } else {
        this.speakWithBrowser(text);
      }
      
    } catch (error) {
      console.error('❌ TTS error:', error);
      this.isSpeaking = false;
    }
  }

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

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.synth.speak(utterance);
  }

  /**
   * Ultra-realistic, emotionally intelligent encouragement
   * Dynamically varies based on context, performance, and timing
   */
  getEncouragement(repCount: number, isCorrect: boolean): string {
    this.context.totalReps = repCount;
    
    if (!isCorrect) {
      this.context.consecutiveIncorrect++;
      this.context.consecutiveCorrect = 0;
      return this.getFormCorrection();
    }
    
    this.context.consecutiveCorrect++;
    this.context.consecutiveIncorrect = 0;
    
    // Check for personal best
    if (repCount > this.context.personalBest) {
      this.context.personalBest = repCount;
      if (repCount % 5 === 0 && repCount > 10) {
        this.context.lastMessageType = 'personal_best';
        return this.getPersonalBestMessage(repCount);
      }
    }
    
    // Vary message types dynamically
    const messageTypes = ['rep_count', 'encouragement', 'posture_praise', 'energy_boost', 'milestone'];
    const weights = this.getMessageWeights(repCount);
    const selectedType = this.weightedRandom(messageTypes, weights);
    
    this.context.lastMessageType = selectedType;
    
    switch (selectedType) {
      case 'rep_count':
        return this.getRepCountMessage(repCount);
      case 'encouragement':
        return this.getEncouragementMessage(repCount);
      case 'posture_praise':
        return this.getPosturePraise(repCount);
      case 'energy_boost':
        return this.getEnergyBoost(repCount);
      case 'milestone':
        return this.getMilestoneMessage(repCount);
      default:
        return this.getRepCountMessage(repCount);
    }
  }

  private getMessageWeights(repCount: number): number[] {
    // [rep_count, encouragement, posture_praise, energy_boost, milestone]
    if (repCount <= 5) {
      return [0.4, 0.3, 0.2, 0.1, 0.0]; // Focus on form early
    } else if (repCount <= 15) {
      return [0.3, 0.3, 0.2, 0.2, 0.0]; // Balanced
    } else if (repCount <= 30) {
      return [0.2, 0.3, 0.1, 0.3, 0.1]; // More energy boosts
    } else {
      return [0.2, 0.2, 0.1, 0.4, 0.1]; // Heavy energy focus
    }
  }

  private weightedRandom(items: string[], weights: number[]): string {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    
    return items[0];
  }

  private getRepCountMessage(count: number): string {
    const messages = [
      `${count}! Nice!`,
      `${count} down!`,
      `That's ${count}!`,
      `${count} reps!`,
      `${count}! Keep going!`,
      `${count}! Solid!`,
      `${count}! Yes!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEncouragementMessage(count: number): string {
    const messages = [
      "You're crushing it!",
      "Looking strong!",
      "You got this!",
      "Amazing work!",
      "Don't stop now!",
      "You're on fire!",
      "Keep pushing!",
      "Feeling good!",
      "That's the spirit!",
      "You're unstoppable!",
      "Love the energy!",
      "Perfect rhythm!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getPosturePraise(count: number): string {
    const messages = [
      "Perfect form!",
      "Great posture!",
      "Form is on point!",
      "Body alignment perfect!",
      "Textbook form!",
      "That's how it's done!",
      "Beautiful technique!",
      "Form looking clean!",
      "Nailing the form!",
      "Posture is perfect!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEnergyBoost(count: number): string {
    const messages = [
      "Let's go!",
      "You're a beast!",
      "Unstoppable!",
      "No quit in you!",
      "Pure power!",
      "You're flying!",
      "Incredible!",
      "You're amazing!",
      "So strong!",
      "Killing it!",
      "On another level!",
      "You're the best!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getMilestoneMessage(count: number): string {
    if (count % 10 === 0) {
      return `${count} reps! Milestone reached!`;
    } else if (count % 5 === 0) {
      return `${count}! Halfway to the next milestone!`;
    }
    return `${count}! Keep the momentum!`;
  }

  private getPersonalBestMessage(count: number): string {
    const messages = [
      `New record! ${count} reps!`,
      `Personal best! ${count}!`,
      `You just beat your record! ${count}!`,
      `That's a new high! ${count} reps!`,
      `Record breaker! ${count}!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getFormCorrection(): string {
    if (this.context.consecutiveIncorrect === 1) {
      const gentle = [
        "Watch your form!",
        "Check your posture!",
        "Adjust your form!",
        "Focus on technique!"
      ];
      return gentle[Math.floor(Math.random() * gentle.length)];
    } else if (this.context.consecutiveIncorrect === 2) {
      const firm = [
        "Keep your body straight!",
        "Go lower!",
        "Full range of motion!",
        "Control the movement!"
      ];
      return firm[Math.floor(Math.random() * firm.length)];
    } else {
      const encouraging = [
        "You got this! Focus on form!",
        "Take your time, perfect the form!",
        "Quality over quantity!",
        "Slow down, nail the technique!"
      ];
      return encouraging[Math.floor(Math.random() * encouraging.length)];
    }
  }

  announceStart(activityName: string): void {
    const messages = [
      `Let's do this! ${activityName} time!`,
      `Ready? Let's crush these ${activityName}!`,
      `Time to shine! ${activityName} starting now!`,
      `Here we go! ${activityName}!`,
      `Let's get it! ${activityName} time!`
    ];
    this.speak(messages[Math.floor(Math.random() * messages.length)], true);
    this.context.sessionStartTime = Date.now();
    this.context.consecutiveCorrect = 0;
    this.context.consecutiveIncorrect = 0;
  }

  announceEnd(totalReps: number, accuracy: number): void {
    const duration = Math.floor((Date.now() - this.context.sessionStartTime) / 1000);
    
    if (accuracy >= 90) {
      const excellent = [
        `Outstanding! ${totalReps} reps with ${accuracy}% accuracy!`,
        `Incredible work! ${totalReps} perfect reps!`,
        `You absolutely crushed it! ${totalReps} reps!`,
        `Flawless! ${totalReps} reps at ${accuracy}%!`
      ];
      this.speak(excellent[Math.floor(Math.random() * excellent.length)], true);
    } else if (accuracy >= 75) {
      const great = [
        `Great job! ${totalReps} reps, ${accuracy}% accuracy!`,
        `Solid work! ${totalReps} reps done!`,
        `Nice! ${totalReps} reps with good form!`,
        `Well done! ${totalReps} quality reps!`
      ];
      this.speak(great[Math.floor(Math.random() * great.length)], true);
    } else if (accuracy >= 60) {
      const good = [
        `Good effort! ${totalReps} reps. Let's work on that form!`,
        `${totalReps} reps done! Focus on technique next time!`,
        `Nice work! ${totalReps} reps. Form will improve!`
      ];
      this.speak(good[Math.floor(Math.random() * good.length)], true);
    } else {
      const encouraging = [
        `${totalReps} reps completed! Quality over quantity next time!`,
        `Good start! ${totalReps} reps. Let's perfect that form!`,
        `${totalReps} reps! Focus on technique and you'll crush it!`
      ];
      this.speak(encouraging[Math.floor(Math.random() * encouraging.length)], true);
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
    this.context = {
      lastMessageType: '',
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      personalBest: this.context.personalBest, // Keep personal best
      totalReps: 0,
      sessionStartTime: Date.now()
    };
    this.stop();
  }
}

export const elevenLabsTTS = new ElevenLabsTTSService();
