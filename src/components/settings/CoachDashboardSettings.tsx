import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import coachDashboardService from '@/services/coachDashboardService';

const CoachDashboardSettings = () => {
  const [config, setConfig] = useState({
    enabled: false,
    apiEndpoint: '',
    coachEmail: '',
    autoSubmit: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [failedSubmissions, setFailedSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Load current configuration
    const currentConfig = coachDashboardService.getConfig();
    setConfig({
      enabled: currentConfig.enabled,
      apiEndpoint: currentConfig.apiEndpoint,
      coachEmail: currentConfig.coachEmail || '',
      autoSubmit: currentConfig.autoSubmit
    });
    
    // Load submission history
    setSubmissionHistory(coachDashboardService.getSubmissionHistory());
    setFailedSubmissions(coachDashboardService.getFailedSubmissions());
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      coachDashboardService.saveConfig(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryFailed = async () => {
    await coachDashboardService.retryFailedSubmissions();
    setFailedSubmissions(coachDashboardService.getFailedSubmissions());
    setSubmissionHistory(coachDashboardService.getSubmissionHistory());
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all submission history?')) {
      coachDashboardService.clearHistory();
      setSubmissionHistory([]);
      setFailedSubmissions([]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Coach Dashboard Integration</span>
          </CardTitle>
          <CardDescription>
            Automatically send workout reports and videos to your coach's dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Coach Dashboard</Label>
              <p className="text-sm text-gray-500">
                Automatically submit workouts to your coach
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="apiEndpoint">Coach Dashboard API Endpoint</Label>
            <Input
              id="apiEndpoint"
              type="url"
              placeholder="https://coach-dashboard.example.com/api/workouts"
              value={config.apiEndpoint}
              onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              disabled={!config.enabled}
            />
            <p className="text-xs text-gray-500">
              The API endpoint where workout data will be sent
            </p>
          </div>

          {/* Coach Email */}
          <div className="space-y-2">
            <Label htmlFor="coachEmail">Coach Email (Optional)</Label>
            <Input
              id="coachEmail"
              type="email"
              placeholder="coach@example.com"
              value={config.coachEmail}
              onChange={(e) => setConfig({ ...config, coachEmail: e.target.value })}
              disabled={!config.enabled}
            />
            <p className="text-xs text-gray-500">
              Your coach's email for notifications
            </p>
          </div>

          {/* Auto Submit */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSubmit">Auto-Submit Workouts</Label>
              <p className="text-sm text-gray-500">
                Automatically send reports after each workout
              </p>
            </div>
            <Switch
              id="autoSubmit"
              checked={config.autoSubmit}
              onCheckedChange={(checked) => setConfig({ ...config, autoSubmit: checked })}
              disabled={!config.enabled}
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleSave}
              disabled={isSaving || !config.enabled}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
            {saveStatus === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {saveStatus === 'error' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submission History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>
            Recent workout submissions to coach dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No submissions yet
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissionHistory.slice(-10).reverse().map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{item.activityName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          )}

          {failedSubmissions.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600">
                  {failedSubmissions.length} Failed Submission(s)
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryFailed}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </Button>
              </div>
            </div>
          )}

          {submissionHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="w-full mt-4"
            >
              Clear History
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-blue-900">What gets submitted:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Workout video with MediaPipe pose tracking</li>
              <li>PDF report with detailed analytics</li>
              <li>Rep-by-rep form analysis</li>
              <li>Performance metrics and screenshots</li>
              <li>Athlete profile information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachDashboardSettings;
