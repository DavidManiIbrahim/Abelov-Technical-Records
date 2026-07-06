import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { attendanceAPI } from '@/lib/api';
import { Attendance } from '@/types/database';
import { Clock, Clock9, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

export default function MyAttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find(r => r.date === today);
  const isClockedIn = !!todayRecord;
  const isClockedOut = !!todayRecord?.clock_out;

  const loadRecords = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const result = await attendanceAPI.getMyAttendance(startOfMonth.toISOString().slice(0, 10));
      setRecords(result.data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load attendance', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await attendanceAPI.clockIn();
      toast({ title: 'Success', description: 'Clocked in successfully' });
      loadRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock in', variant: 'destructive' });
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await attendanceAPI.clockOut();
      toast({ title: 'Success', description: 'Clocked out successfully' });
      loadRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock out', variant: 'destructive' });
    } finally {
      setClocking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-blue-100 text-blue-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Attendance</h1>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            {isClockedIn && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Clock In: {todayRecord?.clock_in ? new Date(todayRecord.clock_in).toLocaleTimeString() : '-'}</p>
                {isClockedOut && <p className="text-sm text-muted-foreground">Clock Out: {todayRecord?.clock_out ? new Date(todayRecord.clock_out).toLocaleTimeString() : '-'}</p>}
                {todayRecord && (
                  <Badge className={getStatusBadge(todayRecord.status)}>{todayRecord.status}</Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!isClockedIn && (
              <Button onClick={handleClockIn} disabled={clocking} size="lg">
                {clocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock9 className="w-4 h-4 mr-2" />}
                Clock In
              </Button>
            )}
            {isClockedIn && !isClockedOut && (
              <Button onClick={handleClockOut} disabled={clocking} variant="outline" size="lg">
                {clocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                Clock Out
              </Button>
            )}
            {isClockedOut && (
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">Done for today</Badge>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">This Month's Records</h2>
        {loading ? (
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3"><Skeleton className="h-4 w-full" /></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t p-3 flex gap-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : records.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No attendance records this month.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-xs font-semibold">Date</th>
                  <th className="text-left p-3 text-xs font-semibold">Clock In</th>
                  <th className="text-left p-3 text-xs font-semibold">Clock Out</th>
                  <th className="text-left p-3 text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/50">
                    <td className="p-3 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : '-'}</td>
                    <td className="p-3 text-sm">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '-'}</td>
                    <td className="p-3"><Badge className={getStatusBadge(r.status)}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
