import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, TrendingUp, Home, Play, Award, Zap, Target, Activity, Download } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import coachDashboardService from '@/services/coachDashboardService';

interface WorkoutResultsScreenProProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: PushupRepData[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreenPro = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenProProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [workoutScreenshots, setWorkoutScreenshots] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  // Capture screenshots from video for PDF
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      captureWorkoutScreenshots();
    }
  }, [videoUrl]);

  const captureWorkoutScreenshots = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
      if (video.readyState >= 2) resolve();
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const screenshots: string[] = [];
    const numScreenshots = Math.min(6, totalReps || 3);

    for (let i = 0; i < numScreenshots; i++) {
      const time = (video.duration / (numScreenshots + 1)) * (i + 1);
      video.currentTime = time;

      await new Promise<void>((resolve) => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          screenshots.push(canvas.toDataURL('image/jpeg', 0.7));
          resolve();
        };
      });
    }

    setWorkoutScreenshots(screenshots);
  };

  const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
  const formScore = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work';
  const scoreColor = accuracy >= 80 ? 'from-green-500 to-emerald-500' : accuracy >= 60 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-500';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const userName = localStorage.getItem('user_name') || 'Athlete';
      const userProfilePic = localStorage.getItem('user_profile_pic');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Header
      pdf.setFillColor(88, 28, 135);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Workout Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(activityName, pageWidth / 2, 30, { align: 'center' });

      // Profile Section with Picture
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Athlete Profile', 20, 55);
      
      let profileYPos = 65;
      
      // Add profile picture if available
      if (userProfilePic) {
        try {
          pdf.addImage(userProfilePic, 'JPEG', 20, 60, 25, 25);
          profileYPos = 65;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Name: ${userName}`, 50, profileYPos);
          pdf.text(`Date: ${currentDate}`, 50, profileYPos + 7);
          pdf.text(`Time: ${currentTime}`, 50, profileYPos + 14);
          pdf.text(`Workout: ${activityName}`, 50, profileYPos + 21);
          profileYPos = 95;
        } catch (e) {
          // If profile pic fails, use text only
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Name: ${userName}`, 20, 65);
          pdf.text(`Date: ${currentDate}`, 20, 72);
          pdf.text(`Time: ${currentTime}`, 20, 79);
          pdf.text(`Workout Type: ${activityName}`, 20, 86);
          profileYPos = 95;
        }
      } else {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${userName}`, 20, 65);
        pdf.text(`Date: ${currentDate}`, 20, 72);
        pdf.text(`Time: ${currentTime}`, 20, 79);
        pdf.text(`Workout Type: ${activityName}`, 20, 86);
        profileYPos = 95;
      }

      // Metrics
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Metrics', 20, profileYPos);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Reps: ${totalReps}`, 20, profileYPos + 10);
      pdf.text(`Correct Reps: ${correctReps}`, 20, profileYPos + 17);
      pdf.text(`Incorrect Reps: ${incorrectReps}`, 20, profileYPos + 24);
      pdf.text(`Duration: ${formatTime(duration)}`, 20, profileYPos + 31);
      pdf.text(`Accuracy: ${accuracy}%`, 20, profileYPos + 38);
      pdf.text(`Form Score: ${formScore}`, 20, profileYPos + 45);

      // Performance Chart
      const chartYPos = profileYPos + 60;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Breakdown', 20, chartYPos);

      const barY = chartYPos + 10;
      const barHeight = 8;
      const maxBarWidth = 170;

      pdf.setFillColor(34, 197, 94);
      const correctWidth = totalReps > 0 ? (correctReps / totalReps) * maxBarWidth : 0;
      pdf.rect(20, barY, correctWidth, barHeight, 'F');
      pdf.setFontSize(10);
      pdf.text(`Correct: ${correctReps}`, 20, barY - 2);

      pdf.setFillColor(239, 68, 68);
      const incorrectWidth = totalReps > 0 ? (incorrectReps / totalReps) * maxBarWidth : 0;
      pdf.rect(20, barY + 15, incorrectWidth, barHeight, 'F');
      pdf.text(`Incorrect: ${incorrectReps}`, 20, barY + 13);

      // Workout Screenshots
      if (workoutScreenshots.length > 0) {
        pdf.addPage();
        pdf.setFillColor(88, 28, 135);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Workout Screenshots', pageWidth / 2, 18, { align: 'center' });

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Key moments captured during your workout:', 20, 40);

        let yPos = 50;
        const imgWidth = 80;
        const imgHeight = 60;
        const spacing = 10;

        for (let i = 0; i < Math.min(6, workoutScreenshots.length); i++) {
          const xPos = i % 2 === 0 ? 20 : 110;
          
          if (i > 0 && i % 2 === 0) {
            yPos += imgHeight + spacing + 5;
          }

          if (yPos + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPos = 20;
          }

          try {
            pdf.addImage(workoutScreenshots[i], 'JPEG', xPos, yPos, imgWidth, imgHeight);
            pdf.setFontSize(9);
            pdf.text(`Screenshot ${i + 1}`, xPos + imgWidth / 2, yPos + imgHeight + 5, { align: 'center' });
          } catch (e) {
            console.error('Error adding screenshot:', e);
          }
        }
      }

      // Rep Details
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

      // Footer
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

      // Generate filename with user name
      const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedActivity = activityName.replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${sanitizedUserName}_${sanitizedActivity}_Report_${dateStr}.pdf`;
      
      // Save PDF locally
      pdf.save(filename);

      // Auto-submit to coach dashboard
      try {
        const pdfBlob = pdf.output('blob');
        
        await coachDashboardService.submitWorkout({
          athleteName: userName,
          athleteProfilePic: userProfilePic || undefined,
          activityName,
          totalReps,
          correctReps,
          incorrectReps,
          duration,
          accuracy,
          formScore,
          repDetails,
          timestamp: new Date().toISOString(),
          videoBlob,
          pdfBlob
        });
        
        console.log('Workout automatically submitted to coach dashboard');
      } catch (submitError) {
        console.error('Failed to submit to coach dashboard:', submitError);
        // Don't show error to user - submission happens in background
      }
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6 pb-24">
        {/* Success Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-4 shadow-2xl animate-bounce-slow">
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Workout Complete!
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <p className="text-xl text-gray-300 font-semibold">{activityName}</p>
          </div>
        </div>

        {/* Performance Score Card */}
        <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Award className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl font-bold">Performance Score</h2>
            </div>
            <div className={`px-5 py-2 rounded-full bg-gradient-to-r ${scoreColor} text-white text-lg font-black shadow-lg`}>
              {formScore}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
              <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-4xl font-black mb-1">{totalReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Total Reps</div>
            </div>
            <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-green-400 mb-1">{correctReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Correct</div>
            </div>
            <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-red-400 mb-1">{incorrectReps}</div>
              <div className="text-sm text-gray-400 font-semibold">Incorrect</div>
            </div>
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-blue-500/30">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-4xl font-black text-blue-400 mb-1">{formatTime(duration)}</div>
              <div className="text-sm text-gray-400 font-semibold">Duration</div>
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-semibold">Form Accuracy</span>
              <span className="text-2xl font-black">{accuracy}%</span>
            </div>
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${scoreColor} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video Playback */}
        {videoUrl && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Your Performance</h2>
              </div>
              <div className="px-4 py-1.5 bg-purple-600/20 rounded-full border border-purple-500/30">
                <span className="text-sm font-semibold text-purple-300">With Live Metrics</span>
              </div>
            </div>
            <div 
              className="relative rounded-2xl overflow-hidden bg-black cursor-pointer group shadow-2xl"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-4 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-400" />
              Watch your workout with real-time form analysis and metrics
            </p>
          </div>
        )}

        {/* Rep Breakdown */}
        {activityName === 'Push-ups' && repDetails.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-5">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">Rep-by-Rep Analysis</h2>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {repDetails.map((rep) => (
                <div 
                  key={rep.rep}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                    rep.correct 
                      ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20' 
                      : 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rep.correct ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {rep.correct ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-lg">Rep {rep.rep}</span>
                      <div className="text-xs text-gray-400 font-medium">
                        {rep.correct ? 'Perfect form' : 'Form needs work'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Elbow:</span>
                      <span className={`text-sm font-bold ${rep.min_elbow <= 75 ? 'text-green-400' : 'text-red-400'}`}>
                        {rep.min_elbow}°
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Plank:</span>
                      <span className={`text-sm font-bold ${rep.plank_angle >= 165 ? 'text-green-400' : 'text-red-400'}`}>
                        {rep.plank_angle}°
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold">Performance Insights</h2>
          </div>
          <div className="space-y-3">
            {accuracy >= 80 && (
              <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="font-semibold text-green-300">Outstanding Performance!</p>
                  <p className="text-sm text-gray-400 mt-1">Your form is excellent. Keep up the great work!</p>
                </div>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="text-2xl">👍</div>
                <div>
                  <p className="font-semibold text-yellow-300">Good Effort!</p>
                  <p className="text-sm text-gray-400 mt-1">Focus on maintaining proper form throughout each rep.</p>
                </div>
              </div>
            )}
            {accuracy < 60 && (
              <div className="flex items-start space-x-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <div className="text-2xl">💪</div>
                <div>
                  <p className="font-semibold text-orange-300">Keep Practicing!</p>
                  <p className="text-sm text-gray-400 mt-1">Pay attention to elbow angle and body alignment.</p>
                </div>
              </div>
            )}
            {activityName === 'Push-ups' && repDetails.length > 0 && (
              <>
                {repDetails.some(r => !r.correct && r.min_elbow > 75) && (
                  <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-blue-300">Tip:</span> Lower your chest closer to the ground (elbow angle below 75°)
                    </p>
                  </div>
                )}
                {repDetails.some(r => !r.correct && r.plank_angle < 165) && (
                  <div className="flex items-start space-x-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-purple-300">Tip:</span> Keep your body straight - avoid sagging hips or pike position
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-7 text-lg font-bold rounded-2xl shadow-2xl border-2 border-green-400/30 transition-all duration-200 hover:scale-[1.02]"
          >
            <Download className="w-6 h-6 mr-3" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button
            onClick={onHome}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-7 text-lg font-bold rounded-2xl shadow-2xl border-2 border-purple-400/30 transition-all duration-200 hover:scale-[1.02]"
          >
            <Home className="w-6 h-6 mr-3" />
            Back to Home
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WorkoutResultsScreenPro;
