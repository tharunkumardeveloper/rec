// TTS Coach Service - Provides motivational voice feedback during workouts
import { groqTTS } from './groqTTS';

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
  private speechQueue: string[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('tts_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      enabled: true,
      voice: 'Microsoft Zira - English (United States)', // Default to Microsoft female voice
      pitch: 1,
      rate: 0.9, // Slightly slower for clarity
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
        // Auto-select Microsoft female voice if available
        if (!this.settings.voice) {
          const microsoftVoice = this.voices.find(v => 
            v.name.includes('Microsoft') && 
            (v.name.includes('Zira') || v.name.includes('Female'))
          );
          if (microsoftVoice) {
            this.settings.voice = microsoftVoice.name;
            localStorage.setItem('tts_settings', JSON.stringify(this.settings));
          }
        }
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

  private speak(text: string, priority: boolean = false) {
    if (!this.synth || !this.settings.enabled) return;

    // Add to queue if not priority
    if (!priority && this.isSpeaking) {
      this.speechQueue.push(text);
      return;
    }

    // Cancel current speech if priority
    if (priority && this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to use Microsoft Edge voice first
    const microsoftVoice = this.voices.find(v => 
      v.name === this.settings.voice || 
      (v.name.includes('Microsoft') && v.name.includes('Zira'))
    );
    
    if (microsoftVoice) {
      utterance.voice = microsoftVoice;
    } else if (this.settings.voice) {
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
      // Process queue
      if (this.speechQueue.length > 0) {
        const nextText = this.speechQueue.shift();
        if (nextText) {
          setTimeout(() => this.speak(nextText), 300); // Small pause between messages
        }
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.synth.speak(utterance);
  }

  // More humanized workout-specific encouragements with natural pauses
  private pushupEncouragements = [
    "Great job! Keep those arms strong.",
    "You're doing amazing! I can see the effort.",
    "Wow! Your form is looking really good.",
    "That's it! Feel the strength building.",
    "Excellent work! You're getting stronger with each rep.",
    "Beautiful! Keep that steady pace going.",
    "Yes! You're absolutely crushing this.",
    "Perfect! Your dedication is really showing.",
    "Fantastic! Every rep is making you stronger.",
    "Outstanding! You should be proud of yourself."
  ];

  private pullupEncouragements = [
    "Incredible! Your upper body strength is impressive.",
    "Amazing! Pull yourself higher.",
    "Yes! You're making this look easy.",
    "Wonderful! Your back is getting so strong.",
    "Excellent! Keep that chin over the bar.",
    "Great form! You're a natural at this.",
    "Impressive! Your grip strength is solid.",
    "Beautiful! Every pull makes you stronger.",
    "Outstanding! You're flying through these.",
    "Fantastic! Your power is really showing."
  ];

  private situpEncouragements = [
    "Perfect! Your core is on fire.",
    "Excellent! Feel that ab engagement.",
    "Great work! Your core strength is building.",
    "Amazing! Keep that steady rhythm.",
    "Wonderful! Your abs are working hard.",
    "Yes! You're building an iron core.",
    "Beautiful! Maintain that control.",
    "Outstanding! Your core power is impressive.",
    "Fantastic! Feel that burn, that's progress.",
    "Incredible! You're a core strength champion."
  ];

  private getWorkoutEncouragements(activityName: string): string[] {
    if (activityName.toLowerCase().includes('push')) {
      return this.pushupEncouragements;
    } else if (activityName.toLowerCase().includes('pull')) {
      return this.pullupEncouragements;
    } else if (activityName.toLowerCase().includes('sit')) {
      return this.situpEncouragements;
    }
    return this.pushupEncouragements;
  }

  // More humanized rep milestone messages
  private getRepMessage(rep: number, activityName: string): string {
    const encouragements = this.getWorkoutEncouragements(activityName);
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    if (rep === 1) {
      return "Alright! Here we go. First one down, you're doing great.";
    } else if (rep === 5) {
      return `Nice! That's ${rep} reps already. ${randomEncouragement}`;
    } else if (rep === 10) {
      return `Wow! Double digits! ${rep} reps and counting. You're on fire!`;
    } else if (rep === 15) {
      return `Amazing! ${rep} reps! ${randomEncouragement}`;
    } else if (rep === 20) {
      return `Twenty reps! You're a machine! ${randomEncouragement}`;
    } else if (rep === 25) {
      return `Incredible! Twenty five reps! You're unstoppable!`;
    } else if (rep === 30) {
      return `Thirty reps! Wow! Your endurance is phenomenal!`;
    } else if (rep % 10 === 0) {
      return `${rep} reps! ${randomEncouragement}`;
    } else if (rep % 5 === 0) {
      return `${rep} and counting! You're doing so well!`;
    } else if (rep % 2 === 0 && Math.random() > 0.7) {
      return randomEncouragement;
    }
    
    return '';
  }

  // More gentle and encouraging form correction messages
  private formCorrectionMessages = [
    "Hey, let's adjust that form a little. You're doing great, just need a small tweak.",
    "Almost perfect! Just check your posture and you'll nail it.",
    "Good effort! Let's focus on form for the next one.",
    "You're so close! Just adjust your position slightly.",
    "Nice try! Remember, quality over speed. You've got this.",
    "That's okay! Let's get that form right. Take your time.",
    "Good attempt! Focus on your alignment for the next rep."
  ];

  onRepCompleted(rep: number, activityName: string, isCorrect: boolean) {
    // Use AI-generated messages for more natural feedback
    groqTTS.generateEncouragement({
      workoutType: activityName,
      repNumber: rep,
      isCorrectForm: isCorrect
    }).then(message => {
      if (!isCorrect) {
        // Give gentle form feedback occasionally
        if (Math.random() > 0.6) {
          this.speak(message);
        }
        return;
      }

      // Check if we should speak for this rep
      const shouldSpeak = rep === 1 || 
                         rep % 5 === 0 || 
                         (rep % 2 === 0 && Math.random() > 0.7);

      if (shouldSpeak && rep !== this.lastSpokenRep) {
        this.speak(message);
        this.lastSpokenRep = rep;
      }
    }).catch(error => {
      console.error('AI message generation failed:', error);
      // Fallback to default messages
      if (!isCorrect) {
        if (Math.random() > 0.6) {
          const message = this.formCorrectionMessages[Math.floor(Math.random() * this.formCorrectionMessages.length)];
          this.speak(message);
        }
        return;
      }

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
    });
  }

  onWorkoutStart(activityName: string) {
    // Use AI-generated start message
    groqTTS.generateWorkoutStart(activityName).then(message => {
      this.speak(message, true); // Priority message
    }).catch(error => {
      console.error('AI message generation failed:', error);
      // Fallback to default
      const startMessages = [
        `Alright! Let's do this. Time for some ${activityName}. You've got this!`,
        `Ready? Let's crush these ${activityName} together!`,
        `Here we go! ${activityName} time. I know you can do this!`,
        `Let's make these ${activityName} count. You're going to do amazing!`
      ];
      const message = startMessages[Math.floor(Math.random() * startMessages.length)];
      this.speak(message, true);
    });
  }

  onWorkoutEnd(totalReps: number, correctReps: number, activityName: string = 'workout') {
    // Use AI-generated end message
    groqTTS.generateWorkoutEnd(totalReps, correctReps, activityName).then(message => {
      this.speak(message, true); // Priority message
    }).catch(error => {
      console.error('AI message generation failed:', error);
      // Fallback to default
      const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
      
      let message = '';
      if (accuracy >= 80) {
        message = `Wow! Amazing work! You completed ${totalReps} reps with ${accuracy}% accuracy. You're a true champion!`;
      } else if (accuracy >= 60) {
        message = `Great effort! You did ${totalReps} reps. That's fantastic! Let's keep working on that form together.`;
      } else {
        message = `Good job finishing! You completed ${totalReps} reps. I'm proud of you for pushing through. Let's focus on form next time, okay?`;
      }
      
      this.speak(message, true);
    });
  }

  onHighScore(currentReps: number, previousBest: number) {
    if (currentReps > previousBest) {
      this.speak(`Oh my gosh! New personal record! You just beat your best of ${previousBest}! Keep going, you're amazing!`, true);
    } else if (currentReps === previousBest - 2) {
      this.speak(`You're so close to your record of ${previousBest}! Just two more! You can do this!`, true);
    }
  }

  reset() {
    this.lastSpokenRep = 0;
    this.speechQueue = [];
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  stop() {
    this.speechQueue = [];
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

// Export singleton instance
export const ttsCoach = new TTSCoach();
