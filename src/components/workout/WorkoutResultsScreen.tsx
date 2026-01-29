import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, TrendingUp, Home, Play, Download, Image as ImageIcon } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

interface WorkoutResultsScreenProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: any[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreen = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [frameCaptures, setFrameCaptures] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  // Capture frames from video
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      captureFrames();
    }
  }, [videoUrl]);

  const captureFrames = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for video to load
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
      if (video.readyState >= 2) resolve();
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const captures: string[] = [];
    const framesToCapture = Math.min(6, totalReps); // Capture up to 6 frames

    for (let i = 0; i < framesToCapture; i++) {
      const time = (video.duration / framesToCapture) * i;
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          captures.push(canvas.toDataURL('image/jpeg', 0.8));
          resolve();
        };
      });
    }

    setFrameCaptures(captures);
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Get user info
      const userName = localStorage.getItem('user_name') || 'Athlete';
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Page 1: Header and Summary
      pdf.setFillColor(88, 28, 135); // Purple
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Workout Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(activityName, pageWidth / 2, 30, { align: 'center' });

      // User Profile Section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Athlete Profile', 20, 55);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${userName}`, 20, 65);
      pdf.text(`Date: ${currentDate}`, 20, 72);
      pdf.text(`Workout Type: ${activityName}`, 20, 79);

      // Key Metrics Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Metrics', 20, 95);

      const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
      const formScore = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work';

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Reps: ${totalReps}`, 20, 105);
      pdf.text(`Correct Reps: ${correctReps}`, 20, 112);
      pdf.text(`Incorrect Reps: ${incorrectReps}`, 20, 119);
      pdf.text(`Duration: ${formatTime(duration)}`, 20, 126);
      pdf.text(`Accuracy: ${accuracy}%`, 20, 133);
      pdf.text(`Form Score: ${formScore}`, 20, 140);

      // Performance Chart (Simple bar representation)
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Breakdown', 20, 160);

      const barY = 170;
      const barHeight = 8;
      const maxBarWidth = 170;

      // Correct reps bar
      pdf.setFillColor(34, 197, 94); // Green
      const correctWidth = (correctReps / totalReps) * maxBarWidth;
      pdf.rect(20, barY, correctWidth, barHeight, 'F');
      pdf.setFontSize(10);
      pdf.text(`Correct: ${correctReps}`, 20, barY - 2);

      // Incorrect reps bar
      pdf.setFillColor(239, 68, 68); // Red
      const incorrectWidth = (incorrectReps / totalReps) * maxBarWidth;
      pdf.rect(20, barY + 15, incorrectWidth, barHeight, 'F');
      pdf.text(`Incorrect: ${incorrectReps}`, 20, barY + 13);

      // Frame Captures Section
      if (frameCaptures.length > 0) {
        pdf.addPage();
        pdf.setFillColor(88, 28, 135);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Workout Frames', pageWidth / 2, 18, { align: 'center' });

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Key moments captured during your workout:', 20, 45);

        let yPos = 55;
        const imgWidth = 80;
        const imgHeight = 60;
        const spacing = 10;

        for (let i = 0; i < Math.min(6, frameCaptures.length); i++) {
          const xPos = i % 2 === 0 ? 20 : 110;
          
          if (i > 0 && i % 2 === 0) {
            yPos += imgHeight + spacing + 5;
          }

          if (yPos + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.addImage(frameCaptures[i], 'JPEG', xPos, yPos, imgWidth, imgHeight);
          pdf.setFontSize(9);
          pdf.text(`Frame ${i + 1}`, xPos + imgWidth / 2, yPos + imgHeight + 5, { align: 'center' });
        }
      }

      // Rep Details Page
      if (repDetails.length > 0) {
        pdf.addPage();
        pdf.setFillColor(88, 28, 135);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Rep-by-Rep Analysis', pageWidth / 2, 18, { align: 'center' });

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');

        let yPos = 45;
        repDetails.slice(0, 20).forEach((rep: any, index: number) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
          }

          const status = rep.correct ? '✓' : '✗';
          const color: [number, number, number] = rep.correct ? [34, 197, 94] : [239, 68, 68];
          
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${status} Rep ${rep.rep || index + 1}`, 20, yPos);
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          
          if (rep.min_elbow !== undefined) {
            pdf.text(`Elbow: ${rep.min_elbow}°`, 60, yPos);
          }
          if (rep.plank_angle !== undefined) {
            pdf.text(`Plank: ${rep.plank_angle}°`, 100, yPos);
          }
          if (rep.angle !== undefined) {
            pdf.text(`Angle: ${rep.angle}°`, 60, yPos);
          }
          if (rep.knee_angle !== undefined) {
            pdf.text(`Knee: ${rep.knee_angle}°`, 60, yPos);
          }

          yPos += 8;
        });
      }

      // Footer on last page
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Generated by Talent Track - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`${activityName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
  const formScore = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-y-auto">
      <div ref={reportRef} className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold">Workout Complete!</h1>
          <p className="text-purple-200">{activityName}</p>
          <p className="text-sm text-purple-300">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Annotated Video */}
        {videoUrl && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Your Performance</h2>
              <Play className="w-5 h-5 text-purple-300" />
            </div>
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <p className="text-sm text-purple-200 mt-3">
              📹 Watch your workout with real-time metrics and form analysis
            </p>
          </div>
        )}

        {/* Frame Captures */}
        {frameCaptures.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ImageIcon className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Workout Frames</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {frameCaptures.map((frame, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-black">
                  <img 
                    src={frame} 
                    alt={`Frame ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs text-center">
                    Frame {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2">{totalReps}</div>
            <div className="text-purple-200 text-sm">Total Reps</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2 text-green-400">{correctReps}</div>
            <div className="text-purple-200 text-sm">Correct</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2 text-red-400">{incorrectReps}</div>
            <div className="text-purple-200 text-sm">Incorrect</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-4xl font-bold mb-2">{formatTime(duration)}</div>
            <div className="text-purple-200 text-sm">Duration</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Form Accuracy</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {formScore}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Correct Reps</span>
              </div>
              <span className="text-2xl font-bold">{correctReps}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Incorrect Reps</span>
              </div>
              <span className="text-2xl font-bold">{incorrectReps}</span>
            </div>

            <div className="mt-4 bg-white/5 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            <div className="text-center text-sm text-purple-200">{accuracy}% Accuracy</div>
          </div>
        </div>

        {/* Rep Details */}
        {repDetails.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Rep-by-Rep Analysis</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {repDetails.map((rep: any, index: number) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    rep.correct ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {rep.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-semibold">Rep {rep.rep || index + 1}</span>
                  </div>
                  <div className="text-sm text-right">
                    {rep.min_elbow !== undefined && <div>Elbow: {rep.min_elbow}°</div>}
                    {rep.plank_angle !== undefined && <div>Plank: {rep.plank_angle}°</div>}
                    {rep.angle !== undefined && <div>Angle: {rep.angle}°</div>}
                    {rep.knee_angle !== undefined && <div>Knee: {rep.knee_angle}°</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Performance Insights</h2>
          </div>
          <div className="space-y-2 text-purple-200">
            {accuracy >= 80 && (
              <p>🎉 Excellent form! Keep up the great work!</p>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <p>👍 Good effort! Focus on maintaining proper form throughout each rep.</p>
            )}
            {accuracy < 60 && (
              <p>💪 Keep practicing! Pay attention to form and technique.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex-1 bg-green-600 hover:bg-green-700 py-6 text-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button
            onClick={onHome}
            className="flex-1 bg-white text-purple-900 hover:bg-purple-100 py-6 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsScreen;
