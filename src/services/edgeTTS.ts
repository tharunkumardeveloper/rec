// Microsoft Edge TTS Service - Natural humanized female voice
// Uses Microsoft Azure Neural TTS for realistic speech

class EdgeTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 3000; // 3 seconds
  private currentAudio: HTMLAudioElement | null = null;

  // Best natural US English female voice - Jenny Neural (most humanized)
  private readonly VOICE_NAME = 'en-US-JennyNeural';
  private readonly VOICE_STYLE = 'cheerful'; // Makes it more encouraging
  
  constructor() {
    console.log('🎤 Edge TTS initialized with Jenny Neural voice');
  }

  /**
   * Generate audio using Microsoft Edge TTS API
   */
  private async generateAudio(text: string): Promise<Blob> {
    // SSML with natural prosody and cheerful style
    const ssml = `
      <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
        <voice name='${this.VOICE_NAME}'>
          <mstts:express-as style='${this.VOICE_STYLE}' styledegree='1.2'>
            <prosody rate='+5%' pitch='+2%'>
              ${text}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `.trim();

    const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
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
   * Speak with natural voice - respects 3 second interval
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
