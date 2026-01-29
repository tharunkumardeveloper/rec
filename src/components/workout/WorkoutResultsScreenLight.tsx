import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Download, Home, Play, Pause, TrendingUp, Award, Target } from 'lucide-react';
import { PushupRepData } from '@/services/workoutDetectors/PushupLiveDetector';
import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import coachDashboardService from '@/services/coachDashboardService';
import workoutStorageService from '@/services/workoutStorageService';

interface WorkoutResultsScreenLightProps {
  activityName: string;
  totalReps: number;
  correctReps: number;
  incorrectReps: number;
  duration: number;
  repDetails?: PushupRepData[];
  videoBlob?: Blob;
  onHome: () => void;
}

const WorkoutResultsScreenLight = ({
  activityName,
  totalReps,
  correctReps,
  incorrectReps,
  duration,
  repDetails = [],
  videoBlob,
  onHome
}: WorkoutResultsScreenLightProps) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [workoutScreenshots, setWorkoutScreenshots] = useState<string[]>([]);
  const [autoSaved, setAutoSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  // AUTO-SAVE workout when screenshots are ready
  useEffect(() => {
    if (!autoSaved && videoBlob && workoutScreenshots.length > 0) {
      console.log('🔄 Starting auto-save...');
      const userName = localStorage.getItem('user_name') || 'Athlete';
      const userProfilePic = localStorage.getItem('user_profile_pic');
      const accuracy = totalReps > 0 ? Math.round((correctReps / totalReps) * 100) : 0;
      const formScore = accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work';

      console.log('📊 Saving workout for:', userName);
      
      workoutStorageService.blobToDataUrl(videoBlob).then(videoDataUrl => {
        workoutStorageService.saveWorkout({
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
          videoDataUrl,
          pdfDataUrl: undefined,
          screenshots: workoutScreenshots
        }).then((workoutId) => {
          setAutoSaved(true);
          console.log('✅ Workout auto-saved! ID:', workoutId);
          console.log('💾 Check localStorage key: athlete_workouts');
          alert(`✅ Workout saved for ${userName}! Coach can now view it in Athletes tab.`);
        }).catch(err => {
          console.error('❌ Auto-save failed:', err);
          alert(`❌ Failed to save workout: ${err}`);
        });
      }).catch(err => {
        console.error('❌ Video conversion failed:', err);
        alert(`❌ Failed to convert video: ${err}`);
      });
    }
  }, [workoutScreenshots, videoBlob, autoSaved, activityName, totalReps, correctReps, incorrectReps, duration, repDetails]);

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

  const formatTime = (seconds: number) => {
    // Handle invalid or infinite values
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: any) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${activityName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      pdf.setFillColor(59, 130, 246);
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
        pdf.setFillColor(59, 130, 246);
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
        pdf.setFillColor(59, 130, 246);
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

      // Save to local storage for coach dashboard
      try {
        const pdfBlob = pdf.output('blob');
        const pdfDataUrl = await workoutStorageService.blobToDataUrl(pdfBlob);
        const videoDataUrl = videoBlob ? await workoutStorageService.blobToDataUrl(videoBlob) : undefined;

        const workoutId = await workoutStorageService.saveWorkout({
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
          videoDataUrl,
          pdfDataUrl,
          screenshots: workoutScreenshots
        });

        console.log('✅ Workout saved successfully! ID:', workoutId);
        console.log('📊 Athlete:', userName);
        console.log('🏋️ Activity:', activityName);
        console.log('💾 Storage size:', workoutStorageService.getStorageSize().toFixed(2), 'MB');
        
        // Show success message
        alert(`✅ Workout saved! Coach can now view this workout in the Athletes tab.`);
      } catch (storageError) {
        console.error('❌ Failed to save workout locally:', storageError);
        alert(`⚠️ Warning: Workout may not be visible to coach. Error: ${storageError}`);
      }

      // Auto-submit to coach dashboard (if configured)
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

  const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Workout Complete!</h1>
          <p className="text-xl text-gray-600">{activityName}</p>
        </div>

        {/* Video Player Section */}
        {videoUrl && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Performance Video</h2>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Video</span>
                </Button>
              </div>
              
              {/* Video */}
              <div className="relative rounded-xl overflow-hidden bg-black mb-4">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full"
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Controls */}
              <div className="space-y-3">
                {/* Timeline */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={videoDuration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {formatTime(videoDuration)}
                  </span>
                </div>

                {/* Play/Pause Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Award className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Performance Summary</h2>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-white ${
              accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {formScore}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{totalReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Total Reps</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">{correctReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Correct Form</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-700">{incorrectReps}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Needs Work</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{formatTime(duration)}</div>
                <div className="text-sm text-gray-600 font-medium mt-1">Duration</div>
              </div>
            </div>
          </div>

          {/* Accuracy Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Form Accuracy</span>
              <span className="text-2xl font-bold text-gray-900">{accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rep Details */}
        {activityName === 'Push-ups' && repDetails.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-5">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Detailed Rep Analysis</h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {repDetails.map((rep) => (
                <div 
                  key={rep.rep}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    rep.correct 
                      ? 'bg-green-50 border-green-200 hover:border-green-300' 
                      : 'bg-red-50 border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      rep.correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {rep.correct ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <XCircle className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">Rep {rep.rep}</div>
                      <div className="text-sm text-gray-600">
                        {rep.correct ? 'Perfect form ✓' : 'Form needs improvement'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Elbow:</span>
                      <span className={`text-base font-bold px-2 py-1 rounded ${
                        rep.min_elbow <= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {rep.min_elbow}°
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Plank:</span>
                      <span className={`text-base font-bold px-2 py-1 rounded ${
                        rep.plank_angle >= 165 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Performance Insights</h2>
          </div>
          <div className="space-y-3">
            {accuracy >= 80 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-green-200">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="font-semibold text-green-700">Outstanding Performance!</p>
                  <p className="text-sm text-gray-600 mt-1">Your form is excellent. Keep up the great work!</p>
                </div>
              </div>
            )}
            {accuracy >= 60 && accuracy < 80 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-yellow-200">
                <div className="text-2xl">👍</div>
                <div>
                  <p className="font-semibold text-yellow-700">Good Effort!</p>
                  <p className="text-sm text-gray-600 mt-1">Focus on maintaining proper form throughout each rep.</p>
                </div>
              </div>
            )}
            {accuracy < 60 && (
              <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-orange-200">
                <div className="text-2xl">💪</div>
                <div>
                  <p className="font-semibold text-orange-700">Keep Practicing!</p>
                  <p className="text-sm text-gray-600 mt-1">Pay attention to elbow angle and body alignment.</p>
                </div>
              </div>
            )}
            {activityName === 'Push-ups' && repDetails.length > 0 && (
              <>
                {repDetails.some(r => !r.correct && r.min_elbow > 75) && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-blue-200">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">Tip:</span> Lower your chest closer to the ground (elbow angle below 75°)
                    </p>
                  </div>
                )}
                {repDetails.some(r => !r.correct && r.plank_angle < 165) && (
                  <div className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-purple-200">
                    <div className="text-xl">💡</div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-purple-700">Tip:</span> Keep your body straight - avoid sagging hips or pike position
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
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button
            onClick={onHome}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutResultsScreenLight;
