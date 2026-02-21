import { useState } from 'react';
import { Search, Play, Eye, Heart, BookOpen, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VideoPlayerPage from '@/components/discover/VideoPlayerPage';

export default function DiscoverTabEnhanced() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'videos' | 'articles' | 'courses'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Mock video tutorials data
  const content = [
    {
      id: 1,
      type: 'video',
      title: 'Perfect Push-up Form Tutorial',
      thumbnail: '/challenges/pushup-power.webp',
      coach: 'Rahul Dravid',
      coachAvatar: '/ppl/dravid.avif',
      duration: '8:45',
      views: 12500,
      likes: 890,
      category: 'Strength',
      level: 'Beginner'
    },
    {
      id: 2,
      type: 'video',
      title: '5 Essential Squat Variations',
      thumbnail: '/squat.webp',
      coach: 'Manish Paul',
      coachAvatar: '/ppl/manish%20paul.jpg',
      duration: '12:30',
      views: 8900,
      likes: 654,
      category: 'Strength',
      level: 'Intermediate'
    },
    {
      id: 3,
      type: 'video',
      title: 'Core Strength for Athletes',
      thumbnail: '/challenges/core-crusher.avif',
      coach: 'Sundar Kumar',
      coachAvatar: '/ppl/sundar%20kumar.jpg',
      duration: '15:20',
      views: 15600,
      likes: 1200,
      category: 'Core',
      level: 'All Levels'
    },
    {
      id: 4,
      type: 'article',
      title: 'Complete Guide to Flexibility Training',
      thumbnail: '/challenges/flexibility-foundation.webp',
      coach: 'Pranshika Singh',
      coachAvatar: '/ppl/pranshika.webp',
      readTime: '10 min',
      views: 5400,
      likes: 432,
      category: 'Flexibility',
      level: 'Beginner'
    },
    {
      id: 5,
      type: 'video',
      title: 'Sprint Training Techniques',
      thumbnail: '/challenges/sprint-master.jpg',
      coach: 'Dharani Kumar',
      coachAvatar: '/ppl/dharani.webp',
      duration: '10:15',
      views: 7800,
      likes: 567,
      category: 'Cardio',
      level: 'Advanced'
    },
    {
      id: 6,
      type: 'course',
      title: 'Beginner Strength Training Program',
      thumbnail: '/challenges/adaptive-strength.jpg',
      coach: 'Rahul Dravid',
      coachAvatar: '/ppl/dravid.avif',
      lessons: 12,
      students: 450,
      category: 'Strength',
      level: 'Beginner'
    }
  ];

  const filteredContent = content.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter.slice(0, -1);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.coach.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Show video player if a video is selected
  if (selectedVideoId) {
    return (
      <VideoPlayerPage
        videoId={selectedVideoId}
        onBack={() => setSelectedVideoId(null)}
      />
    );
  }

  return (
    <div className="px-4 pb-20 max-w-7xl mx-auto pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
        <p className="text-sm text-muted-foreground">Learn from expert coaches</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tutorials, coaches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={activeFilter === 'videos' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('videos')}
          size="sm"
        >
          Videos
        </Button>
        <Button
          variant={activeFilter === 'articles' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('articles')}
          size="sm"
        >
          Articles
        </Button>
        <Button
          variant={activeFilter === 'courses' ? 'default' : 'outline'}
          onClick={() => setActiveFilter('courses')}
          size="sm"
        >
          Courses
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContent.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => {
              if (item.type === 'video') {
                setSelectedVideoId(item.id.toString());
              }
            }}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${item.thumbnail})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play button for videos */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary ml-1" />
                  </div>
                </div>
              )}

              {/* Duration/Read time badge */}
              {item.type === 'video' && (
                <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
                  {item.duration}
                </Badge>
              )}
              {item.type === 'article' && (
                <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
                  {item.readTime}
                </Badge>
              )}
              {item.type === 'course' && (
                <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
                  {item.lessons} lessons
                </Badge>
              )}

              {/* Type badge */}
              <Badge className="absolute top-2 left-2 bg-primary text-white border-0 text-xs">
                {item.type === 'video' ? '📹 Video' : item.type === 'article' ? '📄 Article' : '📚 Course'}
              </Badge>
            </div>

            <CardContent className="p-4">
              {/* Title */}
              <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Coach info */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.coachAvatar})` }}
                />
                <span className="text-xs text-muted-foreground">{item.coach}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views > 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views}
                  </span>
                  {(item.type === 'video' || item.type === 'article') && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes}
                    </span>
                  )}
                  {item.type === 'course' && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {item.students}
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Trending This Week</h2>
        </div>
        <div className="space-y-3">
          {content.slice(0, 3).map((item, idx) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (item.type === 'video') {
                  setSelectedVideoId(item.id.toString());
                }
              }}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{idx + 1}</span>
                  </div>
                  <div
                    className="w-20 h-14 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${item.thumbnail})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1 mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.coach}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views > 1000 ? `${(item.views / 1000).toFixed(1)}K` : item.views}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
