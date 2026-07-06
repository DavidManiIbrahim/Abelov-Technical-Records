import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { serviceRequestAPI, attendanceAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Timer,
  DollarSign,
  Loader2,
  Eye,
  Award,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In-Progress': '#3b82f6',
  Completed: '#10b981',
  Unsuccessful: '#ef4444',
};

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'In-Progress': return 'bg-blue-100 text-blue-800';
    case 'Unsuccessful': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function TechnicianAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [myAttendanceToday, setMyAttendanceToday] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await serviceRequestAPI.getAll(forceRefresh);
      const list = Array.isArray(data) ? (data as ServiceRequest[]) : ((data as any)?.data || []) as ServiceRequest[];
      setRequests(list);

      // Best-effort: pull today's attendance for the signed-in technician so we
      // can surface it on the analytics header. Failures are non-fatal.
      if (user?.id) {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const res = await attendanceAPI.getMyAttendance(today, today);
          const rec = (res.data || [])[0];
          if (rec) {
            const bits: string[] = [];
            if (rec.clock_in) bits.push(`In: ${rec.clock_in.slice(0, 5)}`);
            if (rec.clock_out) bits.push(`Out: ${rec.clock_out.slice(0, 5)}`);
            setMyAttendanceToday(bits.length > 0 ? bits.join(' • ') : rec.status);
          }
        } catch {
          setMyAttendanceToday(null);
        }
      }
    } catch (error) {
      console.error('Failed to load technician analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Scope to this technician. Only trust the explicit assignment id; fall back
  // to a strict equality match against technician_name to avoid false positives
  // between technicians with overlapping email prefixes.
  const myJobs = useMemo(() => {
    if (!user) return [] as ServiceRequest[];
    return requests.filter((r) => {
      if (r.assigned_to && user.id && r.assigned_to === user.id) return true;
      if (r.technician_name && user.email && r.technician_name === user.email) return true;
      return false;
    });
  }, [requests, user]);

  const stats = useMemo(() => {
    const totalAssigned = myJobs.length;
    const pending = myJobs.filter((r) => r.status === 'Pending' && !r.accepted_at).length;
    const accepted = myJobs.filter((r) => r.status === 'Pending' && !!r.accepted_at).length;
    const inProgress = myJobs.filter((r) => r.status === 'In-Progress').length;
    const completed = myJobs.filter((r) => r.status === 'Completed').length;
    const unsuccessful = myJobs.filter((r) => r.status === 'Unsuccessful').length;
    const totalRevenue = myJobs.reduce((sum, r) => sum + (r.total_cost || 0), 0);
    const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

    // Avg resolution time (in days) — prefer delivered_at (true completion) and
    // fall back to updated_at only for completed jobs that have no delivery stamp.
    const completedJobs = myJobs.filter((r) => r.status === 'Completed' && r.accepted_at);
    let avgResolutionDays = 0;
    if (completedJobs.length > 0) {
      const totalMs = completedJobs.reduce((sum, r) => {
        const start = new Date(r.accepted_at as string).getTime();
        const endTs = r.delivered_at ? new Date(r.delivered_at).getTime() : new Date(r.updated_at).getTime();
        return sum + Math.max(0, endTs - start);
      }, 0);
      avgResolutionDays = totalMs / completedJobs.length / (1000 * 60 * 60 * 24);
    }

    // This month stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const thisMonthJobs = myJobs.filter((r) => (r.created_at || '').slice(0, 10) >= monthStart);
    const thisMonthCompleted = thisMonthJobs.filter((r) => r.status === 'Completed').length;
    const thisMonthRevenue = thisMonthJobs.reduce((sum, r) => sum + (r.total_cost || 0), 0);

    return {
      totalAssigned,
      pending,
      accepted,
      inProgress,
      completed,
      unsuccessful,
      totalRevenue,
      completionRate,
      avgResolutionDays,
      thisMonthJobs: thisMonthJobs.length,
      thisMonthCompleted,
      thisMonthRevenue,
    };
  }, [myJobs]);

  const statusDistribution = useMemo(
    () =>
      [
        { name: 'Pending', value: stats.pending },
        { name: 'Accepted', value: stats.accepted },
        { name: 'In-Progress', value: stats.inProgress },
        { name: 'Completed', value: stats.completed },
        { name: 'Unsuccessful', value: stats.unsuccessful },
      ].filter((d) => d.value > 0),
    [stats],
  );

  const monthlyTrend = useMemo(() => {
    const monthly: Record<string, { month: string; total: number; completed: number; revenue: number }> = {};
    myJobs.forEach((r) => {
      if (!r.created_at) return;
      const month = r.created_at.slice(0, 7);
      if (!monthly[month]) monthly[month] = { month, total: 0, completed: 0, revenue: 0 };
      monthly[month].total += 1;
      if (r.status === 'Completed') monthly[month].completed += 1;
      monthly[month].revenue += r.total_cost || 0;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [myJobs]);

  const brandBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    myJobs.forEach((r) => {
      const brand = r.device_brand || 'Unknown';
      counts[brand] = (counts[brand] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [myJobs]);

  const deviceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    myJobs.forEach((r) => {
      const m = r.device_model || 'Other';
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  }, [myJobs]);

  const recentJobs = useMemo(
    () =>
      [...myJobs]
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 8),
    [myJobs],
  );

  const colorClasses: Record<string, { bg: string; text: string; icon: string; border: string }> = {
    blue: { bg: 'from-blue-50 to-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'from-green-50 to-green-50', text: 'text-green-700', icon: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'from-yellow-50 to-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', border: 'border-yellow-200' },
    emerald: { bg: 'from-emerald-50 to-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-200' },
    red: { bg: 'from-red-50 to-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-200' },
    orange: { bg: 'from-orange-50 to-orange-50', text: 'text-orange-700', icon: 'text-orange-600', border: 'border-orange-200' },
    cyan: { bg: 'from-cyan-50 to-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-600', border: 'border-cyan-200' },
    indigo: { bg: 'from-indigo-50 to-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-200' },
  };

  function StatCard({ label, value, icon: Icon, color, subtitle }: { label: string; value: number | string; icon: React.ElementType; color: string; subtitle?: string }) {
    const c = colorClasses[color] || colorClasses.blue;
    return (
      <Card className={`p-5 bg-gradient-to-br ${c.bg} ${c.border}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-12" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-40 mb-4" /><Skeleton className="h-[280px] w-full rounded" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Technician Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance insights for {user?.name || user?.email?.split('@')[0] || 'your account'}.</p>
        </div>
        <div className="flex items-center gap-2">
          {myAttendanceToday && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" /> Today: {myAttendanceToday}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => loadData(true)}>
            <Loader2 className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Key Metrics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Assigned" value={stats.totalAssigned} icon={Wrench} color="blue" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" subtitle={`${stats.completionRate}% completion rate`} />
          <StatCard label="In Progress" value={stats.inProgress} icon={Loader2} color="cyan" />
          <StatCard label="Pending" value={stats.pending + stats.accepted} icon={Clock} color="yellow" subtitle={`${stats.accepted} accepted`} />
          <StatCard label="Unsuccessful" value={stats.unsuccessful} icon={AlertCircle} color="red" />
          <StatCard label="Total Revenue" value={`₦${formatCurrencyCompact(stats.totalRevenue)}`} icon={DollarSign} color="emerald" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatCard label="Avg Resolution Time" value={`${stats.avgResolutionDays.toFixed(1)}d`} icon={Timer} color="indigo" subtitle={stats.completed > 0 ? `across ${stats.completed} completed jobs` : 'No completed jobs yet'} />
          <StatCard label="This Month" value={stats.thisMonthJobs} icon={Calendar} color="purple" subtitle={`${stats.thisMonthCompleted} completed`} />
          <StatCard label="This Month Revenue" value={`₦${formatCurrencyCompact(stats.thisMonthRevenue)}`} icon={Award} color="orange" subtitle={stats.thisMonthJobs > 0 ? `${formatCurrencyCompact(Math.round(stats.thisMonthRevenue / Math.max(1, stats.thisMonthJobs)))} avg / job` : 'No jobs this month'} />
        </div>
      </section>

      {/* Status Distribution + Device Model */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Job Distribution</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Job Status Breakdown</h3>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[0]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No jobs assigned yet</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Device Type Breakdown</h3>
            {deviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={deviceBreakdown} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {deviceBreakdown.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No jobs assigned yet</p>
            )}
          </Card>
        </div>
      </section>

      {/* Trends Over Time */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Performance Trends</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Monthly Volume (Total vs Completed)</h3>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Assigned" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available yet</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Monthly Revenue Trend</h3>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="techRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₦${formatCurrencyCompact(v)}`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`₦${formatCurrencyCompact(value)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#techRevenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No revenue data yet</p>
            )}
          </Card>
        </div>
      </section>

      {/* Brand Breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Devices Worked On</h2>
        </div>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Top Device Brands</h3>
          {brandBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(280, brandBreakdown.length * 36)}>
              <BarChart data={brandBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No brand data available</p>
          )}
        </Card>
      </section>

      {/* Recent Jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <Badge variant="outline" className="text-sm">{myJobs.length} total</Badge>
        </div>
        <Card className="p-5">
          {recentJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No jobs assigned yet — your recent work will appear here.</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold truncate">{job.customer_name || 'Unknown customer'}</span>
                      <Badge className={getStatusColor(job.status)} variant="outline">{job.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {job.device_brand} {job.device_model} • {job.created_at?.slice(0, 10)} • ID: {job.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-sm font-semibold text-muted-foreground">₦{formatCurrencyCompact(job.total_cost || 0)}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/view/${job.id}`)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
