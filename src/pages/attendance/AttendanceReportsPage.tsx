import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { attendanceAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function AttendanceReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getAttendanceStats();
      setStats(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load stats', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, present, late, absent, total }: { title: string; present: number; late: number; absent: number; total: number }) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{present}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{late}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{absent}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
      </div>
      <div className="mt-4">
        {total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${(present / total) * 100}%` }} />
            <div className="bg-yellow-500 h-full" style={{ width: `${(late / total) * 100}%` }} />
            <div className="bg-red-500 h-full" style={{ width: `${(absent / total) * 100}%` }} />
          </div>
        )}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className="text-green-600">{total > 0 ? ((present / total) * 100).toFixed(0) : 0}% Present</span>
          <span className="text-yellow-600">{total > 0 ? ((late / total) * 100).toFixed(0) : 0}% Late</span>
          <span className="text-red-600">{total > 0 ? ((absent / total) * 100).toFixed(0) : 0}% Absent</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-xl border">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full mt-4" />
          </div>
          <div className="p-6 rounded-xl border">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Reports</h1>
        <Badge variant="outline" className="text-sm">{stats?.totalUsers || 0} Active Staff</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {stats?.today && (
          <StatCard
            title="Today"
            present={stats.today.present}
            late={stats.today.late}
            absent={stats.today.absent}
            total={stats.today.total}
          />
        )}
        {stats?.month && (
          <StatCard
            title="This Month"
            present={stats.month.present}
            late={stats.month.late}
            absent={stats.month.absent}
            total={stats.month.total}
          />
        )}
      </div>
    </div>
  );
}
