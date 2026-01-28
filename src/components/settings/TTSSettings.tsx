import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Play, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ttsCoach } from '@/services/ttsCoach';
import { elevenLabsTTS } from '@/services/elevenLabsTTS';
import AdvancedTTSSettings from './AdvancedTTSSettings';

const TTSSettings = () => {
  const [enabled, setEnabled] = useState(ttsCoach.getSettings().enabled);
  const [voiceInfo, setVoiceInfo] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    ttsCoach.updateSettings({ enabled: newEnabled });
  };

  const testVoice = () => {
    const testMessages = [
      "10 reps! You're crushing it!",
      "Perfect form! Looking strong!",
      "You're on fire! Keep pushing!",
      "Amazing work! You got this!",
      "That's the spirit! Don't stop now!"
    ];
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    elevenLabsTTS.speak(randomMessage, true);
    
    setTimeout(() => {
      setVoiceInfo(elevenLabsTTS.getVoiceInfo());
    }, 100);
  };

  return (
    <div className="space-y-4">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Voice Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="tts-enabled">Enable Voice Coach</Label>
              <p className="text-sm text-muted-foreground">
                Get dynamic, emotionally intelligent feedback every 3 seconds
              </p>
            </div>
            <Switch
              id="tts-enabled"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>
          
          <div className="pt-2 space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testVoice}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Test Voice
            </Button>
            
            {voiceInfo && (
              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {voiceInfo}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>Powered by ElevenLabs AI • Ultra-realistic voice</span>
            </div>

            {/* Advanced Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full mt-2"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Advanced Settings
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Advanced Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      {showAdvanced && <AdvancedTTSSettings />}
    </div>
  );
};

export default TTSSettings;
