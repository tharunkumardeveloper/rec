import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Plus, MapPin, Users, Clock, Edit, Trash2, CheckCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'competition' | 'training' | 'assessment' | 'workshop';
  participants: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface SAIEventsSchedulerProps {
  onBack: () => void;
}

const SAIEventsScheduler = ({ onBack }: SAIEventsSchedulerProps) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'National Athletics Championship',
      date: '2026-03-15',
      time: '09:00 AM',
      location: 'Jawaharlal Nehru Stadium, New Delhi',
      type: 'competition',
      participants: 250,
      description: 'Annual national level athletics competition for SAI athletes',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Fitness Assessment Camp',
      date: '2026-03-01',
      time: '08:00 AM',
      location: 'SAI Training Center, Bangalore',
      type: 'assessment',
      participants: 120,
      description: 'Quarterly fitness assessment for all registered athletes',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Coaching Workshop - Advanced Techniques',
      date: '2026-02-28',
      time: '10:00 AM',
      location: 'SAI Headquarters, Patiala',
      type: 'workshop',
      participants: 45,
      description: 'Workshop for coaches on advanced training methodologies',
      status: 'ongoing'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'competition',
    participants: 0,
    description: '',
    status: 'upcoming'
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      alert('Please fill in all required fields');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title!,
      date: newEvent.date!,
      time: newEvent.time!,
      location: newEvent.location!,
      type: newEvent.type as Event['type'],
      participants: newEvent.participants || 0,
      description: newEvent.description || '',
      status: 'upcoming'
    };

    setEvents([event, ...events]);
    setShowCreateModal(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'competition',
      participants: 0,
      description: '',
      status: 'upcoming'
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'competition': return 'bg-red-500';
      case 'training': return 'bg-blue-500';
      case 'assessment': return 'bg-green-500';
      case 'workshop': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return <Badge className="bg-blue-500">Upcoming</Badge>;
      case 'ongoing': return <Badge className="bg-green-500">Ongoing</Badge>;
      case 'completed': return <Badge className="bg-gray-500">Completed</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Events & Scheduling</h2>
            <p className="text-sm text-muted-foreground">Manage national level events and competitions</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{events.filter(e => e.status === 'upcoming').length}</div>
            <p className="text-sm text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{events.filter(e => e.status === 'ongoing').length}</div>
            <p className="text-sm text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{events.reduce((sum, e) => sum + e.participants, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="border-l-4" style={{ borderLeftColor: getEventTypeColor(event.type).replace('bg-', '#') }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{event.participants} participants</span>
                </div>
              </div>

              <div className="mt-3">
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Event Title *</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date *</label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Time *</label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Location *</label>
                <Input
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter event location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Event Type</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                  >
                    <option value="competition">Competition</option>
                    <option value="training">Training</option>
                    <option value="assessment">Assessment</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Expected Participants</label>
                  <Input
                    type="number"
                    value={newEvent.participants}
                    onChange={(e) => setNewEvent({ ...newEvent, participants: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateEvent} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                  Create Event
                </Button>
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SAIEventsScheduler;
