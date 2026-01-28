import LiveRecorderRevamped from './LiveRecorderRevamped';

interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const GhostLiveRecorder = ({ activityName, ghostGif, onBack, onComplete }: GhostLiveRecorderProps) => {
  return (
    <div className="ghost-mode-page relative w-full h-full min-h-screen">
      {/* Revamped Live Recorder - No landscape requirement */}
      <LiveRecorderRevamped
        activityName={activityName}
        onBack={onBack}
        onComplete={onComplete}
      />
    </div>
  );
};

export default GhostLiveRecorder;
