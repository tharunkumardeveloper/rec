import { useState } from 'react';
import FaceVerificationScreen from '@/components/verification/FaceVerificationScreen';
import WorkoutInterface from './WorkoutInterface';

interface WorkoutWithVerificationProps {
  activityName: string;
  onBack: () => void;
}

export default function WorkoutWithVerification({
  activityName,
  onBack
}: WorkoutWithVerificationProps) {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [showRetryMessage, setShowRetryMessage] = useState(false);

  // Get athlete info from localStorage
  const athleteId = localStorage.getItem('userId') || '';
  const athleteName = localStorage.getItem('userName') || 'Athlete';

  const handleVerified = () => {
    setVerificationStatus('verified');
  };

  const handleFailed = () => {
    setVerificationStatus('failed');
    setShowRetryMessage(true);
    
    // Allow retry after 10 seconds
    setTimeout(() => {
      setShowRetryMessage(false);
      setVerificationStatus('pending');
    }, 10000);
  };

  // Show verification screen first
  if (verificationStatus === 'pending') {
    return (
      <FaceVerificationScreen
        onVerified={handleVerified}
        onFailed={handleFailed}
        athleteId={athleteId}
        athleteName={athleteName}
      />
    );
  }

  // Show failed message
  if (verificationStatus === 'failed' && showRetryMessage) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-950 via-red-900 to-red-950 z-50 flex items-center justify-center p-4">
        <div className="text-center text-white space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold">Verification Failed</h1>
          <p className="text-xl">Exercise blocked for security reasons</p>
          <p className="text-sm text-red-300">Retrying in a moment...</p>
        </div>
      </div>
    );
  }

  // Proceed to workout after verification
  return (
    <WorkoutInterface
      activityName={activityName}
      onBack={onBack}
    />
  );
}
