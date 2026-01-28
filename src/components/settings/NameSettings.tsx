import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const NameSettings = () => {
  const [name, setName] = useState(localStorage.getItem('user_name') || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('user_name', name);
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success(name ? `Name saved! Voice coach will call you ${name}` : 'Name cleared');
    }, 300);
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          Your Name
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-name">Name (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add your name for personalized voice coaching during workouts
          </p>
          <Input
            id="user-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Name'}
        </Button>

        {name && (
          <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Preview:</span> "Great work {name}! 10 reps!"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NameSettings;
