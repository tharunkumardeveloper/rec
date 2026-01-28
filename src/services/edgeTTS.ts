// Microsoft Edge TTS Service - Uses online Edge TTS API
// Provides high-quality natural voices from Microsoft Azure

class EdgeTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Microsoft Edge TTS API endpoint
  private readonly EDGE_TTS_ENDPOINT = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
  
  // Best US English female voices
  private readonly VOICE_NAME = 'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)';
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Generate audio using Microsoft Edge TTS API
   */
  private async generateAudio(text: string): Promise<Blob> {
    const ssml = `
      <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
        <voice name='${this.VOICE_NAME}'>
          <prosody rate='+10%' pitch='+0%'>
            ${text}
          </prosody>
        </voice>
      </speak>
    `.trim();

    const response = await fetch(this.EDGE_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      },
      body: ssml
    });

    if (!response.ok) {
      throw new Error(`Edge TTS API error: ${response.status}`);
    }

    return await response.blob();
  }

  /**
   * Speak with Edge TTS - respects 3 second interval
   */
  async speak(text: string, force: boolean = false): Promise<void> {
    if (!this.isEnabled || this.isSpeaking) return;

    const now = Date.now();
    
    // Enforce 3 second interval unless forced
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

      // Generate audio from Edge TTS
      const audioBlob = await this.generateAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
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
        console.error('Error playing Edge TTS audio');
      };

      await this.currentAudio.play();
      
    } catch (error) {
      console.error('Edge TTS error:', error);
      this.isSpeaking = false;
      
      // Fallback to browser speech synthesis if Edge TTS fails
      this.fallbackSpeak(text);
    }
  }

  /**
   * Fallback to browser's speech synthesis if Edge TTS fails
   */
  private fallbackSpeak(text: string): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        this.isSpeaking = false;
      };
      
      window.speechSynthesis.speak(utterance);
    }
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
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Stop all speech
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
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
