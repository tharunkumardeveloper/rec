import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ConnectionRequest {
    _id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserRole: string;
    fromUserProfilePic?: string;
    fromUserRegion?: string;
    fromUserSkills?: string[];
    toUserId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export default function ConnectionsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');

    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [myConnections, setMyConnections] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = localStorage.getItem('userId') || '';
    const currentUserRole = localStorage.getItem('userRole') || '';

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'discover') {
                await loadDiscoverUsers();
            } else if (activeTab === 'connections') {
                await loadMyConnections();
            } else if (activeTab === 'requests') {
                await loadRequests();
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const loadDiscoverUsers = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/discover?userId=${currentUserId}`);
        const data = await response.json();
        setDiscoverUsers(data);
    };

    const loadMyConnections = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/${currentUserId}`);
        const data = await response.json();
        setMyConnections(data);
    };

    const loadRequests = async () => {
        const [pendingRes, sentRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/requests/pending/${currentUserId}`),
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/requests/sent/${currentUserId}`)
        ]);

        const pending = await pendingRes.json();
        const sent = await sentRes.json();

        setPendingRequests(pending);
        setSentRequests(sent);
    };

    const sendConnectionRequest = async (toUserId: string) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId: currentUserId, toUserId })
            });
            loadData();
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/connections/request/${requestId}/${action}`, {
                method: 'POST'
            });
            loadRequests();
        } catch (error) {
            console.error('Error handling request:', error);
        }
    };

    const filteredUsers = discoverUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.district?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                            <Users className="w-8 h-8 md:w-10 md:h-10" />
                            Connections
                        </h1>
                        <p className="text-violet-300 mt-2">Connect with athletes and coaches</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-black/40">
                        <TabsTrigger value="discover">Discover</TabsTrigger>
                        <TabsTrigger value="connections">
                            My Connections
                            {myConnections.length > 0 && (
                                <Badge className="ml-2 bg-violet-600">{myConnections.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="requests">
                            Requests
                            {pendingRequests.length > 0 && (
                                <Badge className="ml-2 bg-red-600">{pendingRequests.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Discover Tab */}
                    <TabsContent value="discover" className="space-y-4">
                        {/* Search and Filter */}
                        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                                    <Input
                                        placeholder="Search by name or region..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-black/20 border-violet-500/30 text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={filterRole === 'all' ? 'default' : 'outline'}
                                        onClick={() => setFilterRole('all')}
                                        className="flex-1 md:flex-none"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={filterRole === 'ATHLETE' ? 'default' : 'outline'}
                                        onClick={() => setFilterRole('ATHLETE')}
                                        className="flex-1 md:flex-none"
                                    >
                                        Athletes
                                    </Button>
                                    <Button
                                        variant={filterRole === 'COACH' ? 'default' : 'outline'}
                                        onClick={() => setFilterRole('COACH')}
                                        className="flex-1 md:flex-none"
                                    >
                                        Coaches
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* User Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredUsers.map(user => (
                                <UserCard
                                    key={user._id}
                                    user={user}
                                    onConnect={() => sendConnectionRequest(user.userId)}
                                    onViewProfile={() => navigate(`/profile/${user.userId}`)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* My Connections Tab */}
                    <TabsContent value="connections" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myConnections.map(connection => (
                                <UserCard
                                    key={connection._id}
                                    user={connection}
                                    isConnected
                                    onViewProfile={() => navigate(`/profile/${connection.userId}`)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Requests Tab */}
                    <TabsContent value="requests" className="space-y-6">
                        {/* Pending Requests */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
                            <div className="space-y-3">
                                {pendingRequests.map(request => (
                                    <RequestCard
                                        key={request._id}
                                        request={request}
                                        onAccept={() => handleRequest(request._id, 'accept')}
                                        onReject={() => handleRequest(request._id, 'reject')}
                                    />
                                ))}
                                {pendingRequests.length === 0 && (
                                    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-8 text-center">
                                        <p className="text-violet-300">No pending requests</p>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Sent Requests */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Sent Requests</h3>
                            <div className="space-y-3">
                                {sentRequests.map(request => (
                                    <RequestCard key={request._id} request={request} isSent />
                                ))}
                                {sentRequests.length === 0 && (
                                    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-8 text-center">
                                        <p className="text-violet-300">No sent requests</p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function UserCard({ user, isConnected, onConnect, onViewProfile }: any) {
    return (
        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-4 hover:border-violet-400 transition-all">
            <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-20 h-20 border-2 border-violet-500">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback className="bg-violet-600 text-white text-xl">
                        {user.name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'}>
                        {user.role}
                    </Badge>
                </div>

                {user.district && (
                    <p className="text-sm text-violet-300">📍 {user.district}</p>
                )}

                {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 w-full pt-2">
                    <Button
                        onClick={onViewProfile}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                    >
                        View Profile
                    </Button>
                    {!isConnected && onConnect && (
                        <Button
                            onClick={onConnect}
                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                            size="sm"
                        >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Connect
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

function RequestCard({ request, isSent, onAccept, onReject }: any) {
    return (
        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 p-4">
            <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-violet-500">
                    <AvatarImage src={request.fromUserProfilePic} />
                    <AvatarFallback className="bg-violet-600 text-white">
                        {request.fromUserName?.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <h4 className="font-bold text-white">{request.fromUserName}</h4>
                    <div className="flex items-center gap-2 text-sm text-violet-300">
                        <Badge variant="secondary" className="text-xs">
                            {request.fromUserRole}
                        </Badge>
                        {request.fromUserRegion && <span>📍 {request.fromUserRegion}</span>}
                    </div>
                </div>

                {!isSent && (
                    <div className="flex gap-2">
                        <Button
                            onClick={onAccept}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={onReject}
                            size="sm"
                            variant="destructive"
                        >
                            <UserX className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                {isSent && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Pending
                    </Badge>
                )}
            </div>
        </Card>
    );
}
