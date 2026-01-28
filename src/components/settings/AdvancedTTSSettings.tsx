import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Play, RotateCcw, Sparkles } from 'lucide-react';
import { elevenLabsTTS } from '@/services/elevenLabsTTS';

const AdvancedTTSSettings = () => {
  const [settings, setSettings] = useState(elevenLabsTTS.getVoiceSettings());
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM');

  const voices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Natural, warm, encouraging (Default)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Young, energetic, upbeat' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Friendly, clear, motivating' },
    { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', description: 'Professional, warm, confident' }
  ];

  const handleStabilityChange = (value: number[]) => {
    const newSettings = { ...settings, stability: value[0] };
    setSettings(newSettings);
    elevenLabsTTS.updateVoiceSettings(newSettings);
  };

  const handleSimilarityChange = (value: number[]) => {
    const newSettings = { ...settings, similarity_boost: value[0] };
    setSettings(newSettings);
    elevenLabsTTS.updateVoiceSettings(newSettings);
  };

  const handleStyleChange = (value: number[]) => {
    const newSettings = { ...settings, style: value[0] };
    setSettings(newSettings);
    elevenLabsTTS.updateVoiceSettings(newSettings);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    elevenLabsTTS.setVoice(voiceId);
  };

  const resetToDefaults = () => {
    const defaults = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };
    setSettings(defaults);
    elevenLabsTTS.updateVoiceSettings(defaults);
    setSelectedVoice('21m00Tcm4TlvDq8ikWAM');
    elevenLabsTTS.setVoice('21m00Tcm4TlvDq8ikWAM');
  };

  const testCurrentSettings = () => {
    const testMessages = [
      "10 reps! You're crushing it!",
      "Perfect form! Keep it up!",
      "You're on fire! Don't stop now!",
      "Amazing work! You got this!"
    ];
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    elevenLabsTTS.speak(randomMessage, true);
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Advanced Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>Voice Character</Label>
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map(voice => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stability Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Stability</Label>
            <span className="text-sm text-muted-foreground">{settings.stability.toFixed(2)}</span>
          </div>
          <Slider
            value={[settings.stability]}
            onValueChange={handleStabilityChange}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Lower = More expressive and varied • Higher = More consistent
          </p>
        </div>

        {/* Similarity Boost Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Clarity</Label>
            <span className="text-sm text-muted-foreground">{settings.similarity_boost.toFixed(2)}</span>
          </div>
          <Slider
            value={[settings.similarity_boost]}
            onValueChange={handleSimilarityChange}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Lower = More creative • Higher = More natural and clear
          </p>
        </div>

        {/* Style Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Expressiveness</Label>
            <span className="text-sm text-muted-foreground">{settings.style.toFixed(2)}</span>
          </div>
          <Slider
            value={[settings.style]}
            onValueChange={handleStyleChange}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Lower = Neutral tone • Higher = More emotional and dynamic
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testCurrentSettings}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetToDefaults}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-md border border-primary/10">
          <Sparkles className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Dynamic AI Coaching</p>
            <p>Voice adapts based on your performance, form, and progress. Messages vary between rep counts, encouragement, posture praise, and energy boosts for an ultra-realistic experience.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedTTSSettings;
