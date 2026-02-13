import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, LogOut, Home, Users, Ticket, Activity, TrendingUp, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import abelovLogo from '@/assets/abelov-logo.png';
import ThemeToggle from '@/components/ThemeToggle';


interface GlobalStats {
  totalUsers: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  unsuccessfulTickets: number;
  totalRevenue: number;
}

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  // Whether the account is currently active
  is_active: boolean;
  created_at: string;
  // Aggregate stats
  ticketCount: number;
  totalRevenue: number;
  pendingTickets: number;
  completedTickets: number;
  lastActivityDate: string | null;
  // Optional roles array coming from backend (`roles` on user document)
  roles?: string[];
}

interface RequestData {
  id: string;
  customer_name: string;
  device_brand: string;
  device_model: string;
  status: string;
  total_cost: number | null;
  technician_name: string;
  created_at: string;
  user_id: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  status: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, usersData, requestsData, logsData] = await Promise.all([
        adminAPI.getGlobalStats(true), // Force refresh
        adminAPI.getAllUsersWithStats(),
        adminAPI.getAllServiceRequests(20, 0, true), // Force refresh
        adminAPI.getActivityLogs(20, 0),
      ]);

      setGlobalStats(stats as GlobalStats);
      setUsers((usersData as any[]).map((u) => ({ ...u } as UserData)));
      setRequests((requestsData.requests || []) as RequestData[]);
      setTotalRequests(requestsData.total || 0);
      setActivityLogs(logsData.logs as ActivityLog[]);
      setTotalLogs(logsData.total);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await adminAPI.searchRequests(searchQuery, 20, 0);
      setRequests(results.requests);
      setTotalRequests(results.total);
      setCurrentPage(0);
    } catch {
      toast({
        title: 'Error',
        description: 'Search failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    if (val === 'all') {
      loadData();
    } else {
      filterByStatus(val);
    }
  };

  const filterByStatus = async (status: string) => {
    setLoading(true);
    try {
      const results = await adminAPI.getRequestsByStatus(status, 20, 0);
      setRequests(results.requests);
      setTotalRequests(results.total);
      setCurrentPage(0);
    } catch {
      toast({
        title: 'Error',
        description: 'Filter failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
    try {
      const offset = newPage * 20;
      let results;
      if (searchQuery.trim()) {
        results = await adminAPI.searchRequests(searchQuery, 20, offset);
      } else if (statusFilter !== 'all') {
        results = await adminAPI.getRequestsByStatus(statusFilter, 20, offset);
      } else {
        results = await adminAPI.getAllServiceRequests(20, offset, true);
      }

      setRequests(results.requests || []);
      setTotalRequests(results.total || 0);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createUser({
        email: newUserEmail,
        password: newUserPassword,
        roles: [newUserRole]
      });
      toast({ title: 'Success', description: 'User created successfully' });
      setIsCreatingUser(false);
      setNewUserEmail('');
      setNewUserPassword('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await adminAPI.deleteUser(id);
      await loadData();
      toast({ title: 'Success', description: 'User has been deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      // For simplicity in this system, we'll assume a user has one primary role.
      // We assign the new role. The backend logic for roles might vary, 
      // but usually assigning a role like 'admin' or 'user' is sufficient.
      await adminAPI.assignRole(userId, newRole);

      // If we wanted to ensure they ONLY have the new role, we might need a more complex sync,
      // but for now, we'll just assign it and reload.
      toast({ title: 'Success', description: `Role updated to ${newRole}` });
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In-Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Unsuccessful':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !globalStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className='flex items-center gap-4'>
            <img src={abelovLogo} alt="Abelov Logo" className="w-12 rounded-3xl h-12" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-primary dark:text-white">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="md:flex hidden">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="md:hidden">
              <Home className="w-4 h-4" />
            </Button>
            <Button onClick={handleLogout} variant="outline" className="md:flex hidden">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button onClick={handleLogout} variant="outline" className="md:hidden">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Global Stats */}
          {globalStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{globalStats.totalUsers}</p>
                  <p className="text-xs text-gray-500">Active user accounts in system</p>
                </div>
              </Card>

              {/* Total Tickets */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                    <Ticket className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{globalStats.totalTickets}</p>
                  <p className="text-xs text-gray-500">Total service requests</p>
                </div>
              </Card>

              {/* Completed */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-700">{globalStats.completedTickets}</p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-500">Finished requests</p>
                    <span className="text-xs font-semibold text-green-600">
                      {globalStats.totalTickets > 0 ? Math.round((globalStats.completedTickets / globalStats.totalTickets) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Pending */}
              <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-50 border-yellow-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <Activity className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-700">{globalStats.pendingTickets}</p>
                  <p className="text-xs text-gray-500">Awaiting start</p>
                </div>
              </Card>

              {/* In Progress */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <Loader2 className="w-5 h-5 text-cyan-600" />
                  </div>
                  <p className="text-3xl font-bold text-cyan-700">{globalStats.inProgressTickets}</p>
                  <p className="text-xs text-gray-500">Currently being worked on</p>
                </div>
              </Card>

              {/* Unsuccessful */}
              <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Unsuccessful</p>
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-700">{globalStats.unsuccessfulTickets}</p>
                  <p className="text-xs text-gray-500">Failed jobs</p>
                </div>
              </Card>

              {/* Total Revenue */}
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-700">₦{(globalStats.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total earnings</p>

                </div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="requests" className="w-full">
            <TabsList>
              <TabsTrigger value="requests">All Tickets</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <Card className="p-6">
                <div className="mb-4 space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Input
                      placeholder="Search by request ID, customer, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 min-w-64"
                    />
                    <Button onClick={handleSearch} variant="outline">
                      Search
                    </Button>
                  </div>

                  <div>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In-Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Request ID</TableHead>
                            <TableHead className="text-xs font-semibold">Customer</TableHead>
                            <TableHead className="text-xs font-semibold">Device</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-xs font-semibold">Cost</TableHead>
                            <TableHead className="text-xs font-semibold">Technician</TableHead>
                            <TableHead className="text-xs font-semibold">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            requests.map((req: RequestData) => (
                              <TableRow
                                key={req.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => navigate(`/view/${req.id}`)}
                              >
                                <TableCell className="font-mono text-sm font-semibold">{req.id}</TableCell>
                                <TableCell className="text-sm">{req.customer_name}</TableCell>
                                <TableCell className="text-sm">{req.device_brand} {req.device_model}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm font-semibold">₦{req.total_cost?.toLocaleString()}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{req.technician_name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(req.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {requests.length} of {totalRequests} tickets
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0 || loading}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={requests.length < 20 || loading}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-primary">System Users</h3>
                  <Button onClick={() => setIsCreatingUser(!isCreatingUser)} variant={isCreatingUser ? "ghost" : "default"}>
                    {isCreatingUser ? "Cancel" : "Add New User"}
                  </Button>
                </div>

                {isCreatingUser && (
                  <Card className="p-4 mb-6 border-primary/20 bg-muted/30">
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email Address (@abelov.ng required)</label>
                        <Input
                          placeholder="e.g. staff@abelov.ng"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Initial Password</label>
                        <Input
                          type="password"
                          placeholder="Min 12 characters"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">User Role</label>
                        <Select value={newUserRole} onValueChange={setNewUserRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User (Staff/Technician)</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User Account"}
                      </Button>
                    </form>
                  </Card>
                )}

                {loading && !users.length ? (

                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold">Email</TableHead>
                          <TableHead className="text-xs font-semibold">Username</TableHead>
                          <TableHead className="text-xs font-semibold">Role</TableHead>
                          <TableHead className="text-xs font-semibold">Tickets</TableHead>
                          <TableHead className="text-xs font-semibold">Revenue</TableHead>
                          <TableHead className="text-xs font-semibold">Status</TableHead>
                          <TableHead className="text-xs font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((u: UserData) => {
                            const nameFromEmail = u.email.split('@')[0];
                            const primaryRole = (u.roles && u.roles.length > 0 ? u.roles[0] : 'user') || 'user';
                            return (
                              <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="text-sm">{u.email}</TableCell>
                                <TableCell className="text-sm font-medium">{nameFromEmail}</TableCell>
                                <TableCell className="text-sm capitalize">
                                  <Select
                                    value={primaryRole}
                                    onValueChange={(val) => handleRoleChange(u.id, val)}
                                    disabled={loading}
                                  >
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-sm font-semibold">{u.ticketCount}</TableCell>
                                <TableCell className="text-sm font-semibold">₦{u.totalRevenue?.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge variant={u.is_active ? 'default' : 'secondary'}>
                                    {u.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button onClick={() => handleDeleteUser(u.id)} variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-primary">System Activity Logs</h3>
                  <Button onClick={() => loadData()} variant="outline" size="sm">
                    Refresh Logs
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold">User Content</TableHead>
                          <TableHead className="text-xs font-semibold">Action</TableHead>
                          <TableHead className="text-xs font-semibold">Resource</TableHead>
                          <TableHead className="text-xs font-semibold">Status</TableHead>
                          <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No activity logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          activityLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="text-sm font-medium">{log.user}</TableCell>
                              <TableCell className="text-sm">
                                <Badge variant="secondary" className="capitalize">
                                  {log.action.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{log.resource}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
