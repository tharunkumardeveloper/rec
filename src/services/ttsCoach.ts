// TTS Coach Service - Provides motivational voice feedback during workouts

interface TTSSettings {
  enabled: boolean;
  voice: string;
  pitch: number;
  rate: number;
  volume: number;
}

class TTSCoach {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: TTSSettings;
  private lastSpokenRep: number = 0;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('tts_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      enabled: true,
      voice: '',
      pitch: 1,
      rate: 1,
      volume: 1
    };
  }

  private loadVoices() {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth!.getVoices();
      };
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  updateSettings(settings: Partial<TTSSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('tts_settings', JSON.stringify(this.settings));
  }

  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  private speak(text: string) {
    if (!this.synth || !this.settings.enabled || this.isSpeaking) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    if (this.settings.voice) {
      const selectedVoice = this.voices.find(v => v.name === this.settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.pitch = this.settings.pitch;
    utterance.rate = this.settings.rate;
    utterance.volume = this.settings.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.synth.speak(utterance);
  }

  // Workout-specific encouragements
  private pushupEncouragements = [
    "Keep those arms strong!",
    "You're crushing it!",
    "Feel the burn, that's progress!",
    "Your form is looking great!",
    "Beast mode activated!",
    "You're stronger than you think!",
    "Every rep counts!",
    "Push through, you got this!",
    "That's what I'm talking about!",
    "Absolutely killing it!"
  ];

  private pullupEncouragements = [
    "Pull yourself to greatness!",
    "You're a pull-up machine!",
    "Grip it and rip it!",
    "Your back is getting stronger!",
    "Chin over that bar!",
    "You're unstoppable!",
    "Feel that power!",
    "Every pull makes you stronger!",
    "You're flying now!",
    "Incredible strength!"
  ];

  private situpEncouragements = [
    "Core of steel!",
    "Your abs are on fire!",
    "Engage that core!",
    "You're building an iron core!",
    "Keep that rhythm going!",
    "Your core strength is amazing!",
    "Abs are made here!",
    "You're a sit-up champion!",
    "Feel that core burn!",
    "Unstoppable core power!"
  ];

  private getWorkoutEncouragements(activityName: string): string[] {
    if (activityName.toLowerCase().includes('push')) {
      return this.pushupEncouragements;
    } else if (activityName.toLowerCase().includes('pull')) {
      return this.pullupEncouragements;
    } else if (activityName.toLowerCase().includes('sit')) {
      return this.situpEncouragements;
    }
    return this.pushupEncouragements; // Default
  }

  // Rep milestone messages
  private getRepMessage(rep: number, activityName: string): string {
    const encouragements = this.getWorkoutEncouragements(activityName);
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    if (rep === 1) {
      return "Here we go! First one down!";
    } else if (rep === 5) {
      return `Nice! ${rep} reps! ${randomEncouragement}`;
    } else if (rep === 10) {
      return `Double digits! ${rep} and counting! You're on fire!`;
    } else if (rep === 15) {
      return `Wow, ${rep} reps! ${randomEncouragement}`;
    } else if (rep === 20) {
      return `Twenty! You're a machine! ${randomEncouragement}`;
    } else if (rep === 25) {
      return `Quarter century! ${rep} reps! Incredible!`;
    } else if (rep === 30) {
      return `Thirty reps! You're unstoppable!`;
    } else if (rep % 10 === 0) {
      return `${rep} reps! ${randomEncouragement}`;
    } else if (rep % 5 === 0) {
      return `${rep} and counting! Keep it up!`;
    } else if (rep % 2 === 0 && Math.random() > 0.7) {
      // Random encouragement every 2 reps (30% chance)
      return randomEncouragement;
    }
    
    return '';
  }

  // Form correction messages
  private formCorrectionMessages = [
    "Check your form, you got this!",
    "Let's fix that posture, nice and steady",
    "Adjust your form, you're doing great!",
    "Form first, speed second!",
    "Take your time, perfect that form!",
    "Quality over quantity, adjust that posture!",
    "Let's get that form right, you're almost there!"
  ];

  onRepCompleted(rep: number, activityName: string, isCorrect: boolean) {
    if (!isCorrect) {
      // Give form feedback occasionally
      if (Math.random() > 0.5) {
        const message = this.formCorrectionMessages[Math.floor(Math.random() * this.formCorrectionMessages.length)];
        this.speak(message);
      }
      return;
    }

    // Check if we should speak for this rep
    const shouldSpeak = rep === 1 || 
                       rep % 5 === 0 || 
                       (rep % 2 === 0 && Math.random() > 0.7);

    if (shouldSpeak && rep !== this.lastSpokenRep) {
      const message = this.getRepMessage(rep, activityName);
      if (message) {
        this.speak(message);
        this.lastSpokenRep = rep;
      }
    }
  }

  onWorkoutStart(activityName: string) {
    const startMessages = [
      `Let's do this! Time for some ${activityName}!`,
      `Ready to crush these ${activityName}? Let's go!`,
      `${activityName} time! You've got this!`,
      `Alright, let's make these ${activityName} count!`
    ];
    const message = startMessages[Math.floor(Math.random() * startMessages.length)];
    this.speak(message);
  }

  onWorkoutEnd(totalReps: number, correctReps: number) {
    const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
    
    let message = '';
    if (accuracy >= 80) {
      message = `Amazing work! ${totalReps} reps with ${accuracy}% accuracy! You're a champion!`;
    } else if (accuracy >= 60) {
      message = `Great effort! ${totalReps} reps completed! Keep working on that form!`;
    } else {
      message = `Good job finishing! ${totalReps} reps done! Let's focus on form next time!`;
    }
    
    this.speak(message);
  }

  onHighScore(currentReps: number, previousBest: number) {
    if (currentReps > previousBest) {
      this.speak(`New personal record! You just beat your best of ${previousBest}! Keep going!`);
    } else if (currentReps === previousBest - 2) {
      this.speak(`You're so close to your record of ${previousBest}! Push through!`);
    }
  }

  reset() {
    this.lastSpokenRep = 0;
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

// Export singleton instance
export const ttsCoach = new TTSCoach();
