import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { serviceRequestAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { TrendingUp, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const TechnicianTick = ({ x, y, payload }: any) => {
  const value: string = String(payload?.value ?? '');
  const parts = value.split(' ');

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" style={{ fontSize: 10 }}>
        {parts.map((part, index) => (
          <tspan key={index} x={0} dy={index === 0 ? 0 : 12}>
            {part}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export default function AnalyticsDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Define a list of canonical technician names. This would ideally come from a backend or configuration.
  // For now, we'll derive it from existing data or assume a small set.
  // If the goal is to remove duplicates like "John Doe" and "john doe", we need a canonical list.
  // Let's assume for now that the primary goal is case-insensitive matching and trimming.
  // If a fixed list of VALID_TECHNICIANS is needed, it should be provided.
  // For the purpose of this change, we'll make `normalizeName` handle trimming and casing for comparison.
  // The `VALID_TECHNICIANS` part in the instruction snippet seems to be a placeholder or an incomplete thought.
  // I will implement `normalizeName` to handle trimming and consistent casing for comparison.
  // If `VALID_TECHNICIANS` is truly meant to be used, it needs to be defined.
  // Given the instruction "Normalize technician names... to remove duplicates", the primary mechanism
  // will be consistent processing of names (trimming, lowercasing) before comparison.

  const normalizeNameForComparison = (name: string | undefined): string => {
    if (!name) return 'unassigned'; // Default to 'unassigned' for comparison
    return name.trim().toLowerCase();
  };

  const getCanonicalName = (name: string | undefined): string => {
    if (!name) return 'Unassigned';
    const trimmedName = name.trim();
    if (!trimmedName) return 'Unassigned';
    // In a real application, VALID_TECHNICIANS would be a predefined list of canonical names.
    // For this exercise, we'll just capitalize the first letter of each word for a "canonical" look
    // if it's not 'Unassigned'.
    if (trimmedName.toLowerCase() === 'unassigned') return 'Unassigned';
    return trimmedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch ALL service requests globally
      const data = await serviceRequestAPI.getAll(true);
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading global analytics data:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Revenue over time
  const revenueOverTime = requests.reduce((acc, req) => {
    const month = new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.revenue += req.total_cost || 0;
      existing.count += 1;
    } else {
      acc.push({ month, revenue: req.total_cost || 0, count: 1 });
    }
    return acc;
  }, [] as { month: string; revenue: number; count: number }[]);

  const revenueOverTimeSorted = [...revenueOverTime].sort((a, b) => {
    // Parse "Jan 2025" style labels into Date objects for reliable sorting
    const aDate = new Date(`${a.month} 1`);
    const bDate = new Date(`${b.month} 1`);
    return aDate.getTime() - bDate.getTime();
  });

  // Device breakdown
  const deviceBreakdown = requests.reduce((acc, req) => {
    const device = req.device_model || 'Unknown';
    const existing = acc.find(item => item.device === device);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ device, count: 1 });
    }
    return acc;
  }, [] as { device: string; count: number }[]);

  // Status trends
  const statusTrends = [
    { status: 'Completed', Completed: requests.filter(r => r.status === 'Completed').length },
    { status: 'In-Progress', 'In-Progress': requests.filter(r => r.status === 'In-Progress').length },
    { status: 'Pending', Pending: requests.filter(r => r.status === 'Pending').length },
    { status: 'Unsuccessful', Unsuccessful: requests.filter(r => r.status === 'Unsuccessful').length },
  ];

  // Technician work histogram
  const technicianWork = requests.reduce((acc, req) => {
    const techRaw = req.technician_name;
    const techCanonical = getCanonicalName(techRaw);
    const techForComparison = normalizeNameForComparison(techRaw);

    const existing = acc.find(item => normalizeNameForComparison(item.technician) === techForComparison);
    if (existing) {
      existing.completed += req.status === 'Completed' ? 1 : 0;
      existing.inProgress += req.status === 'In-Progress' ? 1 : 0;
      existing.pending += req.status === 'Pending' ? 1 : 0;
      existing.unsuccessful += req.status === 'Unsuccessful' ? 1 : 0;

      existing.total += 1;
    } else {
      acc.push({
        technician: techCanonical, // Use canonical name for display
        completed: req.status === 'Completed' ? 1 : 0,
        inProgress: req.status === 'In-Progress' ? 1 : 0,
        pending: req.status === 'Pending' ? 1 : 0,
        unsuccessful: req.status === 'Unsuccessful' ? 1 : 0,
        total: 1,
      });
    }
    return acc;
  }, [] as { technician: string; completed: number; inProgress: number; pending: number; unsuccessful: number; total: number }[]);

  // Revenue per Technician
  const technicianRevenue = requests.reduce((acc, req) => {
    const techRaw = req.technician_name;
    const techCanonical = getCanonicalName(techRaw);
    const techForComparison = normalizeNameForComparison(techRaw);

    const revenue = req.total_cost || 0;

    const existing = acc.find(item => normalizeNameForComparison(item.technician) === techForComparison);
    if (existing) {
      existing.revenue += revenue;
    } else {
      acc.push({ technician: techCanonical, revenue }); // Use canonical name for display
    }
    return acc;
  }, [] as { technician: string; revenue: number }[]).sort((a, b) => b.revenue - a.revenue);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const totalRevenue = requests.reduce((sum, r) => sum + (r.total_cost || 0), 0);

  const latestMonthRevenue = revenueOverTimeSorted.length
    ? revenueOverTimeSorted[revenueOverTimeSorted.length - 1]
    : null;
  const avgServiceTime = requests.length > 0 ? Math.round(requests.reduce((sum, r) => {
    const created = new Date(r.created_at);
    // Use updated_at if status is completed, otherwise use current time for duration calculation
    const end = r.status === 'Completed' ? new Date(r.updated_at) : new Date();
    // Ensure we don't get negative time if dates are weird
    const diff = Math.abs(end.getTime() - created.getTime());
    return sum + diff / (1000 * 60 * 60 * 24);
  }, 0) / requests.length) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header>
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <img src={abelovLogo} alt="Abelov Logo" className="w-10 h-10" />
                <h1 className="text-lg md:text-2xl font-bold text-primary dark:text-black">Analytics Dashboard</h1>
              </div>
              <ThemeToggle />
            </div>
            <Button className='dark:bg-black hidden md:flex' onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button className='dark:bg-black md:hidden' onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div> */}
      {/* <Header title="Analytics Dashboard">
        <ThemeToggle />
        <div className="flex gap-2 w-full mt-2">
          <Button className='dark:bg-black hidden md:flex' onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button className='dark:bg-black md:hidden' onClick={() => navigate('/dashboard')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </Header> */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">₦{formatCurrencyCompact(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-primary">{requests.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Service Time</p>
                <p className="text-2xl font-bold text-primary">{avgServiceTime} days</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-primary">
                  {requests.filter(r => r.status === 'Completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Revenue for {latestMonthRevenue ? latestMonthRevenue.month : 'Current Month'}
                </p>
                <p className="text-2xl font-bold text-primary">
                  ₦{latestMonthRevenue ? formatCurrencyCompact(latestMonthRevenue.revenue) : '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Revenue Over Time */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-primary">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueOverTime}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrencyCompact(Number(value))} />
              <Tooltip formatter={(value) => `₦${formatCurrencyCompact(Number(value))}`} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Revenue Summary */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-primary">Monthly Revenue Summary</h2>
          {revenueOverTimeSorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Month</th>
                    <th className="text-right py-2 px-4 font-medium text-muted-foreground">Revenue (₦)</th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueOverTimeSorted.map((item) => (
                    <tr key={item.month} className="border-b last:border-0">
                      <td className="py-2 pr-4">{item.month}</td>
                      <td className="py-2 px-4 text-right">₦{item.revenue.toLocaleString()}</td>
                      <td className="py-2 pl-4 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">No revenue data available yet.</p>
          )}
        </Card>

{/* Monthly Job Status Summary */}
<Card className="p-6 mb-8">
  <h2 className="text-xl font-bold mb-4 text-primary">Monthly Job Status Summary</h2>
  {revenueOverTimeSorted.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Month</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Completed</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">In-Progress</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Pending</th>
            <th className="text-right py-2 px-4 font-medium text-muted-foreground">Unsuccessful</th>
            <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {revenueOverTimeSorted.map((item) => {
            const monthRequests = requests.filter(
              (r) =>
                new Date(r.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                }) === item.month
            );
            const completed   = monthRequests.filter(r => r.status === 'Completed').length;
            const inProgress  = monthRequests.filter(r => r.status === 'In-Progress').length;
            const pending     = monthRequests.filter(r => r.status === 'Pending').length;
            const unsuccessful = monthRequests.filter(r => r.status === 'Unsuccessful').length;

            return (
              <tr key={item.month} className="border-b last:border-0">
                <td className="py-2 pr-4">{item.month}</td>
                <td className="py-2 px-4 text-right text-green-600 dark:text-green-400">
                  {completed}
                </td>
                <td className="py-2 px-4 text-right text-blue-600 dark:text-blue-400">
                  {inProgress}
                </td>
                <td className="py-2 px-4 text-right text-amber-600 dark:text-amber-400">
                  {pending}
                </td>
                <td className="py-2 px-4 text-right text-red-600 dark:text-red-400">
                  {unsuccessful}
                </td>
                <td className="py-2 pl-4 text-right font-medium">{item.count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-muted-foreground">No job status data available yet.</p>
  )}
</Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Type Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">Device Type Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percent }) => `${device}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Service Status Trends */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">Service Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={statusTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" tick={false} width={5} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" fill="#10b981" name="Completed" stackId="a" />
                <Bar dataKey="In-Progress" fill="#3b82f6" name="In-Progress" stackId="a" />
                <Bar dataKey="Pending" fill="#f59e0b" name="Pending" stackId="a" />
                <Bar dataKey="Unsuccessful" fill="#ef4444" name="Unsuccessful" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Technician Work Histogram */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">Technician Work Distribution</h2>
            {technicianWork.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={technicianWork} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="technician"
                    height={60}
                    interval={0}
                    tickLine={false}
                    tick={<TechnicianTick />}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" stackId="a" />
                  <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" stackId="a" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" stackId="a" />
                  <Bar dataKey="unsuccessful" fill="#9ca3af" name="Unsuccessful" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No technician data available</p>
            )}
          </Card>

          {/* Technician Revenue Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">Revenue per Technician</h2>
            {technicianRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={technicianRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="technician"
                    height={60}
                    interval={0}
                    tickLine={false}
                    tick={<TechnicianTick />}
                  />
                  <YAxis tickFormatter={(value) => formatCurrencyCompact(Number(value))} />
                  <Tooltip formatter={(value) => `₦${formatCurrencyCompact(Number(value))}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (₦)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No revenue data available</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
