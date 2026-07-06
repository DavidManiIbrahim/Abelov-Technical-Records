import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceAPI } from '@/lib/api';
import { Clock, Users, BarChart3 } from 'lucide-react';

export default function AttendanceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayPresent: 0,
    todayLate: 0,
    todayAbsent: 0,
    todayHalfDay: 0,
    totalToday: 0,
  });
  const [clockedIn, setClockedIn] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const allAttendance = await attendanceAPI.getAllAttendance(today, today);
      const records = allAttendance.data || [];

      setStats({
        todayPresent: records.filter((r: any) => r.status === 'present').length,
        todayLate: records.filter((r: any) => r.status === 'late').length,
        todayAbsent: records.filter((r: any) => r.status === 'absent').length,
        todayHalfDay: records.filter((r: any) => r.status === 'half_day').length,
        totalToday: records.length,
      });

      const myRecord = records.find((r: any) => r.user_id === user?.id);
      setClockedIn(!!myRecord?.clock_in && !myRecord?.clock_out);
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      await attendanceAPI.clockIn();
      loadStats();
    } catch (error) {
      console.error('Error clocking in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await attendanceAPI.clockOut();
      loadStats();
    } catch (error) {
      console.error('Error clocking out:', error);
    }
  };

  const StatCard = ({ title, value, icon, onClick }: { title: string; value: string | number; icon: React.ReactNode; onClick?: () => void }) => (
    <Card className={`p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Attendance Dashboard</h1>
          <p className="text-muted-foreground">Today's attendance overview and quick actions.</p>
        </div>

        <div className="flex gap-3 mb-8">
          {clockedIn ? (
            <Button onClick={handleClockOut} variant="destructive" size="lg">
              <Clock className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          ) : (
            <Button onClick={handleClockIn} size="lg">
              <Clock className="w-4 h-4 mr-2" />
              Clock In
            </Button>
          )}
          <Button onClick={() => navigate('/attendance/manage')} variant="outline" size="lg">
            <Users className="w-4 h-4 mr-2" />
            Manage Attendance
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Today - Present" value={stats.todayPresent} icon={<Users size={24} />} />
          <StatCard title="Today - Late" value={stats.todayLate} icon={<Clock size={24} />} />
          <StatCard title="Today - Absent" value={stats.todayAbsent} icon={<Users size={24} />} />
          <StatCard title="Today - Half Day" value={stats.todayHalfDay} icon={<Clock size={24} />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Records Today</span>
                <span className="font-bold text-xl">{stats.totalToday}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 flex overflow-hidden">
                <div className="bg-green-600 h-3" style={{ width: `${stats.totalToday ? (stats.todayPresent / stats.totalToday) * 100 : 0}%` }} title="Present" />
                <div className="bg-yellow-500 h-3" style={{ width: `${stats.totalToday ? (stats.todayLate / stats.totalToday) * 100 : 0}%` }} title="Late" />
                <div className="bg-red-600 h-3" style={{ width: `${stats.totalToday ? (stats.todayAbsent / stats.totalToday) * 100 : 0}%` }} title="Absent" />
                <div className="bg-gray-400 h-3" style={{ width: `${stats.totalToday ? (stats.todayHalfDay / stats.totalToday) * 100 : 0}%` }} title="Half Day" />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Present ({stats.todayPresent})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Late ({stats.todayLate})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Absent ({stats.todayAbsent})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Half Day ({stats.todayHalfDay})</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/attendance/manage')}>
                <Users size={20} />
                <span className="text-xs">Manage</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/attendance/reports')}>
                <BarChart3 size={20} />
                <span className="text-xs">Reports</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
