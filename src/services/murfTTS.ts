// Murf AI TTS Service - High-quality voice synthesis
// Generates natural-sounding audio from text

const MURF_API_KEY = (import.meta as any).env?.VITE_MURF_API_KEY || '';
const MURF_API_URL = 'https://api.murf.ai/v1/speech/generate';

interface MurfVoiceConfig {
  voiceId: string;
  style: string;
  rate: number;
  pitch: number;
  sampleRate: number;
}

class MurfTTSService {
  private audioCache: Map<string, string> = new Map(); // Cache audio URLs
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  // Default voice configuration - Female, natural, encouraging
  private voiceConfig: MurfVoiceConfig = {
    voiceId: 'en-US-natalie', // Natural female voice
    style: 'Conversational',
    rate: 0, // Normal speed
    pitch: 0, // Normal pitch
    sampleRate: 24000
  };

  /**
   * Generate speech audio from text using Murf AI
   */
  async generateSpeech(text: string): Promise<string> {
    // Check cache first
    const cacheKey = `${text}-${this.voiceConfig.voiceId}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(MURF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MURF_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          voiceId: this.voiceConfig.voiceId,
          style: this.voiceConfig.style,
          text: text,
          rate: this.voiceConfig.rate,
          pitch: this.voiceConfig.pitch,
          sampleRate: this.voiceConfig.sampleRate,
          format: 'MP3',
          channelType: 'MONO'
        })
      });

      if (!response.ok) {
        throw new Error(`Murf API error: ${response.status}`);
      }

      const data = await response.json();
      const audioUrl = data.audioFile || data.audioUrl;

      if (!audioUrl) {
        throw new Error('No audio URL in response');
      }

      // Cache the audio URL
      this.audioCache.set(cacheKey, audioUrl);
      
      return audioUrl;
    } catch (error) {
      console.error('Murf TTS error:', error);
      throw error;
    }
  }

  /**
   * Speak text with Murf AI voice
   */
  async speak(text: string, priority: boolean = false): Promise<void> {
    try {
      // Generate audio
      const audioUrl = await this.generateSpeech(text);
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;

      // If priority, stop current and clear queue
      if (priority) {
        this.stop();
      }

      // If already playing, queue it
      if (this.isPlaying && !priority) {
        this.audioQueue.push(audio);
        return;
      }

      // Play immediately
      this.playAudio(audio);
    } catch (error) {
      console.error('Failed to speak:', error);
      // Fallback to browser TTS if Murf fails
      this.fallbackSpeak(text);
    }
  }

  /**
   * Play audio and handle queue
   */
  private playAudio(audio: HTMLAudioElement) {
    this.currentAudio = audio;
    this.isPlaying = true;

    audio.onended = () => {
      this.isPlaying = false;
      this.currentAudio = null;

      // Play next in queue
      if (this.audioQueue.length > 0) {
        const nextAudio = this.audioQueue.shift();
        if (nextAudio) {
          setTimeout(() => this.playAudio(nextAudio), 300); // Small pause
        }
      }
    };

    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      
      // Try next in queue
      if (this.audioQueue.length > 0) {
        const nextAudio = this.audioQueue.shift();
        if (nextAudio) {
          this.playAudio(nextAudio);
        }
      }
    };

    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      this.isPlaying = false;
    });
  }

  /**
   * Fallback to browser TTS if Murf fails
   */
  private fallbackSpeak(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use Microsoft voice
      const voices = window.speechSynthesis.getVoices();
      const microsoftVoice = voices.find(v => 
        v.name.includes('Microsoft') && v.name.includes('Zira')
      );
      if (microsoftVoice) {
        utterance.voice = microsoftVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Stop current audio and clear queue
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }

  /**
   * Update voice configuration
   */
  updateVoiceConfig(config: Partial<MurfVoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
    // Clear cache when voice config changes
    this.audioCache.clear();
  }

  /**
   * Get available Murf voices
   */
  getAvailableVoices(): string[] {
    return [
      'en-US-natalie', // Female, natural
      'en-US-terrell', // Male, confident
      'en-US-clint', // Male, professional
      'en-US-ruby', // Female, energetic
      'en-US-wayne', // Male, warm
      'en-US-charlotte', // Female, friendly
      'en-US-marcus', // Male, authoritative
      'en-US-lily', // Female, youthful
    ];
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
  }

  /**
   * Check if Murf is available
   */
  isAvailable(): boolean {
    return !!MURF_API_KEY;
  }
}

export const murfTTS = new MurfTTSService();
