import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminAPI } from '@/lib/api';
import { Users, Ticket, TrendingUp, Wrench, ShoppingCart, BookOpen, Clock, Activity, BarChart3, FileText, User, ArrowRight } from 'lucide-react';

const formatCurrencyCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
};

interface GlobalStats {
  totalUsers: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  unsuccessfulTickets: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [globalStats, requestsData, logsData] = await Promise.all([
        adminAPI.getGlobalStats(true),
        adminAPI.getAllServiceRequests(5, 0, true),
        adminAPI.getActivityLogs(10, 0),
      ]);
      setStats(globalStats as GlobalStats);
      setRecentRequests((requestsData.requests || requestsData.data || []).slice(0, 5));
      setRecentLogs(logsData.logs || logsData.data || []);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses: Record<string, { bg: string; text: string; icon: string; border: string }> = {
    blue: { bg: 'from-blue-50 to-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'from-green-50 to-green-50', text: 'text-green-700', icon: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'from-yellow-50 to-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', border: 'border-yellow-200' },
    emerald: { bg: 'from-emerald-50 to-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-200' },
    red: { bg: 'from-red-50 to-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-200' },
    cyan: { bg: 'from-cyan-50 to-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-600', border: 'border-cyan-200' },
    orange: { bg: 'from-orange-50 to-orange-50', text: 'text-orange-700', icon: 'text-orange-600', border: 'border-orange-200' },
    indigo: { bg: 'from-indigo-50 to-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-200' },
  };

  function StatCard({ label, value, icon: Icon, color, subtitle, onClick }: { label: string; value: number | string; icon: React.ElementType; color: string; subtitle?: string; onClick?: () => void }) {
    const c = colorClasses[color] || colorClasses.blue;
    return (
      <Card className={`p-5 bg-gradient-to-br ${c.bg} ${c.border} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In-Progress': return 'bg-blue-100 text-blue-800';
      case 'Unsuccessful': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch { return ts; }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-12" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-5 w-32 mb-4" />{[...Array(5)].map((_, j) => (<Skeleton key={j} className="h-10 w-full mb-2" />))}</Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of the entire system.</p>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} color="blue" subtitle="Registered accounts" onClick={() => navigate('/admin/users')} />
        <StatCard label="Total Tickets" value={stats?.totalTickets || 0} icon={Ticket} color="purple" subtitle="All service requests" onClick={() => navigate('/admin/tickets')} />
        <StatCard label="Pending" value={stats?.pendingTickets || 0} icon={Clock} color="yellow" subtitle="Awaiting action" onClick={() => navigate('/admin/tickets')} />
        <StatCard label="Revenue" value={`₦${formatCurrencyCompact(stats?.totalRevenue || 0)}`} icon={TrendingUp} color="emerald" subtitle="Total collected" onClick={() => navigate('/admin/analytics')} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="In Progress" value={stats?.inProgressTickets || 0} icon={Wrench} color="cyan" subtitle="Being worked on" onClick={() => navigate('/admin/tickets')} />
        <StatCard label="Completed" value={stats?.completedTickets || 0} icon={Activity} color="green" subtitle={`${stats && stats.totalTickets > 0 ? Math.round((stats.completedTickets / stats.totalTickets) * 100) : 0}% completion`} onClick={() => navigate('/admin/tickets')} />
        <StatCard label="Unsuccessful" value={stats?.unsuccessfulTickets || 0} icon={Activity} color="red" onClick={() => navigate('/admin/tickets')} />
        <StatCard label="Analytics" value="View All" icon={BarChart3} color="indigo" subtitle="Full analytics report" onClick={() => navigate('/admin/analytics')} />
      </div>

      {/* Quick Links */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">Quick Links</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/admin/analytics')}>
            <BarChart3 size={20} />
            <span className="text-xs">Analytics</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/admin/tickets')}>
            <FileText size={20} />
            <span className="text-xs">Tickets</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/admin/users')}>
            <User size={20} />
            <span className="text-xs">Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/admin/activity')}>
            <Activity size={20} />
            <span className="text-xs">Activity</span>
          </Button>
        </div>
      </Card>

      {/* Recent Requests & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Recent Tickets</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/tickets')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tickets yet</p>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{req.customer_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.device_brand} {req.device_model} — {req.id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <Badge className={getStatusBadge(req.status)} variant="outline">{req.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/activity')}>
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{log.resource || log.action || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{log.user || ''}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{log.timestamp ? formatTime(log.timestamp) : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
