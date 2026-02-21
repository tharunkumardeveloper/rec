// Cloud TTS Service - Uses online TTS APIs for consistent voice across devices
// Primary: Microsoft Azure TTS (free tier)
// Fallback: Browser Speech Synthesis

class CloudTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private currentAudio: HTMLAudioElement | null = null;
  
  // Microsoft Azure TTS endpoint (free, no auth needed for basic usage)
  private readonly AZURE_ENDPOINT = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';
  
  // Best voice: Ava Neural (most natural)
  private readonly VOICE_NAME = 'en-US-AvaNeural';
  
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
  }

  private initBrowserVoice() {
    if (!this.synth) return;

    const loadVoices = () => {
      const voices = this.synth!.getVoices();
      if (voices.length === 0) return;

      // Select best browser voice as fallback
      this.browserVoice = 
        voices.find(v => v.name.includes('Ava') && v.name.includes('Neural')) ||
        voices.find(v => v.name.includes('Jenny') && v.name.includes('Neural')) ||
        voices.find(v => v.name.includes('Aria') && v.name.includes('Neural')) ||
        voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')) ||
        voices[0];

      console.log('🔄 Fallback voice ready:', this.browserVoice?.name);
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Generate audio using Microsoft Azure TTS (free tier)
   */
  private async generateCloudAudio(text: string): Promise<Blob> {
    // SSML for natural, expressive speech
    const ssml = `
      <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
        <voice name='${this.VOICE_NAME}'>
          <mstts:express-as style='cheerful' styledegree='1.0'>
            <prosody rate='0.95' pitch='+2%'>
              ${this.escapeXml(text)}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `.trim();

    // Try Microsoft Azure TTS endpoint
    try {
      const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: ssml
      });

      if (response.ok) {
        return await response.blob();
      }
      
      throw new Error(`Azure TTS failed: ${response.status}`);
    } catch (error) {
      console.warn('☁️ Cloud TTS unavailable, using browser fallback');
      throw error;
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Speak using cloud TTS with browser fallback
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

      // Try cloud TTS first
      try {
        const audioBlob = await this.generateCloudAudio(text);
        const audioUrl = URL.createObjectURL(audioBlob);

        this.currentAudio = new Audio(audioUrl);
        
        this.currentAudio.onended = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.log('✅ Cloud TTS completed');
        };

        this.currentAudio.onerror = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          console.error('❌ Cloud TTS playback error');
        };

        await this.currentAudio.play();
        console.log('☁️ Using cloud TTS:', text);
        
      } catch (cloudError) {
        // Fallback to browser TTS
        console.log('🔄 Falling back to browser TTS');
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
    return `Microsoft Ava Neural (Cloud TTS) with browser fallback`;
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

export const cloudTTS = new CloudTTSService();
