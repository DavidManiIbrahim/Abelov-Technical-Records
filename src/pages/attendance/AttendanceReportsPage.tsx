import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Users, Clock, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'];

const formatCurrencyCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
};

export default function AttendanceReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getAttendanceStats();
      setStats(data);

      const today = new Date().toISOString().slice(0, 10);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const monthStart = startOfMonth.toISOString().slice(0, 10);

      const [recordsRes] = await Promise.all([
        attendanceAPI.getAllAttendance(today, today),
      ]);
      setAllRecords(recordsRes.data || []);

      const dailyData: any[] = [];
      const current = new Date(monthStart);
      const end = new Date(today);
      while (current <= end) {
        const dateStr = current.toISOString().slice(0, 10);
        const dayRecords = await attendanceAPI.getAllAttendance(dateStr, dateStr);
        const recs = dayRecords.data || [];
        const present = recs.filter((r: any) => r.status === 'present').length;
        const late = recs.filter((r: any) => r.status === 'late').length;
        const absent = recs.filter((r: any) => r.status === 'absent').length;
        dailyData.push({
          date: dateStr.slice(5),
          present,
          late,
          absent,
          total: recs.length,
        });
        current.setDate(current.getDate() + 1);
      }
      setDailyTrend(dailyData);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load stats', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      if (fromDate && toDate) {
        const recordsRes = await attendanceAPI.getAllAttendance(fromDate, toDate);
        setAllRecords(recordsRes.data || []);

        const dailyData: any[] = [];
        const current = new Date(fromDate);
        const end = new Date(toDate);
        while (current <= end) {
          const dateStr = current.toISOString().slice(0, 10);
          const dayRecords = await attendanceAPI.getAllAttendance(dateStr, dateStr);
          const recs = dayRecords.data || [];
          const present = recs.filter((r: any) => r.status === 'present').length;
          const late = recs.filter((r: any) => r.status === 'late').length;
          const absent = recs.filter((r: any) => r.status === 'absent').length;
          dailyData.push({
            date: dateStr.slice(5),
            present,
            late,
            absent,
            total: recs.length,
          });
          current.setDate(current.getDate() + 1);
        }
        setDailyTrend(dailyData);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to filter', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const todayPresent = allRecords.filter((r: any) => r.status === 'present').length;
  const todayLate = allRecords.filter((r: any) => r.status === 'late').length;
  const todayAbsent = allRecords.filter((r: any) => r.status === 'absent').length;
  const todayHalfDay = allRecords.filter((r: any) => r.status === 'half_day').length;
  const todayTotal = allRecords.length;

  const statusPieData = [
    { name: 'Present', value: todayPresent },
    { name: 'Late', value: todayLate },
    { name: 'Absent', value: todayAbsent },
    { name: 'Half Day', value: todayHalfDay },
  ].filter(d => d.value > 0);

  const colorClasses: Record<string, { bg: string; text: string; icon: string; border: string }> = {
    green: { bg: 'from-green-50 to-green-50', text: 'text-green-700', icon: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'from-yellow-50 to-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600', border: 'border-yellow-200' },
    red: { bg: 'from-red-50 to-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-200' },
    blue: { bg: 'from-blue-50 to-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-200' },
    cyan: { bg: 'from-cyan-50 to-cyan-50', text: 'text-cyan-700', icon: 'text-cyan-600', border: 'border-cyan-200' },
    emerald: { bg: 'from-emerald-50 to-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-200' },
    orange: { bg: 'from-orange-50 to-orange-50', text: 'text-orange-700', icon: 'text-orange-600', border: 'border-orange-200' },
    gray: { bg: 'from-gray-50 to-gray-50', text: 'text-gray-700', icon: 'text-gray-600', border: 'border-gray-200' },
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
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-12" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-4 w-40 mb-4" /><Skeleton className="h-[300px] w-full rounded" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed attendance insights and trends.</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">{stats?.totalUsers || 0} Active Staff</Badge>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium text-muted-foreground">From</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium text-muted-foreground">To</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button onClick={handleFilter} size="sm" className="h-10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard label="Total Today" value={todayTotal} icon={Users} color="blue" subtitle={`out of ${stats?.totalUsers || 0} staff`} />
        <StatCard label="Present" value={todayPresent} icon={Clock} color="green" subtitle={todayTotal > 0 ? `${Math.round((todayPresent / todayTotal) * 100)}%` : undefined} />
        <StatCard label="Late" value={todayLate} icon={Activity} color="yellow" subtitle={todayTotal > 0 ? `${Math.round((todayLate / todayTotal) * 100)}%` : undefined} />
        <StatCard label="Absent" value={todayAbsent} icon={Users} color="red" subtitle={todayTotal > 0 ? `${Math.round((todayAbsent / todayTotal) * 100)}%` : undefined} />
        <StatCard label="This Month" value={stats?.month?.total || 0} icon={TrendingUp} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Status Distribution (Today)</h3>
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[statusPieData.indexOf(entry)]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No attendance data today</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Daily Attendance Trend</h3>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Select a date range to view trend</p>
          )}
        </Card>
      </div>

      {/* Month Overview */}
      {stats?.month && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-semibold">Month Overview</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Card className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.month.total}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.month.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.month.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.month.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
              {stats.month.total > 0 && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
                    <div className="bg-green-500 h-full" style={{ width: `${(stats.month.present / stats.month.total) * 100}%` }} />
                    <div className="bg-yellow-500 h-full" style={{ width: `${(stats.month.late / stats.month.total) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(stats.month.absent / stats.month.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span className="text-green-600">{Math.round((stats.month.present / stats.month.total) * 100)}% Present</span>
                    <span className="text-yellow-600">{Math.round((stats.month.late / stats.month.total) * 100)}% Late</span>
                    <span className="text-red-600">{Math.round((stats.month.absent / stats.month.total) * 100)}% Absent</span>
                  </div>
                </>
              )}
            </Card>
          </div>
        </section>
      )}

      {/* Staff Breakdown */}
      {allRecords.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Staff Status</h2>
          </div>
          <Card className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allRecords.map((rec: any) => (
                <div key={rec.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{rec.user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.user_department || 'No dept'}</p>
                  </div>
                  <Badge variant={rec.status === 'present' ? 'default' : rec.status === 'late' ? 'secondary' : 'destructive'} className="shrink-0 ml-2">
                    {rec.status || 'No record'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
