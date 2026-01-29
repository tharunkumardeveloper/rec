import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, User, Target, Trophy, Calendar, Zap, Star, Users, Activity, BookOpen, MessageSquare, Plus, Filter, Download, Eye, Send, ChartBar as BarChart3, Shield, UserCheck } from 'lucide-react';

interface SAIAdminDashboardProps {
  userName: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onProfileOpen?: () => void;
  onSettingsOpen?: () => void;
}

const SAIAdminDashboard = ({ userName, onTabChange, activeTab, onProfileOpen, onSettingsOpen }: SAIAdminDashboardProps) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock SAI Admin data
  const overviewStats = {
    totalAthletes: 156,
    totalCoaches: 12,
    activeChallenges: 45,
    systemBadges: 1248
  };

  const systemActivity = [
    { day: 'Mon', value: 89 },
    { day: 'Tue', value: 94 },
    { day: 'Wed', value: 82 },
    { day: 'Thu', value: 97 },
    { day: 'Fri', value: 91 },
    { day: 'Sat', value: 78 },
    { day: 'Sun', value: 85 }
  ];

  const challengeOverview = [
    { domain: 'Strength', active: 12, completed: 89, color: 'bg-gradient-to-r from-blue-500 to-blue-600', textColor: 'text-white', iconColor: 'text-blue-500' },
    { domain: 'Endurance', active: 8, completed: 76, color: 'bg-gradient-to-r from-green-500 to-green-600', textColor: 'text-white', iconColor: 'text-green-500' },
    { domain: 'Flexibility', active: 10, completed: 65, color: 'bg-gradient-to-r from-purple-500 to-purple-600', textColor: 'text-white', iconColor: 'text-purple-500' },
    { domain: 'Calisthenics', active: 9, completed: 58, color: 'bg-gradient-to-r from-orange-500 to-orange-600', textColor: 'text-white', iconColor: 'text-orange-500' },
    { domain: 'Para-Athlete', active: 6, completed: 34, color: 'bg-gradient-to-r from-pink-500 to-pink-600', textColor: 'text-white', iconColor: 'text-pink-500' }
  ];

  const athletes = [
    { id: 1, name: 'Athlete Kumar', coach: 'Rajesh Menon', level: 8, status: 'Active', challenges: 12, badges: 28 },
    { id: 2, name: 'Priya Sharma', coach: 'Anjali Desai', level: 6, status: 'Active', challenges: 8, badges: 19 },
    { id: 3, name: 'Akash Patel', coach: 'Vikram Singh', level: 10, status: 'Active', challenges: 15, badges: 35 },
    { id: 4, name: 'Rohan Singh', coach: 'Rajesh Menon', level: 4, status: 'Inactive', challenges: 6, badges: 14 },
    { id: 5, name: 'Kavya Nair', coach: 'Sunita Rao', level: 7, status: 'Active', challenges: 10, badges: 22 },
    { id: 6, name: 'Arjun Reddy', coach: 'Vikram Singh', level: 9, status: 'Active', challenges: 14, badges: 31 }
  ];

  const coaches = [
    { id: 1, name: 'Rajesh Menon', athletes: 15, specialization: 'Strength Training', experience: '8 years', status: 'Active' },
    { id: 2, name: 'Anjali Desai', athletes: 12, specialization: 'Endurance', experience: '6 years', status: 'Active' },
    { id: 3, name: 'Vikram Singh', athletes: 18, specialization: 'Calisthenics', experience: '10 years', status: 'Active' },
    { id: 4, name: 'Sunita Rao', athletes: 14, specialization: 'Flexibility', experience: '7 years', status: 'Active' },
    { id: 5, name: 'Kiran Kumar', athletes: 11, specialization: 'Para-Athlete', experience: '9 years', status: 'Active' }
  ];

  const filterTags = ['All Athletes', 'Active', 'Inactive', 'High Performers', 'Needs Attention'];

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">{overviewStats.totalAthletes}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Total Athletes</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-success bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserCheck className="w-5 h-5 text-success mr-2" />
              <span className="text-2xl font-bold text-success">{overviewStats.totalCoaches}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Total Coaches</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-info bg-gradient-to-br from-info/10 to-info/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-info mr-2" />
              <span className="text-2xl font-bold text-info">{overviewStats.activeChallenges}</span>
            </div>
            <p className="text-sm text-foreground font-medium">Active Challenges</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-warning mr-2" />
              <span className="text-2xl font-bold text-warning">{overviewStats.systemBadges}</span>
            </div>
            <p className="text-sm text-foreground font-medium">System Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* System Activity Chart */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>System Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemActivity.map((stat, index) => (
              <div key={stat.day} className="flex items-center space-x-3 group">
                <span className="text-sm font-semibold w-10 text-foreground">{stat.day}</span>
                <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                      stat.value >= 90 ? 'from-green-400 to-green-600' :
                      stat.value >= 80 ? 'from-blue-400 to-blue-600' :
                      stat.value >= 70 ? 'from-yellow-400 to-yellow-600' :
                      'from-orange-400 to-orange-600'
                    } shadow-md group-hover:shadow-lg`}
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-10 text-right text-foreground">{stat.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Overview */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Challenge Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {challengeOverview.map((item) => (
              <div key={item.domain} className={`flex items-center justify-between p-4 rounded-xl ${item.color} shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
                    <Target className={`w-5 h-5 text-white`} />
                  </div>
                  <span className={`font-semibold ${item.textColor}`}>{item.domain}</span>
                </div>
                <div className="flex space-x-2">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{item.active} active</Badge>
                  <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm">{item.completed} completed</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Athletes Leaderboard */}
      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-warning" />
            <span>Top Athletes Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Athlete Kumar', domain: 'Strength', level: 12, points: 2450, badges: 35, rank: 1 },
              { name: 'Priya Sharma', domain: 'Endurance', level: 11, points: 2380, badges: 32, rank: 2 },
              { name: 'Akash Patel', domain: 'Calisthenics', level: 10, points: 2250, badges: 28, rank: 3 },
              { name: 'Kavya Nair', domain: 'Flexibility', level: 9, points: 2100, badges: 25, rank: 4 },
              { name: 'Arjun Reddy', domain: 'Para-Athlete', level: 8, points: 1950, badges: 22, rank: 5 },
              { name: 'Sneha Gupta', domain: 'Strength', level: 8, points: 1890, badges: 21, rank: 6 },
              { name: 'Vikram Joshi', domain: 'Endurance', level: 7, points: 1750, badges: 19, rank: 7 },
              { name: 'Rohan Singh', domain: 'Calisthenics', level: 7, points: 1680, badges: 18, rank: 8 }
            ].map((athlete) => (
              <div key={athlete.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    athlete.rank === 1 ? 'bg-yellow-500 text-white' :
                    athlete.rank === 2 ? 'bg-gray-400 text-white' :
                    athlete.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {athlete.rank}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{athlete.name}</h4>
                    <p className="text-xs text-muted-foreground">{athlete.domain}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <div className="text-sm font-medium">Level {athlete.level}</div>
                    <div className="text-xs text-muted-foreground">{athlete.points} pts</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    {athlete.badges}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View Full Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAthletesContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterTags.map((tag) => (
          <Button
            key={tag}
            variant={selectedFilter === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(selectedFilter === tag ? null : tag)}
            className={`rounded-full h-9 text-xs font-medium transition-all duration-300 ${
              selectedFilter === tag 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg scale-105' 
                : 'bg-white text-foreground border-2 border-primary/20 hover:border-primary hover:bg-primary/5'
            }`}
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Athletes List */}
      <div className="space-y-3">
        {athletes.map((athlete) => (
          <Card key={athlete.id} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-sm">
                    {athlete.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{athlete.name}</h3>
                    <p className="text-sm text-muted-foreground">Coach: {athlete.coach}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-sm">Level {athlete.level}</Badge>
                  <Badge className={athlete.status === 'Active' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm'}>
                    {athlete.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-center">
                <div className="p-2 rounded-lg bg-blue-50">
                  <div className="text-sm font-bold text-blue-600">{athlete.challenges}</div>
                  <div className="text-xs text-blue-600/70">Challenges</div>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50">
                  <div className="text-sm font-bold text-yellow-600">{athlete.badges}</div>
                  <div className="text-xs text-yellow-600/70">Badges</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                  <Eye className="w-4 h-4 mr-1" />
                  View Profile
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCoachesContent = () => (
    <div className="space-y-6">
      {/* Coaches List */}
      <div className="space-y-3">
        {coaches.map((coach, index) => {
          const gradients = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600'
          ];
          const gradient = gradients[index % gradients.length];
          
          return (
            <Card key={coach.id} className="card-elevated hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shadow-md`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{coach.name}</h3>
                      <p className="text-sm text-muted-foreground">{coach.specialization}</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">{coach.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-center">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-lg font-bold text-blue-600">{coach.athletes}</div>
                    <div className="text-xs text-blue-600/70 font-medium">Athletes</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="text-lg font-bold text-purple-600">{coach.experience}</div>
                    <div className="text-xs text-purple-600/70 font-medium">Experience</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300">
                    <Users className="w-4 h-4 mr-1" />
                    Manage Athletes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderReportsContent = () => (
    <div className="space-y-6">
      {/* Export Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300">
          <Download className="w-4 h-4 mr-2" />
          Export System Data
        </Button>
        <Button variant="outline" size="lg" className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
          <BarChart3 className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* System Performance */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white mb-1">94%</div>
                <p className="text-sm text-white/90 font-medium">System Uptime</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-3xl font-bold text-white mb-1">8.7</div>
                <p className="text-sm text-white/90 font-medium">Avg User Rating</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { metric: 'Daily Active Users', value: '142', trend: '+12%', gradient: 'from-blue-500 to-blue-600' },
              { metric: 'Challenge Completion Rate', value: '87%', trend: '+5%', gradient: 'from-green-500 to-green-600' },
              { metric: 'Badge Earning Rate', value: '3.2/user', trend: '+8%', gradient: 'from-yellow-500 to-yellow-600' },
              { metric: 'Coach Engagement', value: '91%', trend: '+3%', gradient: 'from-purple-500 to-purple-600' }
            ].map((item, index) => (
              <div key={index} className={`flex justify-between items-center p-4 rounded-xl bg-gradient-to-r ${item.gradient} shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                <span className="font-semibold text-white">{item.metric}</span>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-white text-lg">{item.value}</span>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">{item.trend}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'training':
        return renderDashboardContent();
      case 'discover':
        return renderAthletesContent();
      case 'report':
        return renderReportsContent();
      case 'roadmap':
        return renderCoachesContent();
      default:
        return renderDashboardContent();
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'training':
        return 'System Overview';
      case 'discover':
        return 'Athletes';
      case 'report':
        return 'Reports & Analytics';
      case 'roadmap':
        return 'Coaches';
      default:
        return 'System Overview';
    }
  };

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="sticky top-0 z-50 bg-primary border-b border-primary-dark safe-top lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">Welcome, {userName}</h1>
              <p className="text-sm text-white/80">SAI Admin</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onSettingsOpen}
                className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onProfileOpen}
                className="tap-target p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20 lg:pb-8 max-w-2xl lg:max-w-7xl mx-auto pt-6">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className={`relative transition-all duration-300 ${
            searchFocus ? 'transform scale-105' : ''
          }`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 lg:w-5 lg:h-5" />
            <Input
              placeholder="Search system data..."
              className="pl-10 lg:pl-12 h-12 lg:h-14 rounded-xl border-2 text-base lg:text-lg"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
          {searchFocus && (
            <Card className="absolute top-full mt-2 w-full z-10 animate-slide-up">
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">Search recommendations will appear here</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">{getTabTitle()}</h2>
          {getTabContent()}
        </div>
      </div>

      {/* Bottom Navigation - Hidden on large screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-primary/10 safe-bottom lg:hidden shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: 'training', label: 'Overview', icon: Shield, color: 'text-purple-600' },
              { id: 'discover', label: 'Athletes', icon: Users, color: 'text-blue-600' },
              { id: 'report', label: 'Reports', icon: BarChart3, color: 'text-green-600' },
              { id: 'roadmap', label: 'Coaches', icon: UserCheck, color: 'text-orange-600' }
            ].map(({ id, label, icon: Icon, color }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center space-y-1 tap-target transition-all duration-300 ${
                  activeTab === id 
                    ? `${color} scale-110 font-semibold` 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  activeTab === id ? 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-md' : ''
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SAIAdminDashboard;