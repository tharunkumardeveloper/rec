import LiveRecorderClean from './LiveRecorderClean';

interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
}

const GhostLiveRecorder = ({ activityName, ghostGif, onBack, onComplete }: GhostLiveRecorderProps) => {
  return (
    <div className="ghost-mode-page relative w-full h-full min-h-screen">
      {/* Clean Live Recorder - No landscape requirement */}
      <LiveRecorderClean
        activityName={activityName}
        onBack={onBack}
        onComplete={onComplete}
      />
    </div>
  );
};

export default GhostLiveRecorder;
