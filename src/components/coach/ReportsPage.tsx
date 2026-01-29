import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, Calendar, Users } from 'lucide-react';

interface ReportsPageProps {
  onBack: () => void;
}

const ReportsPage = ({ onBack }: ReportsPageProps) => {
  const reports = [
    {
      title: 'Weekly Summary',
      date: 'Jan 22 - Jan 28, 2024',
      athletes: 12,
      workouts: 48,
      status: 'ready'
    },
    {
      title: 'Monthly Performance',
      date: 'January 2024',
      athletes: 12,
      workouts: 186,
      status: 'ready'
    },
    {
      title: 'Quarterly Review',
      date: 'Q4 2023',
      athletes: 15,
      workouts: 520,
      status: 'ready'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-lg font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">Download and export data</p>
        </div>
      </div>

      {/* Quick Export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Data (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:bg-secondary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">{report.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {report.athletes} athletes
                      </span>
                      <span>•</span>
                      <span>{report.workouts} workouts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-600">
                      Ready
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
