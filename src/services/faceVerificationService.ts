const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
  anomalyFlag: boolean;
}

export interface VerificationRecord {
  face_verified: boolean;
  verification_confidence: number;
  anomaly_flag: boolean;
  verified_at: string;
}

export const verifyFace = async (
  athleteId: string,
  liveImage: string
): Promise<VerificationResult> => {
  try {
    const response = await fetch(`${API_URL}/api/verify-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        athleteId,
        liveImage,
      }),
    });

    if (!response.ok) {
      throw new Error('Verification request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Face verification error:', error);
    return {
      verified: false,
      confidence: 0,
      message: 'Verification service unavailable',
      anomalyFlag: true,
    };
  }
};

export const saveVerificationResult = async (
  athleteId: string,
  sessionId: string,
  result: VerificationResult
): Promise<void> => {
  try {
    await fetch(`${API_URL}/api/sessions/${sessionId}/verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        athleteId,
        face_verified: result.verified,
        verification_confidence: result.confidence,
        anomaly_flag: result.anomalyFlag,
        verified_at: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to save verification result:', error);
  }
};

export const getAthleteProfileImage = async (athleteId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/api/users/${athleteId}/profile-image`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.profileImage;
  } catch (error) {
    console.error('Failed to get profile image:', error);
    return null;
  }
};
