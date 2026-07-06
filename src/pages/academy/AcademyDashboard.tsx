import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { academyAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, BarChart3 } from 'lucide-react';

export default function AcademyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    archivedCourses: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const courses = await academyAPI.getAll(user?.id || '');
      setStats({
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === 'published').length,
        draftCourses: courses.filter((c) => c.status === 'draft').length,
        archivedCourses: courses.filter((c) => c.status === 'archived').length,
      });
    } catch (error) {
      console.error('Error loading academy stats:', error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-56 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Academy Dashboard</h1>
          <p className="text-muted-foreground">Overview of your academy courses and programs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Courses" value={stats.totalCourses} icon={<BookOpen size={24} />} onClick={() => navigate('/academy')} />
          <StatCard title="Published" value={stats.publishedCourses} icon={<BookOpen size={24} />} onClick={() => navigate('/academy')} />
          <StatCard title="Drafts" value={stats.draftCourses} icon={<BookOpen size={24} />} onClick={() => navigate('/academy')} />
          <StatCard title="Archived" value={stats.archivedCourses} icon={<BookOpen size={24} />} onClick={() => navigate('/academy')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Course Status Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Published</span>
                <span className="font-semibold text-green-600">{stats.publishedCourses}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.totalCourses ? (stats.publishedCourses / stats.totalCourses) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Draft</span>
                <span className="font-semibold text-yellow-600">{stats.draftCourses}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${stats.totalCourses ? (stats.draftCourses / stats.totalCourses) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Archived</span>
                <span className="font-semibold text-gray-600">{stats.archivedCourses}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${stats.totalCourses ? (stats.archivedCourses / stats.totalCourses) * 100 : 0}%` }} />
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/academy')}>
                <BookOpen size={20} />
                <span className="text-xs">Courses</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/academy/analytics')}>
                <BarChart3 size={20} />
                <span className="text-xs">Analytics</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
