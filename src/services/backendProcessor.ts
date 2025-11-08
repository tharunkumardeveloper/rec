// Service for processing videos using Python backend scripts
export interface BackendProcessingResult {
  success: boolean;
  outputId: string;
  csvData: any[];
  videoFile: string | null;
  outputPath: string;
  files: string[];
}

class BackendProcessor {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  async processVideo(
    videoFile: File,
    activityName: string,
    onProgress?: (progress: number, message: string) => void
  ): Promise<BackendProcessingResult> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('activityName', activityName);
    formData.append('mode', 'video');

    try {
      onProgress?.(10, 'Uploading video to server...');
      console.log('Uploading to:', `${this.baseUrl}/api/process-video`);
      console.log('Activity:', activityName);
      console.log('File:', videoFile.name, videoFile.size, 'bytes');

      const response = await fetch(`${this.baseUrl}/api/process-video`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to process video';
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
          console.error('Server error response:', error);
        } catch (e) {
          const text = await response.text();
          console.error('Server error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      onProgress?.(50, 'Processing video with Python script...');

      const result = await response.json();
      console.log('Processing result:', result);

      onProgress?.(90, 'Retrieving results...');

      // Get the full results
      const resultsResponse = await fetch(
        `${this.baseUrl}/api/results/${result.outputId}`
      );

      console.log('Results response status:', resultsResponse.status);

      if (!resultsResponse.ok) {
        throw new Error('Failed to retrieve results');
      }

      const fullResults = await resultsResponse.json();
      console.log('Full results:', fullResults);

      onProgress?.(100, 'Processing complete!');

      return {
        success: true,
        outputId: result.outputId,
        csvData: fullResults.csvData || [],
        videoFile: fullResults.videoFile,
        outputPath: fullResults.outputPath,
        files: fullResults.files || [],
      };
    } catch (error: any) {
      console.error('Backend processing error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  getVideoUrl(outputId: string, filename: string): string {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const url = `${this.baseUrl}/api/video/${outputId}/${filename}?t=${timestamp}`;
    console.log('Generated video URL:', url);
    return url;
  }

  async checkServerStatus(): Promise<boolean> {
    try {
      console.log('Checking backend server at:', this.baseUrl);
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
      });
      console.log('Backend server status:', response.ok ? 'Online' : 'Offline');
      return response.ok;
    } catch (error) {
      console.log('Backend server not reachable:', error);
      return false;
    }
  }
}

export const backendProcessor = new BackendProcessor();
