import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Ticket, TrendingUp, Activity, Package, ShoppingCart, Truck, DollarSign, CreditCard, BookOpen, CheckCircle, Wrench } from 'lucide-react';
import { adminAPI } from '@/lib/api';

interface ModuleStats {
  repairs: { totalTickets: number; pendingTickets: number; inProgressTickets: number; completedTickets: number; unsuccessfulTickets: number; totalRevenue: number };
  sales: { totalGoods: number; totalOrders: number; totalPurchases: number; totalExpenses: number; totalCredits: number; salesRevenue: number; salesCost: number };
  academy: { totalCourses: number; publishedCourses: number };
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (forceRefresh = false) => {
    try {
      const data = await adminAPI.getModuleStats(forceRefresh);
      setStats(data as ModuleStats);
    } catch (error) {
      console.error('Failed to load module stats:', error);
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
        <button onClick={() => loadStats(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
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
          <StatCard label="Revenue" value={`₦${(stats.repairs.totalRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" />
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
                <p className="text-3xl font-bold text-emerald-700 mt-1">₦{(stats.sales.salesRevenue || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Cost</p>
                <p className="text-3xl font-bold text-orange-700 mt-1">₦{(stats.sales.salesCost || 0).toLocaleString()}</p>
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
    </div>
  );
}
