// TTS Coach Service - Manages voice feedback during workouts
import { cloudTTS } from './cloudTTS';

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
    
    cloudTTS.setEnabled(this.settings.enabled);
  }

  updateSettings(settings: Partial<TTSSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('tts_settings', JSON.stringify(this.settings));
    cloudTTS.setEnabled(this.settings.enabled);
  }

  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  onRepCompleted(rep: number, activityName: string, isCorrect: boolean) {
    // Speak every 3 seconds automatically
    if (rep !== this.lastSpokenRep) {
      const message = cloudTTS.getEncouragement(rep, isCorrect);
      cloudTTS.speak(message);
      this.lastSpokenRep = rep;
    }
  }

  onWorkoutStart(activityName: string) {
    cloudTTS.announceStart(activityName);
  }

  onWorkoutEnd(totalReps: number, correctReps: number, activityName: string = 'workout') {
    const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
    cloudTTS.announceEnd(totalReps, accuracy);
  }

  onHighScore(currentReps: number, previousBest: number) {
    if (currentReps > previousBest) {
      cloudTTS.speak(`New personal record! ${currentReps} reps!`, true);
    }
  }

  reset() {
    this.lastSpokenRep = 0;
    cloudTTS.reset();
  }

  stop() {
    cloudTTS.stop();
  }
}

export const ttsCoach = new TTSCoach();
