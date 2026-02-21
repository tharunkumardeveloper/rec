import { useState } from 'react';
import { ChevronLeft, Video, FileText, Upload, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CreateContent() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState<'video' | 'article' | 'course' | null>(null);

  if (!contentType) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.location.href = '/coach/content-hub';
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Create Content</h1>
                <p className="text-xs text-muted-foreground">Choose content type</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-3">
            <Card
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => setContentType('video')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">Video Tutorial</h3>
                    <p className="text-sm text-muted-foreground">
                      Share workout demonstrations and tips
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => setContentType('article')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">Article / Guide</h3>
                    <p className="text-sm text-muted-foreground">
                      Write detailed training guides
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => setContentType('course')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">Training Course</h3>
                    <p className="text-sm text-muted-foreground">
                      Create structured training programs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContentType(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors -ml-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {contentType === 'video' ? 'New Video' : contentType === 'article' ? 'New Article' : 'New Course'}
              </h1>
              <p className="text-xs text-muted-foreground">Fill in the details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <form className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter title..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Describe your content..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
            />
          </div>

          {contentType === 'video' && (
            <>
              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium mb-2">YouTube URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
                </div>
              </div>
            </>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background">
              <option>Strength Training</option>
              <option>Cardio</option>
              <option>Flexibility</option>
              <option>Nutrition</option>
              <option>Recovery</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              placeholder="beginner, push-ups, chest..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.location.href = '/coach/content-hub';
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Publish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
