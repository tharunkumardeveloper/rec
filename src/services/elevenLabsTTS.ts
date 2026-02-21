// ElevenLabs TTS Service - Ultra-realistic AI voice with emotional intelligence
// Dynamic, varied, and humanized coaching experience

import { getWorkoutMessage } from './workoutMessages';

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
  lastRepTime: number;
  currentWorkout: string;
}

class ElevenLabsTTSService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;
  private lastSpeakTime: number = 0;
  private readonly SPEAK_INTERVAL = 1500; // 1.5 seconds to prevent overlap
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: string[] = []; // Queue for pending messages
  private isProcessingQueue: boolean = false;
  
  // Coaching context for intelligent responses
  private context: CoachingContext = {
    lastMessageType: '',
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    personalBest: 0,
    totalReps: 0,
    sessionStartTime: Date.now(),
    lastRepTime: Date.now(),
    currentWorkout: ''
  };
  
  // Idle detection timer
  private idleCheckInterval: number | null = null;
  
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
   * Speak using ElevenLabs with browser fallback - prevents overlap
   */
  async speak(text: string, force: boolean = false): Promise<void> {
    if (!this.isEnabled) return;

    // If force is true, stop current audio and clear queue
    if (force) {
      this.audioQueue = [];
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      if (this.synth) {
        this.synth.cancel();
      }
      this.isSpeaking = false;
    }

    // If already speaking and not forced, add to queue
    if (this.isSpeaking && !force) {
      // Only keep last 2 messages in queue to prevent buildup
      if (this.audioQueue.length < 2) {
        this.audioQueue.push(text);
      }
      return;
    }

    const now = Date.now();
    if (!force && (now - this.lastSpeakTime) < this.SPEAK_INTERVAL) {
      // Add to queue if too soon
      if (this.audioQueue.length < 2) {
        this.audioQueue.push(text);
      }
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
            // Process next in queue
            this.processQueue();
          };

          this.currentAudio.onerror = () => {
            this.isSpeaking = false;
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            // Process next in queue
            this.processQueue();
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
      this.processQueue();
    }
  }

  /**
   * Process queued messages
   */
  private processQueue(): void {
    if (this.isProcessingQueue || this.audioQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    // Wait a bit before processing next message
    setTimeout(() => {
      const nextMessage = this.audioQueue.shift();
      this.isProcessingQueue = false;
      
      if (nextMessage) {
        this.speak(nextMessage, false);
      }
    }, 500); // Small delay between messages
  }

  private speakWithBrowser(text: string): void {
    if (!this.synth) {
      this.isSpeaking = false;
      this.processQueue();
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
      this.processQueue();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processQueue();
    };

    this.synth.speak(utterance);
  }

  /**
   * Generate natural, encouraging feedback with optional personalization
   */
  getEncouragement(repCount: number, isCorrect: boolean): string {
    this.context.totalReps = repCount;
    this.context.lastRepTime = Date.now(); // Update activity time
    
    // Get user name for personalization
    const userName = this.getUserName();
    
    if (!isCorrect) {
      this.context.consecutiveIncorrect++;
      this.context.consecutiveCorrect = 0;
      return this.getFormCorrection(userName);
    }
    
    this.context.consecutiveCorrect++;
    this.context.consecutiveIncorrect = 0;
    
    // Check for personal best
    if (repCount > this.context.personalBest) {
      this.context.personalBest = repCount;
      if (repCount % 5 === 0 && repCount > 10) {
        this.context.lastMessageType = 'personal_best';
        return this.getPersonalBestMessage(repCount, userName);
      }
    }
    
    // Vary message types dynamically
    const messageTypes = ['repCount', 'encouragement', 'posture', 'energy', 'milestone'];
    const weights = this.getMessageWeights(repCount);
    const selectedType = this.weightedRandom(messageTypes, weights);
    
    this.context.lastMessageType = selectedType;
    
    // Use workout-specific messages
    if (this.context.currentWorkout && selectedType !== 'milestone') {
      try {
        let message = getWorkoutMessage(
          this.context.currentWorkout,
          selectedType as 'repCount' | 'encouragement' | 'posture' | 'energy',
          repCount
        );
        // Add name occasionally for personalization
        if (userName && Math.random() < 0.3) {
          message = this.personalize(message, userName);
        }
        return message;
      } catch (e) {
        // Fallback to generic if workout not found
      }
    }
    
    // Fallback to generic messages
    switch (selectedType) {
      case 'repCount':
        return this.getRepCountMessage(repCount, userName);
      case 'encouragement':
        return this.getEncouragementMessage(repCount, userName);
      case 'posture':
        return this.getPosturePraise(repCount, userName);
      case 'energy':
        return this.getEnergyBoost(repCount, userName);
      case 'milestone':
        return this.getMilestoneMessage(repCount, userName);
      default:
        return this.getRepCountMessage(repCount, userName);
    }
  }
  
  private getUserName(): string {
    // Get name from auth session or user profile
    try {
      const authSession = localStorage.getItem('auth_session');
      if (authSession) {
        const session = JSON.parse(authSession);
        return session.name || '';
      }
      
      const userProfile = localStorage.getItem('user_profile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.name || '';
      }
    } catch (error) {
      console.error('Error getting user name for TTS:', error);
    }
    return '';
  }
  
  private personalize(message: string, userName: string): string {
    if (!userName) return message;
    
    const personalizations = [
      `${userName}, ${message}`,
      `${message} ${userName}!`,
      `Great work ${userName}! ${message}`,
      `${userName}! ${message}`
    ];
    
    return personalizations[Math.floor(Math.random() * personalizations.length)];
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

  private getRepCountMessage(count: number, userName?: string): string {
    const messages = userName ? [
      `${count}! Awesome ${userName}!`,
      `That's ${count} ${userName}! Looking good!`,
      `${count} reps! You're doing great ${userName}!`,
      `Nice one ${userName}! ${count} down!`,
      `${count}! Keep that energy up ${userName}!`
    ] : [
      `${count}! Nice!`,
      `${count} down!`,
      `That's ${count}!`,
      `${count} reps!`,
      `${count}! Keep going!`,
      `${count}! Solid!`,
      `${count}! Yes!`,
      `${count}! Beautiful!`,
      `${count}! Strong work!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEncouragementMessage(count: number, userName?: string): string {
    const messages = userName ? [
      `You're absolutely crushing it ${userName}!`,
      `Looking super strong ${userName}!`,
      `${userName}, you got this! Keep it up!`,
      `Amazing work ${userName}! I'm impressed!`,
      `${userName}, you're on fire today!`,
      `Keep pushing ${userName}! You're unstoppable!`,
      `${userName}, your form is getting better every rep!`,
      `I love the energy ${userName}! Don't stop!`
    ] : [
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
      "Perfect rhythm!",
      "You're a machine!",
      "Incredible effort!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getPosturePraise(count: number, userName?: string): string {
    const messages = userName ? [
      `Perfect form ${userName}! That's textbook!`,
      `Great posture ${userName}! Keep it up!`,
      `${userName}, your form is on point today!`,
      `Textbook technique ${userName}!`,
      `${userName}, that's exactly how it's done!`,
      `Beautiful form ${userName}! I'm loving it!`
    ] : [
      "Perfect form!",
      "Great posture!",
      "Form is on point!",
      "Body alignment perfect!",
      "Textbook form!",
      "That's how it's done!",
      "Beautiful technique!",
      "Form looking clean!",
      "Nailing the form!",
      "Posture is perfect!",
      "Technique is flawless!",
      "Form is dialed in!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getEnergyBoost(count: number, userName?: string): string {
    const messages = userName ? [
      `Let's go ${userName}! You're a powerhouse!`,
      `You're a beast ${userName}! Keep it going!`,
      `${userName}, you're absolutely unstoppable!`,
      `Pure power ${userName}! I can feel it!`,
      `${userName}, you're amazing! Don't quit!`,
      `Killing it ${userName}! This is your moment!`,
      `${userName}, you're stronger than you think!`,
      `Unleash that power ${userName}!`
    ] : [
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
      "You're the best!",
      "Phenomenal!",
      "Explosive power!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getMilestoneMessage(count: number, userName?: string): string {
    if (count % 10 === 0) {
      return userName ? `${count} reps ${userName}! Milestone reached!` : `${count} reps! Milestone reached!`;
    } else if (count % 5 === 0) {
      return userName ? `${count} ${userName}! Halfway to the next milestone!` : `${count}! Halfway to the next milestone!`;
    }
    return userName ? `${count} ${userName}! Keep the momentum!` : `${count}! Keep the momentum!`;
  }

  private getPersonalBestMessage(count: number, userName?: string): string {
    const messages = userName ? [
      `New record ${userName}! ${count} reps!`,
      `Personal best ${userName}! ${count}!`,
      `${userName}, you just beat your record! ${count}!`,
      `That's a new high ${userName}! ${count} reps!`
    ] : [
      `New record! ${count} reps!`,
      `Personal best! ${count}!`,
      `You just beat your record! ${count}!`,
      `That's a new high! ${count} reps!`,
      `Record breaker! ${count}!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getFormCorrection(userName?: string): string {
    if (this.context.consecutiveIncorrect === 1) {
      const gentle = userName ? [
        `Hey ${userName}, let's adjust that form a bit!`,
        `${userName}, watch your posture there!`,
        `${userName}, small tweak needed on form!`,
        `Just a little adjustment ${userName}!`
      ] : [
        "Let's adjust that form!",
        "Watch your posture!",
        "Small tweak needed!",
        "Focus on technique!"
      ];
      return gentle[Math.floor(Math.random() * gentle.length)];
    } else if (this.context.consecutiveIncorrect === 2) {
      const firm = userName ? [
        `${userName}, remember to keep your body straight!`,
        `${userName}, let's work on that range of motion!`,
        `${userName}, full movement! You got this!`,
        `${userName}, control the movement! Almost there!`
      ] : [
        "Keep your body straight!",
        "Work on that range!",
        "Full range of motion!",
        "Control the movement!"
      ];
      return firm[Math.floor(Math.random() * firm.length)];
    } else {
      const encouraging = userName ? [
        `${userName}, no worries! Let's slow down and perfect it!`,
        `You got this ${userName}! Quality over quantity!`,
        `${userName}, take your time! Form is everything!`,
        `${userName}, let's nail this technique together!`
      ] : [
        "No worries! Let's perfect it!",
        "You got this! Quality matters!",
        "Take your time! Form first!",
        "Let's nail the technique!"
      ];
      return encouraging[Math.floor(Math.random() * encouraging.length)];
    }
  }

  announceStart(activityName: string): void {
    // Set current workout
    this.context.currentWorkout = activityName;
    this.context.lastRepTime = Date.now();
    
    const userName = this.getUserName();
    const messages = userName ? [
      `Welcome back ${userName}! Let's crush these ${activityName}!`,
      `Hey ${userName}! Ready to dominate ${activityName}? Let's go!`,
      `${userName}! Time to show what you're made of! ${activityName} starting now!`,
      `Alright ${userName}, let's make this ${activityName} session count!`,
      `${userName}! I'm excited to see you work! ${activityName} time!`
    ] : [
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
    
    // Start idle detection
    this.startIdleDetection();
  }
  
  /**
   * Start monitoring for idle periods
   */
  private startIdleDetection() {
    // Clear any existing interval
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
    
    // Check every 5 seconds if user is idle
    this.idleCheckInterval = window.setInterval(() => {
      const timeSinceLastRep = Date.now() - this.context.lastRepTime;
      
      // If idle for more than 8 seconds, give motivational push
      if (timeSinceLastRep > 8000 && !this.isSpeaking) {
        const idleMessage = getWorkoutMessage(this.context.currentWorkout, 'idle');
        this.speak(idleMessage, true);
        // Reset timer to avoid spam
        this.context.lastRepTime = Date.now();
      }
    }, 5000);
  }
  
  /**
   * Stop idle detection
   */
  private stopIdleDetection() {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
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
    this.stopIdleDetection();
    this.audioQueue = []; // Clear queue
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isProcessingQueue = false;
  }

  reset(): void {
    this.lastSpeakTime = 0;
    this.stopIdleDetection();
    this.audioQueue = []; // Clear queue
    this.isProcessingQueue = false;
    this.context = {
      lastMessageType: '',
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      personalBest: this.context.personalBest, // Keep personal best
      totalReps: 0,
      sessionStartTime: Date.now(),
      lastRepTime: Date.now(),
      currentWorkout: ''
    };
    this.stop();
  }
}

export const elevenLabsTTS = new ElevenLabsTTSService();
