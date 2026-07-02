import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Ticket, TrendingUp, Activity, Package, ShoppingCart, Truck, DollarSign, CreditCard, BookOpen, CheckCircle, Wrench, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { adminAPI, serviceRequestAPI } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ModuleStats {
  repairs: { totalTickets: number; pendingTickets: number; inProgressTickets: number; completedTickets: number; unsuccessfulTickets: number; totalRevenue: number };
  sales: { totalGoods: number; totalOrders: number; totalPurchases: number; totalExpenses: number; totalCredits: number; salesRevenue: number; salesCost: number };
  academy: { totalCourses: number; publishedCourses: number };
}

interface ServiceRequest {
  id: string;
  created_at: string;
  status: string;
  department: string;
  total_cost: number;
  [key: string]: any;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981',
  Pending: '#f59e0b',
  'In-Progress': '#3b82f6',
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

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [moduleStats, allRequests] = await Promise.all([
        adminAPI.getModuleStats(forceRefresh),
        serviceRequestAPI.getAll(forceRefresh) as Promise<{ data: ServiceRequest[]; total?: number }>,
      ]);
      setStats(moduleStats as ModuleStats);
      setRequests(allRequests.data || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueOverTime = (() => {
    const monthly: Record<string, number> = {};
    requests.forEach((r) => {
      if (!r.created_at) return;
      const month = r.created_at.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + (r.total_cost || 0);
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }));
  })();

  const statusDistribution = (() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const monthlyTickets = (() => {
    const monthly: Record<string, number> = {};
    requests.forEach((r) => {
      if (!r.created_at) return;
      const month = r.created_at.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  })();

  const departmentDistribution = (() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      const dept = r.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const colorClasses: Record<string, { bg: string; text: string; icon: string; border: string }> = {
    blue: { bg: 'from-blue-50 to-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'from-green-50 to-green-50', text: 'text-green-700', icon: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'from-yellow-50 to-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', border: 'border-yellow-200' },
    cyan: { bg: 'from-blue-50 to-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-600', border: 'border-cyan-200' },
    red: { bg: 'from-red-50 to-orange-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-200' },
    emerald: { bg: 'from-emerald-50 to-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-200' },
    orange: { bg: 'from-orange-50 to-orange-50', text: 'text-orange-700', icon: 'text-orange-600', border: 'border-orange-200' },
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Analytics</h1>
        <button onClick={() => loadData(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
          <Loader2 className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Repairs Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Repairs</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Tickets" value={stats.repairs.totalTickets} icon={Ticket} color="purple" />
          <StatCard label="Pending" value={stats.repairs.pendingTickets} icon={Activity} color="yellow" />
          <StatCard label="In Progress" value={stats.repairs.inProgressTickets} icon={Loader2} color="cyan" />
          <StatCard label="Completed" value={stats.repairs.completedTickets} icon={CheckCircle} color="green" subtitle={stats.repairs.totalTickets > 0 ? `${Math.round((stats.repairs.completedTickets / stats.repairs.totalTickets) * 100)}% completion` : undefined} />
          <StatCard label="Unsuccessful" value={stats.repairs.unsuccessfulTickets} icon={Activity} color="red" />
          <StatCard label="Revenue" value={`₦${formatCurrencyCompact(stats.repairs.totalRevenue || 0)}`} icon={TrendingUp} color="emerald" />
        </div>
      </section>

      {/* Sales Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Sales</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Goods" value={stats.sales.totalGoods} icon={Package} color="blue" />
          <StatCard label="Orders" value={stats.sales.totalOrders} icon={Truck} color="purple" />
          <StatCard label="Purchases" value={stats.sales.totalPurchases} icon={ShoppingCart} color="orange" />
          <StatCard label="Expenses" value={stats.sales.totalExpenses} icon={DollarSign} color="red" />
          <StatCard label="Credits" value={stats.sales.totalCredits} icon={CreditCard} color="yellow" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Revenue</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">₦{formatCurrencyCompact(stats.sales.salesRevenue || 0)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Cost</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">₦{formatCurrencyCompact(stats.sales.salesCost || 0)}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-orange-600" />
            </div>
          </Card>
        </div>
      </section>

      {/* Academy Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Academy</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Courses" value={stats.academy.totalCourses} icon={BookOpen} color="purple" />
          <StatCard label="Published" value={stats.academy.publishedCourses} icon={CheckCircle} color="green" subtitle={stats.academy.totalCourses > 0 ? `${Math.round((stats.academy.publishedCourses / stats.academy.totalCourses) * 100)}% published` : undefined} />
          <StatCard label="Drafts" value={stats.academy.totalCourses - stats.academy.publishedCourses} icon={Activity} color="yellow" />
        </div>
      </section>

      {/* Charts Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Revenue & Trends</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Revenue Over Time</h3>
            {revenueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueOverTime}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₦${formatCurrencyCompact(v)}`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`₦${formatCurrencyCompact(value)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No revenue data available</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Tickets by Status</h3>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No ticket data available</p>
            )}
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Ticket Trends & Distribution</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Monthly Tickets</h3>
            {monthlyTickets.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTickets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No ticket data available</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Tickets by Department</h3>
            {departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No department data available</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
