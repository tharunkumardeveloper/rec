// TTS Coach Service - Manages voice feedback during workouts
import { elevenLabsTTS } from './elevenLabsTTS';

interface TTSSettings {
  enabled: boolean;
}

class TTSCoach {
  private settings: TTSSettings;
  private lastSpokenRep: number = 0;

  constructor() {
    const savedSettings = localStorage.getItem('tts_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      enabled: true
    };
    
    elevenLabsTTS.setEnabled(this.settings.enabled);
  }

  updateSettings(settings: Partial<TTSSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('tts_settings', JSON.stringify(this.settings));
    elevenLabsTTS.setEnabled(this.settings.enabled);
  }

  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  onRepCompleted(rep: number, activityName: string, isCorrect: boolean) {
    // Speak every 3 seconds automatically
    if (rep !== this.lastSpokenRep) {
      const message = elevenLabsTTS.getEncouragement(rep, isCorrect);
      elevenLabsTTS.speak(message);
      this.lastSpokenRep = rep;
    }
  }

  onWorkoutStart(activityName: string) {
    elevenLabsTTS.announceStart(activityName);
  }

  onWorkoutEnd(totalReps: number, correctReps: number, activityName: string = 'workout') {
    const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
    elevenLabsTTS.announceEnd(totalReps, accuracy);
  }

  onHighScore(currentReps: number, previousBest: number) {
    if (currentReps > previousBest) {
      elevenLabsTTS.speak(`New personal record! ${currentReps} reps!`, true);
    }
  }

  reset() {
    this.lastSpokenRep = 0;
    elevenLabsTTS.reset();
  }

  stop() {
    elevenLabsTTS.stop();
  }
}

export const ttsCoach = new TTSCoach();
