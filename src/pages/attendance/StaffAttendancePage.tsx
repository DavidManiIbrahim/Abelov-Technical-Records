import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { attendanceAPI } from '@/lib/api';
import { Loader2, Search, LogIn, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StaffRecord {
  id: string | null;
  user_id: string;
  user_email: string;
  user_name: string;
  user_roles: string[];
  user_department: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  notes: string;
}

export default function StaffAttendancePage() {
  const [records, setRecords] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [searchDate, setSearchDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState('all');
  const isPastDate = searchDate < todayStr;

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await attendanceAPI.getAllAttendance(searchDate, searchDate);
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

  const handleSearch = () => {
    loadRecords();
  };

  const handleClockIn = async (record: StaffRecord) => {
    try {
      const now = new Date().toISOString();
      const hour = new Date().getHours();
      const status = hour >= 9 ? 'late' : 'present';

      if (record.id) {
        await attendanceAPI.updateAttendance(record.id, { status, clock_in: now });
      } else {
        await attendanceAPI.markAttendance(record.user_id, searchDate, status, now);
      }
      toast({ title: 'Success', description: `${record.user_name} clocked in as ${status}` });
      loadRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock in', variant: 'destructive' });
    }
  };

  const handleClockOut = async (record: StaffRecord) => {
    try {
      const now = new Date().toISOString();
      if (record.id) {
        await attendanceAPI.updateAttendance(record.id, { clock_out: now });
      } else {
        await attendanceAPI.markAttendance(record.user_id, searchDate, 'present', undefined, now);
      }
      toast({ title: 'Success', description: `${record.user_name} clocked out` });
      loadRecords();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to clock out', variant: 'destructive' });
    }
  };

  const filteredRecords = records.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      late: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
      half_day: 'bg-blue-100 text-blue-800',
    };
    return status ? variants[status] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Attendance</h1>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Date</label>
            <Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-1 block">Filter</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Load
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filteredRecords.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No staff found for this date.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-xs font-semibold">Staff</th>
                  <th className="text-left p-3 text-xs font-semibold">Department</th>
                  <th className="text-left p-3 text-xs font-semibold">Role</th>
                  <th className="text-left p-3 text-xs font-semibold">Clock In</th>
                  <th className="text-left p-3 text-xs font-semibold">Clock Out</th>
                  <th className="text-left p-3 text-xs font-semibold">Status</th>
                  <th className="text-left p-3 text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.user_id} className="border-t hover:bg-muted/50">
                    <td className="p-3 text-sm font-medium">{r.user_name || r.user_email}</td>
                    <td className="p-3 text-sm capitalize">{r.user_department || '-'}</td>
                    <td className="p-3 text-sm">{(r.user_roles || []).join(', ')}</td>
                    <td className="p-3 text-sm">{r.clock_in ? new Date(r.clock_in).toLocaleTimeString() : '-'}</td>
                    <td className="p-3 text-sm">{r.clock_out ? new Date(r.clock_out).toLocaleTimeString() : '-'}</td>
                    <td className="p-3">
                      {r.status ? (
                        <Badge className={getStatusBadge(r.status)}>{r.status}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not marked</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        {!r.clock_in ? (
                          <Button onClick={() => handleClockIn(r)} size="sm" variant="default" className="h-8 text-xs" disabled={isPastDate} title={isPastDate ? 'Cannot edit past attendance' : ''}>
                            <LogIn className="w-3 h-3 mr-1" />
                            Clock In
                          </Button>
                        ) : null}
                        {r.clock_in && !r.clock_out ? (
                          <Button onClick={() => handleClockOut(r)} size="sm" variant="outline" className="h-8 text-xs" disabled={isPastDate} title={isPastDate ? 'Cannot edit past attendance' : ''}>
                            <LogOut className="w-3 h-3 mr-1" />
                            Clock Out
                          </Button>
                        ) : null}
                        {r.clock_in && r.clock_out ? (
                          <span className="text-xs text-muted-foreground italic">Complete</span>
                        ) : null}
                        {!r.clock_in && !r.clock_out && isPastDate ? (
                          <span className="text-xs text-muted-foreground italic">Read only</span>
                        ) : null}
                      </div>
                    </td>
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
