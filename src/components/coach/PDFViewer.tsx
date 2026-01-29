import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  athleteName: string;
  activityName: string;
  onClose: () => void;
}

const PDFViewer = ({ pdfUrl, athleteName, activityName, onClose }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'embed' | 'download'>('embed');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${athleteName}_${activityName}_Report.pdf`;
    link.target = '_blank';
    link.click();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  // Check if it's a Cloudinary raw URL (PDFs uploaded as raw files)
  const isCloudinaryRaw = pdfUrl.includes('/raw/upload/');
  const isBase64 = pdfUrl.startsWith('data:');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{athleteName} - {activityName}</h2>
            <p className="text-sm text-gray-600">Workout Report</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isCloudinaryRaw && (
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
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isCloudinaryRaw ? (
            // For Cloudinary raw files, show download option
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">PDF Report Ready</h3>
                <p className="text-gray-600 mb-6">Click the button below to download and view the report</p>
                <Button onClick={handleDownload} size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF Report
                </Button>
              </div>
            </div>
          ) : (
            // For base64 PDFs, use iframe
            <div className="bg-white shadow-lg mx-auto" style={{ width: `${zoom}%` }}>
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-[800px] border-0"
                title="PDF Report"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
