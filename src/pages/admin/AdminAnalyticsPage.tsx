import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Users, Ticket, TrendingUp, Activity } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface GlobalStats {
  totalUsers: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
  inProgressTickets: number;
  unsuccessfulTickets: number;
  totalRevenue: number;
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminAPI.getGlobalStats(true);
      setStats(data as GlobalStats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Total Tickets', value: stats.totalTickets, icon: Ticket, color: 'purple' },
    { label: 'Completed', value: stats.completedTickets, icon: TrendingUp, color: 'green', percent: stats.totalTickets > 0 ? Math.round((stats.completedTickets / stats.totalTickets) * 100) : 0 },
    { label: 'Pending', value: stats.pendingTickets, icon: Activity, color: 'yellow' },
    { label: 'In Progress', value: stats.inProgressTickets, icon: Loader2, color: 'cyan' },
    { label: 'Unsuccessful', value: stats.unsuccessfulTickets, icon: Activity, color: 'red' },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: { bg: 'from-blue-50 to-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
    purple: { bg: 'from-purple-50 to-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
    green: { bg: 'from-green-50 to-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    yellow: { bg: 'from-yellow-50 to-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
    cyan: { bg: 'from-blue-50 to-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-600' },
    red: { bg: 'from-red-50 to-orange-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const c = colorClasses[card.color];
          const Icon = card.icon;
          return (
            <Card key={card.label} className={`p-6 bg-gradient-to-br ${c.bg} ${c.border}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <p className={`text-3xl font-bold ${c.text}`}>{card.value}</p>
                {card.percent !== undefined && (
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-500">Completion rate</p>
                    <span className={`text-xs font-semibold ${c.text}`}>{card.percent}%</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-4xl font-bold text-emerald-700 mt-2">₦{(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-600" />
        </div>
      </Card>
    </div>
  );
}
