import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  athleteName: string;
  activityName: string;
  onClose: () => void;
}

const PDFViewer = ({ pdfUrl, athleteName, activityName, onClose }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Debug logging
  console.group('📄 PDF Viewer Debug');
  console.log('PDF URL:', pdfUrl);
  console.log('Athlete:', athleteName);
  console.log('Activity:', activityName);

  const handleDownload = () => {
    console.log('🔽 Download clicked for:', pdfUrl.substring(0, 100) + '...');
    
    if (isBase64) {
      // For base64 data URLs, create a blob and download
      try {
        const base64Data = pdfUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${athleteName}_${activityName}_Report.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('✅ Base64 PDF downloaded successfully');
      } catch (error) {
        console.error('❌ Error downloading base64 PDF:', error);
        alert('Failed to download PDF. Please try again.');
      }
    } else {
      // For regular URLs
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${athleteName}_${activityName}_Report.pdf`;
      link.target = '_blank';
      link.click();
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  // Check if it's a Cloudinary URL or base64
  const isCloudinaryUrl = pdfUrl.includes('cloudinary.com');
  const isCloudinaryRaw = pdfUrl.includes('/raw/upload/');
  const isBase64 = pdfUrl.startsWith('data:');
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  console.log('URL Type Detection:');
  console.log('  - Is Cloudinary:', isCloudinaryUrl);
  console.log('  - Is Cloudinary Raw:', isCloudinaryRaw);
  console.log('  - Is Base64:', isBase64);
  console.log('  - Is Mobile:', isMobile);

  // For mobile, use Google Docs Viewer which works better in APK/mobile browsers
  // For desktop, use direct PDF URL
  const viewerUrl = isCloudinaryRaw && isMobile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : pdfUrl;

  console.log('Viewer URL:', viewerUrl);
  console.groupEnd();

  useEffect(() => {
    console.log('📄 PDF Viewer mounted/updated');
    console.log('  - Loading state:', loading);
    console.log('  - Error state:', error);
    setLoading(true);
    setError(false);
  }, [pdfUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{athleteName} - {activityName}</h2>
            <p className="text-sm text-gray-600">Workout Report</p>
          </div>
          <div className="flex items-center space-x-2">
            {isBase64 && (
              <>
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
                <p className="text-xs text-gray-500 mt-2">Check console for details</p>
              </div>
            </div>
          )}

          {isCloudinaryRaw ? (
            // Use Google Docs Viewer for mobile, direct iframe for desktop
            isMobile ? (
              <iframe
                src={viewerUrl}
                className="w-full h-full border-0"
                title="PDF Report"
                onLoad={() => {
                  console.log('✅ Google Docs PDF viewer loaded successfully');
                  setLoading(false);
                }}
                onError={(e) => {
                  console.error('❌ Google Docs viewer load error:', e);
                  setError(true);
                  setLoading(false);
                }}
              />
            ) : (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title="PDF Report"
                onLoad={() => {
                  console.log('✅ Direct PDF loaded successfully');
                  setLoading(false);
                }}
                onError={(e) => {
                  console.error('❌ Direct PDF load error:', e);
                  setError(true);
                  setLoading(false);
                }}
              />
            )
          ) : isBase64 ? (
            // For base64 PDFs, use object element which works better for data URLs
            <div className="h-full overflow-auto p-4 flex items-center justify-center">
              <div className="bg-white shadow-2xl" style={{ width: `${zoom}%`, maxWidth: '100%' }}>
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  className="w-full"
                  style={{ height: '80vh' }}
                  onLoad={() => {
                    console.log('✅ Base64 PDF loaded successfully');
                    setLoading(false);
                  }}
                >
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Your browser cannot display this PDF inline.
                    </p>
                    <Button onClick={handleDownload} size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF to View
                    </Button>
                  </div>
                </object>
              </div>
            </div>
          ) : (
            // For other URLs, try direct iframe
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Report"
              onLoad={() => {
                console.log('✅ Direct PDF loaded successfully');
                setLoading(false);
              }}
              onError={(e) => {
                console.error('❌ Direct PDF load error:', e);
                setError(true);
                setLoading(false);
              }}
            />
          )}

          {/* Error fallback */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Unable to Preview PDF</h3>
                <p className="text-gray-600 mb-2">
                  The PDF couldn't be displayed in the browser.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Check console for error details. Download to view.
                </p>
                <Button onClick={handleDownload} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
