// TTS Coach Service - Uses Microsoft Edge TTS only
import { edgeTTS } from './edgeTTS';

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
    
    edgeTTS.setEnabled(this.settings.enabled);
  }

  updateSettings(settings: Partial<TTSSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('tts_settings', JSON.stringify(this.settings));
    edgeTTS.setEnabled(this.settings.enabled);
  }

  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  onRepCompleted(rep: number, activityName: string, isCorrect: boolean) {
    // Speak every 5 seconds automatically (handled by edgeTTS)
    if (rep !== this.lastSpokenRep) {
      const message = edgeTTS.getEncouragement(rep, isCorrect);
      edgeTTS.speak(message);
      this.lastSpokenRep = rep;
    }
  }

  onWorkoutStart(activityName: string) {
    edgeTTS.announceStart(activityName);
  }

  onWorkoutEnd(totalReps: number, correctReps: number, activityName: string = 'workout') {
    const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
    edgeTTS.announceEnd(totalReps, accuracy);
  }

  onHighScore(currentReps: number, previousBest: number) {
    if (currentReps > previousBest) {
      edgeTTS.speak(`New record! ${currentReps} reps!`, true);
    }
  }

  reset() {
    this.lastSpokenRep = 0;
    edgeTTS.reset();
  }

  stop() {
    edgeTTS.stop();
  }
}

export const ttsCoach = new TTSCoach();
