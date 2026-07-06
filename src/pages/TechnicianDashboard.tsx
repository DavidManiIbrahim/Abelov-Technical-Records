import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { serviceRequestAPI, technicianAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { Wrench, CheckCircle, Clock, AlertCircle, TrendingUp, Eye, BarChart3, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

const formatCurrencyCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
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

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which job currently has an in-flight action so the spinner is scoped
  // to that single row instead of blocking the whole dashboard.
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await serviceRequestAPI.getAll(true);
      const all = (data || []) as ServiceRequest[];
      setRequests(Array.isArray(all) ? all : []);
    } catch (error) {
      console.error('Failed to load technician data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await technicianAPI.acceptJob(jobId);
      toast({ title: 'Job accepted', description: 'Status updated to In-Progress' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to accept job', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await technicianAPI.markDelivered(jobId);
      toast({ title: 'Job completed', description: 'Marked as completed and delivered' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to complete job', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkUnsuccessful = async (jobId: string) => {
    const confirm = window.confirm('Mark this job as unsuccessful? This will close out the work order.');
    if (!confirm) return;
    setActionLoading(jobId);
    try {
      await technicianAPI.updateProgress(jobId, { status: 'Unsuccessful' });
      toast({ title: 'Marked unsuccessful', description: 'Job has been flagged as unsuccessful' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update status', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const myJobs = requests.filter(r => r.assigned_to === user?.id);
  const pendingJobs = myJobs.filter(r => r.status === 'Pending' && !r.accepted_at);
  const acceptedJobs = myJobs.filter(r => r.status === 'Pending' && !!r.accepted_at);
  const inProgressJobs = myJobs.filter(r => r.status === 'In-Progress');
  const completedJobs = myJobs.filter(r => r.status === 'Completed');
  const unsuccessfulJobs = myJobs.filter(r => r.status === 'Unsuccessful');
  const totalRevenue = myJobs.reduce((sum, r) => sum + (r.total_cost || 0), 0);

  const statusDistribution = [
    { name: 'Pending', value: pendingJobs.length },
    { name: 'Accepted', value: acceptedJobs.length },
    { name: 'In Progress', value: inProgressJobs.length },
    { name: 'Completed', value: completedJobs.length },
    { name: 'Unsuccessful', value: unsuccessfulJobs.length },
  ].filter(d => d.value > 0);

  const monthlyJobs = (() => {
    const monthly: Record<string, number> = {};
    myJobs.forEach((r) => {
      if (!r.created_at) return;
      const month = r.created_at.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  })();

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
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-40 mb-4" /><Skeleton className="h-[300px] w-full rounded" /></Card>
          ))}
        </div>
        <Card className="p-5"><Skeleton className="h-6 w-32 mb-4" />{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full mb-2" />))}</Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your assigned jobs and performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Assigned" value={myJobs.length} icon={Wrench} color="blue" />
        <StatCard label="Pending" value={pendingJobs.length} icon={Clock} color="yellow" />
        <StatCard label="Accepted" value={acceptedJobs.length} icon={AlertCircle} color="orange" />
        <StatCard label="In Progress" value={inProgressJobs.length} icon={TrendingUp} color="cyan" />
        <StatCard label="Completed" value={completedJobs.length} icon={CheckCircle} color="green" subtitle={myJobs.length > 0 ? `${Math.round((completedJobs.length / myJobs.length) * 100)}% completion` : undefined} />
        <StatCard label="Revenue" value={`₦${formatCurrencyCompact(totalRevenue)}`} icon={TrendingUp} color="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Job Status Distribution</h3>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
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
          <h3 className="text-sm font-medium text-gray-600 mb-4">Jobs Over Time</h3>
          {monthlyJobs.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyJobs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No jobs assigned yet</p>
          )}
        </Card>
      </div>

      {/* Assigned Jobs List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Assigned Jobs</h2>
          </div>
          <Badge variant="outline" className="text-sm">{myJobs.length} total</Badge>
        </div>
        <Card className="p-5">
          {myJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No jobs have been assigned to you yet.</p>
          ) : (
            <div className="space-y-3">
              {myJobs.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).map((job) => (
                <div key={job.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{job.customer_name}</span>
                        <Badge className={getStatusColor(job.status)} variant="outline">{job.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {job.device_brand} {job.device_model} • ID: {job.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground shrink-0">₦{formatCurrencyCompact(job.total_cost || 0)}</span>
                  </div>

                  {/* Action row — scoped per-job loading state */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/view/${job.id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>

                    {job.status === 'Pending' && !job.accepted_at && (
                      <Button
                        size="sm"
                        disabled={actionLoading === job.id}
                        onClick={() => handleAccept(job.id)}
                      >
                        {actionLoading === job.id ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        Accept Job
                      </Button>
                    )}

                    {job.status === 'In-Progress' && (
                      <>
                        <Button
                          size="sm"
                          disabled={actionLoading === job.id}
                          onClick={() => handleMarkComplete(job.id)}
                        >
                          {actionLoading === job.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === job.id}
                          onClick={() => handleMarkUnsuccessful(job.id)}
                        >
                          Mark Unsuccessful
                        </Button>
                      </>
                    )}

                    {job.status === 'Completed' && (
                      <span className="text-xs text-muted-foreground italic inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" /> Job completed
                      </span>
                    )}
                    {job.status === 'Unsuccessful' && (
                      <span className="text-xs text-muted-foreground italic inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-600" /> Marked unsuccessful
                      </span>
                    )}
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
