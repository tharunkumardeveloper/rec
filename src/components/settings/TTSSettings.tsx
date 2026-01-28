import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { ttsCoach } from '@/services/ttsCoach';

const TTSSettings = () => {
  const [settings, setSettings] = useState(ttsCoach.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load Murf AI voices
    const availableVoices = ttsCoach.getAvailableVoices();
    setVoices(availableVoices.map(voiceId => ({
      name: voiceId,
      lang: 'en-US'
    } as SpeechSynthesisVoice)));
  }, []);

  const handleToggle = () => {
    const newEnabled = !settings.enabled;
    setSettings(prev => ({ ...prev, enabled: newEnabled }));
    ttsCoach.updateSettings({ enabled: newEnabled });
  };

  const handleVoiceChange = (voiceName: string) => {
    setSettings(prev => ({ ...prev, voice: voiceName }));
    ttsCoach.updateSettings({ voice: voiceName });
  };

  const handlePitchChange = (pitch: number) => {
    setSettings(prev => ({ ...prev, pitch }));
    ttsCoach.updateSettings({ pitch });
  };

  const handleRateChange = (rate: number) => {
    setSettings(prev => ({ ...prev, rate }));
    ttsCoach.updateSettings({ rate });
  };

  const handleVolumeChange = (volume: number) => {
    setSettings(prev => ({ ...prev, volume }));
    ttsCoach.updateSettings({ volume });
  };

  const testVoice = () => {
    const testMessages = [
      "You're crushing it! Keep going!",
      "That's 10 reps! You're on fire!",
      "Amazing work! You're a champion!"
    ];
    const message = testMessages[Math.floor(Math.random() * testMessages.length)];
    
    // Use Murf AI directly for testing
    import('@/services/murfTTS').then(({ murfTTS }) => {
      murfTTS.speak(message, true);
    });
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Voice Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="tts-enabled">Enable Voice Coach</Label>
            <p className="text-sm text-muted-foreground">Get motivational voice feedback during workouts</p>
          </div>
          <Switch
            id="tts-enabled"
            checked={settings.enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <select
                id="voice-select"
                value={settings.voice}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Default Voice</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred voice for workout encouragement
              </p>
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pitch-slider">Pitch</Label>
                <span className="text-sm text-muted-foreground">{settings.pitch.toFixed(1)}</span>
              </div>
              <input
                id="pitch-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust voice pitch (0.5 = low, 2.0 = high)
              </p>
            </div>

            {/* Rate Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rate-slider">Speed</Label>
                <span className="text-sm text-muted-foreground">{settings.rate.toFixed(1)}</span>
              </div>
              <input
                id="rate-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust speaking speed (0.5 = slow, 2.0 = fast)
              </p>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider">Volume</Label>
                <span className="text-sm text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust voice volume
              </p>
            </div>

            {/* Test Button */}
            <Button
              onClick={testVoice}
              variant="outline"
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TTSSettings;
