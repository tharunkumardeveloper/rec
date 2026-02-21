import LiveRecorderClean from './LiveRecorderClean';

interface GhostLiveRecorderProps {
  activityName: string;
  ghostGif: string;
  onBack: () => void;
  onComplete: (results: any) => void;
  initialFacingMode?: 'user' | 'environment';
}

const GhostLiveRecorder = ({ activityName, ghostGif, onBack, onComplete, initialFacingMode }: GhostLiveRecorderProps) => {
  return (
    <div className="ghost-mode-page relative w-full h-full min-h-screen">
      {/* Clean Live Recorder - No landscape requirement */}
      <LiveRecorderClean
        activityName={activityName}
        onBack={onBack}
        onComplete={onComplete}
        initialFacingMode={initialFacingMode}
      />
    </div>
  );
};

export default GhostLiveRecorder;
