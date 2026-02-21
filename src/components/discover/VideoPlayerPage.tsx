import { useState } from 'react';
import { ChevronLeft, Heart, Share2, BookmarkPlus, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VideoPlayerPageProps {
  videoId: string;
  onBack: () => void;
}

// Mock video data - in production this would come from your backend
const getVideoData = (id: string) => {
  const videos: any = {
    '1': {
      id: '1',
      title: 'Perfect Push-up Form Tutorial',
      videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4',
      coach: 'Rahul Dravid',
      coachAvatar: '/ppl/dravid.avif',
      duration: '8:45',
      views: 12500,
      likes: 890,
      category: 'Strength',
      level: 'Beginner',
      description: 'Learn the perfect push-up form with proper technique and common mistakes to avoid. This comprehensive tutorial covers hand placement, body alignment, and breathing techniques.',
      tags: ['Push-ups', 'Chest', 'Strength', 'Beginner']
    },
    '2': {
      id: '2',
      title: '5 Essential Squat Variations',
      videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8',
      coach: 'Manish Paul',
      coachAvatar: '/ppl/manish%20paul.jpg',
      duration: '12:30',
      views: 8900,
      likes: 654,
      category: 'Strength',
      level: 'Intermediate',
      description: 'Master 5 different squat variations to build stronger legs and improve your overall fitness. From basic squats to advanced variations.',
      tags: ['Squats', 'Legs', 'Strength', 'Intermediate']
    },
    '3': {
      id: '3',
      title: 'Core Strength for Athletes',
      videoUrl: 'https://www.youtube.com/embed/DHD1-2P94DI',
      coach: 'Sundar Kumar',
      coachAvatar: '/ppl/sundar%20kumar.jpg',
      duration: '15:20',
      views: 15600,
      likes: 1200,
      category: 'Core',
      level: 'All Levels',
      description: 'Build a strong core with these essential exercises. Perfect for athletes looking to improve their performance and prevent injuries.',
      tags: ['Core', 'Abs', 'Strength', 'Athletes']
    },
    '5': {
      id: '5',
      title: 'Sprint Training Techniques',
      videoUrl: 'https://www.youtube.com/embed/ojb9bf1-lhk',
      coach: 'Dharani Kumar',
      coachAvatar: '/ppl/dharani.webp',
      duration: '10:15',
      views: 7800,
      likes: 567,
      category: 'Cardio',
      level: 'Advanced',
      description: 'Improve your sprint speed with these professional training techniques. Learn proper form, acceleration, and speed endurance.',
      tags: ['Sprint', 'Speed', 'Cardio', 'Advanced']
    }
  };

  return videos[id] || videos['1'];
};

export default function VideoPlayerPage({ videoId, onBack }: VideoPlayerPageProps) {
  const video = getVideoData(videoId);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleBack = () => {
    // Call the onBack callback to return to discover tab
    onBack();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold line-clamp-1">{video.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <iframe
            src={video.videoUrl}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">{video.title}</h2>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {video.likes} likes
            </span>
            <Badge variant="secondary">{video.level}</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={liked ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLiked(!liked)}
              className="flex-1"
            >
              <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </Button>
            <Button
              variant={saved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSaved(!saved)}
              className="flex-1"
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" className="px-4">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Coach Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${video.coachAvatar})` }}
              />
              <div className="flex-1">
                <h3 className="font-bold">{video.coach}</h3>
                <p className="text-sm text-muted-foreground">Professional Coach</p>
              </div>
              <Button size="sm">Follow</Button>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">About this video</h3>
            <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">Comments</h3>
              <span className="text-sm text-muted-foreground">(24)</span>
            </div>
            
            {/* Comment Input */}
            <div className="flex gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">U</span>
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
              />
            </div>

            {/* Sample Comments */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">Aryan Sharma</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm">Great tutorial! Really helped me improve my form.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">Dev Patel</span>
                    <span className="text-xs text-muted-foreground">5 days ago</span>
                  </div>
                  <p className="text-sm">Thanks for the detailed explanation!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
