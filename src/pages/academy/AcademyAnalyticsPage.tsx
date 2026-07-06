import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { academyAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AcademyCourse } from '@/types/database';
import { BookOpen, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  draft: '#f59e0b',
  archived: '#6b7280',
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

export default function AcademyAnalyticsPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await academyAPI.getAll(user.id);
      setCourses(data || []);
    } catch (error) {
      console.error('Failed to load academy analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishedCourses = courses.filter((c) => c.status === 'published').length;
  const draftCourses = courses.filter((c) => c.status === 'draft').length;
  const archivedCourses = courses.filter((c) => c.status === 'archived').length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  const statusDistribution = [
    { name: 'Published', value: publishedCourses },
    { name: 'Draft', value: draftCourses },
    { name: 'Archived', value: archivedCourses },
  ].filter((d) => d.value > 0);

  const categoryDistribution = (() => {
    const counts: Record<string, number> = {};
    courses.forEach((c) => {
      const cat = c.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  })();

  const levelDistribution = (() => {
    const counts: Record<string, number> = {};
    courses.forEach((c) => {
      const level = c.level || 'Not specified';
      counts[level] = (counts[level] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));
  })();

  const coursesOverTime = (() => {
    const monthly: Record<string, number> = {};
    courses.forEach((c) => {
      if (!c.created_at) return;
      const month = c.created_at.slice(0, 7);
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
        <Skeleton className="h-9 w-56" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-16" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-40 mb-4" />
              <Skeleton className="h-[300px] w-full rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Academy Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed insights into courses and programs.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Courses" value={courses.length} icon={BookOpen} color="purple" />
        <StatCard label="Published" value={publishedCourses} icon={BookOpen} color="green" subtitle={courses.length > 0 ? `${Math.round((publishedCourses / courses.length) * 100)}% of total` : undefined} />
        <StatCard label="Drafts" value={draftCourses} icon={BookOpen} color="yellow" />
        <StatCard label="Archived" value={archivedCourses} icon={BookOpen} color="gray" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Revenue (Course Prices)" value={`₦${formatCurrencyCompact(totalRevenue)}`} icon={DollarSign} color="emerald" subtitle={`from ${courses.length} courses`} />
        <StatCard label="Avg Price per Course" value={courses.length > 0 ? `₦${formatCurrencyCompact(Math.round(totalRevenue / courses.length))}` : '₦0'} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Course Status Distribution</h3>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No course data available</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Courses Created Over Time</h3>
          {coursesOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No course data available</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Courses by Category</h3>
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No category data available</p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Courses by Level</h3>
          {levelDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={levelDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {levelDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No level data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}
