import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, UserX, Search, ArrowLeft, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface ConnectionsPageProps {
    onBack?: () => void;
    onViewProfile?: (userId: string) => void;
}

export default function ConnectionsPage({ onBack, onViewProfile }: ConnectionsPageProps) {
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'ATHLETE' | 'COACH'>('all');

    const [discoverUsers, setDiscoverUsers] = useState<any[]>([]);
    const [myConnections, setMyConnections] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentUserId = localStorage.getItem('userId') || '';
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Log when component mounts
    useEffect(() => {
        console.log('🎯 ConnectionsPage mounted');
        console.log('👤 Current user ID:', currentUserId);
        console.log('🌐 API URL:', API_URL);
    }, []);

    useEffect(() => {
        if (currentUserId) {
            console.log('📊 Loading data for tab:', activeTab);
            loadData();
        } else {
            console.warn('⚠️ No current user ID found');
        }
    }, [activeTab, currentUserId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
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
            setError('Failed to load data. Please try again.');
        }
        setLoading(false);
    };

    const loadDiscoverUsers = async () => {
        try {
            console.log('🔍 Loading discover users for:', currentUserId);
            console.log('🌐 Fetching from:', `${API_URL}/api/users/discover?userId=${currentUserId}`);
            
            const response = await fetch(`${API_URL}/api/users/discover?userId=${currentUserId}`);
            console.log('📡 Response status:', response.status, response.statusText);

            if (!response.ok) {
                console.error('❌ Discover API failed, trying fallback...');
                // Fallback: Get all users
                const fallbackResponse = await fetch(`${API_URL}/api/users/all`);
                console.log('📡 Fallback response status:', fallbackResponse.status);
                
                if (fallbackResponse.ok) {
                    const allUsers = await fallbackResponse.json();
                    console.log('📊 All users from fallback:', allUsers.length);
                    // Filter out current user on client side
                    const filtered = allUsers.filter((u: any) => u.userId !== currentUserId);
                    console.log('✅ Loaded users via fallback:', filtered.length);
                    console.log('👥 Users:', filtered.map((u: any) => ({ name: u.name, role: u.role })));
                    setDiscoverUsers(filtered || []);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Discovered users:', data.length);
            console.log('👥 Users:', data.map((u: any) => ({ name: u.name, role: u.role })));
            setDiscoverUsers(data || []);
        } catch (error) {
            console.error('❌ Error loading discover users:', error);
            setError('Failed to load users. Please check your connection.');
            setDiscoverUsers([]);
        }
    };

    const loadMyConnections = async () => {
        try {
            const response = await fetch(`${API_URL}/api/connections/${currentUserId}`);
            if (!response.ok) throw new Error('Failed to load connections');
            const data = await response.json();
            setMyConnections(data || []);
        } catch (error) {
            console.error('Error loading connections:', error);
            setMyConnections([]);
        }
    };

    const loadRequests = async () => {
        try {
            const [pendingRes, sentRes] = await Promise.all([
                fetch(`${API_URL}/api/connections/requests/pending/${currentUserId}`),
                fetch(`${API_URL}/api/connections/requests/sent/${currentUserId}`)
            ]);

            const pending = pendingRes.ok ? await pendingRes.json() : [];
            const sent = sentRes.ok ? await sentRes.json() : [];

            setPendingRequests(pending || []);
            setSentRequests(sent || []);
        } catch (error) {
            console.error('Error loading requests:', error);
            setPendingRequests([]);
            setSentRequests([]);
        }
    };

    const sendConnectionRequest = async (toUserId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/connections/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromUserId: currentUserId, toUserId })
            });

            if (response.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            await fetch(`${API_URL}/api/connections/request/${requestId}/${action}`, {
                method: 'POST'
            });
            loadRequests();
        } catch (error) {
            console.error('Error handling request:', error);
        }
    };

    const filteredUsers = discoverUsers.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.district?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-violet-500/30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button
                                onClick={onBack}
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                                <Users className="w-7 h-7 md:w-8 md:h-8" />
                                Connections
                            </h1>
                            <p className="text-violet-300 text-sm mt-1">Connect with athletes and coaches</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-xl border border-violet-500/30 mb-6">
                        <TabsTrigger value="discover" className="data-[state=active]:bg-violet-600">
                            Discover
                        </TabsTrigger>
                        <TabsTrigger value="connections" className="data-[state=active]:bg-violet-600">
                            My Connections
                            {myConnections.length > 0 && (
                                <Badge className="ml-2 bg-violet-700">{myConnections.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="data-[state=active]:bg-violet-600">
                            Requests
                            {pendingRequests.length > 0 && (
                                <Badge className="ml-2 bg-red-600">{pendingRequests.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Discover Tab */}
                    <TabsContent value="discover" className="space-y-4">
                        {/* Search and Filter */}
                        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                                        <Input
                                            placeholder="Search by name or region..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-black/20 border-violet-500/30 text-white placeholder:text-violet-400/50"
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
                            </CardContent>
                        </Card>

                        {/* User Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-violet-300 mt-4">Loading users...</p>
                            </div>
                        ) : error ? (
                            <Card className="bg-black/40 backdrop-blur-xl border-red-500/30">
                                <CardContent className="p-12 text-center">
                                    <p className="text-red-400">{error}</p>
                                    <Button onClick={loadData} className="mt-4">Try Again</Button>
                                </CardContent>
                            </Card>
                        ) : filteredUsers.length === 0 ? (
                            <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
                                <CardContent className="p-12 text-center">
                                    <Users className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                                    <p className="text-violet-300">
                                        {searchQuery || filterRole !== 'all'
                                            ? 'Try adjusting your search or filters'
                                            : 'All users are already connected or no other users exist'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUsers.map(user => (
                                    <UserCard
                                        key={user._id || user.userId}
                                        user={user}
                                        onConnect={() => sendConnectionRequest(user.userId)}
                                        onViewProfile={() => onViewProfile?.(user.userId)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* My Connections Tab */}
                    <TabsContent value="connections" className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-violet-300 mt-4">Loading connections...</p>
                            </div>
                        ) : myConnections.length === 0 ? (
                            <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
                                <CardContent className="p-12 text-center">
                                    <Users className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No connections yet</h3>
                                    <p className="text-violet-300 mb-6">Start connecting with athletes and coaches</p>
                                    <Button onClick={() => setActiveTab('discover')} className="bg-violet-600 hover:bg-violet-700">
                                        Discover People
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myConnections.map(connection => (
                                    <UserCard
                                        key={connection._id || connection.userId}
                                        user={connection}
                                        isConnected
                                        onViewProfile={() => onViewProfile?.(connection.userId)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Requests Tab */}
                    <TabsContent value="requests" className="space-y-6">
                        {/* Pending Requests */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
                            <div className="space-y-3">
                                {pendingRequests.length === 0 ? (
                                    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
                                        <CardContent className="p-8 text-center">
                                            <p className="text-violet-300">No pending requests</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    pendingRequests.map(request => (
                                        <RequestCard
                                            key={request._id}
                                            request={request}
                                            onAccept={() => handleRequest(request._id, 'accept')}
                                            onReject={() => handleRequest(request._id, 'reject')}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sent Requests */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Sent Requests</h3>
                            <div className="space-y-3">
                                {sentRequests.length === 0 ? (
                                    <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
                                        <CardContent className="p-8 text-center">
                                            <p className="text-violet-300">No sent requests</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    sentRequests.map(request => (
                                        <RequestCard key={request._id} request={request} isSent />
                                    ))
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
        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30 hover:border-violet-400 transition-all hover:scale-[1.02]">
            <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="w-20 h-20 border-2 border-violet-500">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback className="bg-violet-600 text-white text-xl">
                            {user.name?.charAt(0) || '?'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 w-full">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{user.name}</h3>
                        <Badge variant={user.role === 'COACH' ? 'default' : 'secondary'} className="bg-violet-600">
                            {user.role}
                        </Badge>
                    </div>

                    {user.district && (
                        <p className="text-sm text-violet-300 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.district}
                        </p>
                    )}

                    {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center w-full">
                            {user.skills.slice(0, 3).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs border-violet-500/50 text-violet-300">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2 w-full pt-2">
                        {onViewProfile && (
                            <Button
                                onClick={onViewProfile}
                                variant="outline"
                                className="flex-1 border-violet-500/50 hover:bg-violet-600/20"
                                size="sm"
                            >
                                View Profile
                            </Button>
                        )}
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
                        {isConnected && (
                            <Badge variant="outline" className="flex-1 py-2 border-green-500/50 text-green-400">
                                <UserCheck className="w-4 h-4 mr-1" />
                                Connected
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RequestCard({ request, isSent, onAccept, onReject }: any) {
    return (
        <Card className="bg-black/40 backdrop-blur-xl border-violet-500/30">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-violet-500">
                        <AvatarImage src={request.fromUserProfilePic} />
                        <AvatarFallback className="bg-violet-600 text-white">
                            {request.fromUserName?.charAt(0) || '?'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <h4 className="font-bold text-white">{request.fromUserName}</h4>
                        <div className="flex items-center gap-2 text-sm text-violet-300">
                            <Badge variant="secondary" className="text-xs bg-violet-600/50">
                                {request.fromUserRole}
                            </Badge>
                            {request.fromUserRegion && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {request.fromUserRegion}
                                </span>
                            )}
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
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                            Pending
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
