import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { serviceRequestAPI, adminAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Eye, Trash2, UserRound, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddWalkinModal from '@/components/AddWalkinModal';

const formatCurrencyCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const num = value / 1_000_000;
    return `${Number.isInteger(num) ? num.toFixed(0) : num.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const num = value / 1_000;
    return `${Number.isInteger(num) ? num.toFixed(0) : num.toFixed(1)}k`;
  }
  return value.toLocaleString();
};

export default function RepairsDashboard() {
  const navigate = useNavigate();
  const { user, userRoles, isAdmin } = useAuth();
  const isTechnician = userRoles.includes('technician');

  const getUsername = () => {
    return user?.username || localStorage.getItem('userUsername') || '';
  };
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  const [searchQuery, setSearchQuery] = usePersistentState('dashboard_search', '');
  const [statusFilter, setStatusFilter] = usePersistentState('dashboard_status_filter', 'All');
  const [loading, setLoading] = useState(true);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    unsuccessful: 0,
    totalRevenue: 0,
  });

  const revenueOverTime = requests.reduce((acc, req) => {
    const month = new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.revenue += req.total_cost || 0;
    } else {
      acc.push({ month, revenue: req.total_cost || 0 });
    }
    return acc;
  }, [] as { month: string; revenue: number }[]);

  const revenueOverTimeSorted = [...revenueOverTime].sort((a, b) => {
    const aDate = new Date(`${a.month} 1`);
    const bDate = new Date(`${b.month} 1`);
    return aDate.getTime() - bDate.getTime();
  });

  const latestMonthRevenue = revenueOverTimeSorted.length
    ? revenueOverTimeSorted[revenueOverTimeSorted.length - 1]
    : null;

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await serviceRequestAPI.getAll(true);

      const requestsData = data || [];
      setRequests(requestsData);

      let filtered = requestsData;
      if (statusFilter !== 'All') {
        filtered = requestsData.filter(r => r.status === statusFilter);
      }
      setFilteredRequests(filtered);

      const currentMonthRequests = requestsData.filter(r => isCurrentMonth(r.created_at));
      const calculatedStats = currentMonthRequests.reduce(
        (acc, request) => {
          acc.total++;
          acc.totalRevenue += request.total_cost || 0;
          switch (request.status) {
            case 'Completed': acc.completed++; break;
            case 'Pending': acc.pending++; break;
            case 'In-Progress': acc.inProgress++; break;
            case 'Unsuccessful': acc.unsuccessful++; break;
          }
          return acc;
        },
        { total: 0, completed: 0, pending: 0, inProgress: 0, unsuccessful: 0, totalRevenue: 0 }
      );
      setStats(calculatedStats);
    } catch (error) {
      console.error('Fatal error loading dashboard data:', error);
      setRequests([]);
      setFilteredRequests([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        unsuccessful: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!searchQuery) {
      loadRequests();
    } else {
      handleSearch(searchQuery);
    }
  }, [loadRequests, statusFilter]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user?.id) return;

    if (query.trim() === '') {
      loadRequests();
    } else {
      try {
        const results = await adminAPI.searchRequests(query, 100, 0);
        let foundRequests = results.requests || [];

        if (statusFilter !== 'All') {
          foundRequests = foundRequests.filter(r => r.status === statusFilter);
        }

        setFilteredRequests(foundRequests);
      } catch (error) {
        console.error('Error searching:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) return;
    try {
      await serviceRequestAPI.delete(id);
      setRequests(requests.filter(r => r.id !== id));
      setFilteredRequests(filteredRequests.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In-Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unsuccessful':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, trend }: { title: string; value: string | number; trend?: string }) => (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold text-primary">{value}</p>
      {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Repairs Dashboard
          </h1>
          <p className="text-muted-foreground">
            {isTechnician ? "Overview of your assigned jobs and metrics." : "Overview of service requests and business metrics."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <StatCard title="Total Requests" value={stats.total} />
          <StatCard title="Completed" value={stats.completed} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="In Progress" value={stats.inProgress} />
          <StatCard title="Unsuccessful" value={stats.unsuccessful} />
          <StatCard title="Total Revenue" value={`₦${formatCurrencyCompact(stats.totalRevenue || 0)}`} />
          <StatCard
            title={`Revenue for ${latestMonthRevenue ? latestMonthRevenue.month : 'Current Month'}`}
            value={`₦${latestMonthRevenue ? formatCurrencyCompact(latestMonthRevenue.revenue) : '0'}`}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, device, ID, or status..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-full md:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In-Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setShowChoiceModal(true)} size="lg" className="md:flex hidden">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
          <Button onClick={() => setShowChoiceModal(true)} size="lg" className="md:hidden">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-[200px] rounded-lg" />
              <Skeleton className="h-10 w-[140px] rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== 'All' ? 'No Results Found' : 'No Service Requests Yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Create your first service request to get started.'}
            </p>
            <Button onClick={() => setShowChoiceModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Service Request
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Request ID</p>
                    <p className="font-mono font-semibold text-primary text-sm">{request.id}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p><span className="font-medium">Customer:</span> {request.customer_name}</p>
                  <p><span className="font-medium">Phone:</span> {request.customer_phone}</p>
                  <p><span className="font-medium">Device:</span> {request.device_brand} {request.device_model}</p>
                  <p><span className="font-medium">Date:</span> {new Date(request.request_date).toLocaleDateString()}</p>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="font-bold text-primary">₦{request.total_cost.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Balance</p>
                      <p className={`font-bold ${request.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₦{request.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <Badge variant="outline" className={
                      request.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                      request.payment_status === 'partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {request.payment_status === 'paid' ? 'Paid' :
                       request.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/view/${request.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex hidden"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => navigate(`/view/${request.id}`)}
                    variant="outline"
                    size="sm"
                    className="md:hidden"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => navigate(`/edit/${request.id}`)}
                    variant="default"
                    size="sm"
                    className="flex-1 md:flex hidden"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => navigate(`/edit/${request.id}`)}
                    variant="default"
                    size="sm"
                    className="md:hidden"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => handleDelete(request.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={showChoiceModal} onOpenChange={setShowChoiceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Service Request</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => {
                setShowChoiceModal(false);
                setShowWalkinModal(true);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all"
            >
              <UserRound className="w-10 h-10 text-muted-foreground" />
              <span className="font-semibold">Walk-in Customer</span>
              <span className="text-xs text-muted-foreground text-center">Quick entry with amount & problem of laptop</span>
            </button>
            <button
              onClick={() => {
                setShowChoiceModal(false);
                navigate("/new-request");
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all"
            >
              <User className="w-10 h-10 text-muted-foreground" />
              <span className="font-semibold">Known Customer</span>
              <span className="text-xs text-muted-foreground text-center">Full form with customer & device details</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AddWalkinModal
        open={showWalkinModal}
        onOpenChange={setShowWalkinModal}
        onSuccess={async () => {
          const data = await serviceRequestAPI.getAll(true);
          setRequests(data.reverse());
          setFilteredRequests(data.reverse());
        }}
      />
      </div>
    </div>
  );
}
