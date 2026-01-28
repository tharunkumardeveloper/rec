import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface HowToPerformScreenProps {
  activityName: string;
  onContinue: () => void;
  onBack: () => void;
}

const WORKOUT_DEMOS: { [key: string]: { 
  gifUrl: string; 
  instructions: string[];
}} = {
  'Push-ups': {
    gifUrl: '/pushup.gif',
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower your body until chest nearly touches the ground',
      'Push back up to starting position',
      'Keep your body in a straight line throughout'
    ]
  },
  'Pull-ups': {
    gifUrl: '/pullup.gif',
    instructions: [
      'Hang from bar with arms fully extended',
      'Pull yourself up until chin is over the bar',
      'Lower yourself back down with control',
      'Repeat without swinging'
    ]
  },
  'Sit-ups': {
    gifUrl: '/situp.gif',
    instructions: [
      'Lie on your back with knees bent',
      'Place hands behind head or across chest',
      'Curl up to touch your knees',
      'Lower back down with control'
    ]
  },
  'Vertical Jump': {
    gifUrl: '/verticaljump.gif',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Bend knees and swing arms back',
      'Explode upward, reaching as high as possible',
      'Land softly with bent knees'
    ]
  },
  'Shuttle Run': {
    gifUrl: '/shuttlerun.gif',
    instructions: [
      'Start at one line, sprint to the opposite line',
      'Touch the line with your hand',
      'Turn quickly and sprint back',
      'Repeat for the required number of laps'
    ]
  },
  'Modified Shuttle Run': {
    gifUrl: '/shuttlerun.gif',
    instructions: [
      'Start at one line with assistance if needed',
      'Move to the opposite line at your pace',
      'Touch the line and turn',
      'Return to starting position'
    ]
  },
  'Sit Reach': {
    gifUrl: '/sit&reach.gif',
    instructions: [
      'Sit with legs straight and feet against a box',
      'Place hands together and reach forward slowly',
      'Hold the maximum reach for 2 seconds',
      'Measure distance reached past your toes'
    ]
  },
  'Vertical Broad Jump': {
    gifUrl: '/verticaljump.gif',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Swing arms back and bend knees',
      'Jump forward as far as possible',
      'Land with both feet together'
    ]
  },
  'Standing Broad Jump': {
    gifUrl: '/verticaljump.gif',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Swing arms back and bend knees',
      'Jump forward explosively',
      'Land softly with bent knees'
    ]
  }
};

const HowToPerformScreen = ({ activityName, onContinue, onBack }: HowToPerformScreenProps) => {
  const demo = WORKOUT_DEMOS[activityName] || WORKOUT_DEMOS['Push-ups'];

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-black/90 to-transparent safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">How to Perform</h1>
              <p className="text-sm text-white/80">{activityName}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto">
        {/* GIF Demo */}
        <div className="w-full max-w-md aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <img 
            src={demo.gifUrl} 
            alt={`${activityName} demonstration`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Instructions */}
        <div className="w-full max-w-md bg-black/50 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Instructions
          </h3>
          <ol className="space-y-3">
            {demo.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-3 text-white">
                <div className="mt-0.5 shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 border border-primary text-primary text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Continue Button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="w-full max-w-md bg-green-600 hover:bg-green-700"
        >
          Got it! Continue
        </Button>
      </div>
    </div>
  );
};

export default HowToPerformScreen;
