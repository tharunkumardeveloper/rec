import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Play } from 'lucide-react';
import { ttsCoach } from '@/services/ttsCoach';

const TTSSettings = () => {
  const [enabled, setEnabled] = useState(ttsCoach.getSettings().enabled);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    ttsCoach.updateSettings({ enabled: newEnabled });
  };

  const testVoice = () => {
    import('@/services/edgeTTS').then(({ edgeTTS }) => {
      edgeTTS.speak("10 reps! You're doing great!", true);
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
            <p className="text-sm text-muted-foreground">
              Get encouraging voice feedback every 5 seconds during workouts
            </p>
          </div>
          <Switch
            id="tts-enabled"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Voice coach will provide short, encouraging feedback including your rep count every 5 seconds during your workout.
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
