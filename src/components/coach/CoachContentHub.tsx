import { useState } from 'react';
import { Plus, Video, FileText, Users, TrendingUp, Eye, Heart, MessageCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CoachContentHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'courses' | 'analytics'>('posts');

  // Mock data for coach's content
  const posts = [
    {
      id: 1,
      type: 'video',
      title: '5 Essential Push-up Variations',
      thumbnail: '/challenges/pushup-power.webp',
      views: 1234,
      likes: 89,
      comments: 23,
      date: '2 days ago'
    },
    {
      id: 2,
      type: 'article',
      title: 'Complete Guide to Proper Squat Form',
      thumbnail: '/squat.webp',
      views: 856,
      likes: 67,
      comments: 15,
      date: '5 days ago'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Beginner Strength Training',
      students: 45,
      lessons: 12,
      duration: '6 weeks',
      price: 'Free',
      status: 'Published'
    },
    {
      id: 2,
      title: 'Advanced Calisthenics',
      students: 28,
      lessons: 20,
      duration: '8 weeks',
      price: '₹999',
      status: 'Draft'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Content Hub</h1>
              <p className="text-xs text-muted-foreground">Manage your posts & courses</p>
            </div>
            <Button
              onClick={() => navigate('/coach/create-content')}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">2.1K</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="text-xl font-bold">73</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="text-xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'posts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('posts')}
            size="sm"
            className="flex-1"
          >
            Posts
          </Button>
          <Button
            variant={activeTab === 'courses' ? 'default' : 'outline'}
            onClick={() => setActiveTab('courses')}
            size="sm"
            className="flex-1"
          >
            Courses
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            size="sm"
            className="flex-1"
          >
            Analytics
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div
                      className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${post.thumbnail})` }}
                    >
                      {post.type === 'video' && (
                        <div className="w-full h-full bg-black/40 rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{post.title}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {post.type === 'video' ? 'Video' : 'Article'}
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-1">{course.title}</h3>
                      <Badge variant={course.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-sm font-bold">{course.students}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">{course.lessons}</p>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">{course.duration}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">{course.price}</p>
                      <p className="text-xs text-muted-foreground">Price</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Track your content performance and audience engagement
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
