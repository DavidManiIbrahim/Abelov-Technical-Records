import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { goodsAPI, ordersAPI, purchasesAPI, expensesAPI, creditsAPI } from '@/lib/api';
import { Package, ShoppingCart, Truck, DollarSign, CreditCard } from 'lucide-react';

export default function SalesDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    goodsCount: 0,
    ordersCount: 0,
    purchasesCount: 0,
    expensesCount: 0,
    creditsCount: 0,
    ordersRevenue: 0,
    purchasesCost: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const userId = user?.id || '';
      const [goods, orders, purchases, expenses, credits] = await Promise.all([
        goodsAPI.getAll(userId),
        ordersAPI.getAll(userId),
        purchasesAPI.getAll(userId),
        expensesAPI.getAll(userId),
        creditsAPI.getAll(userId),
      ]);

      setStats({
        goodsCount: goods.length,
        ordersCount: orders.length,
        purchasesCount: purchases.length,
        expensesCount: expenses.length,
        creditsCount: credits.length,
        ordersRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        purchasesCost: purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0),
      });
    } catch (error) {
      console.error('Error loading sales stats:', error);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Sales Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales and inventory metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard title="Goods in Stock" value={stats.goodsCount} icon={<Package size={24} />} onClick={() => navigate('/goods')} />
          <StatCard title="Orders" value={stats.ordersCount} icon={<ShoppingCart size={24} />} onClick={() => navigate('/orders')} />
          <StatCard title="Purchases" value={stats.purchasesCount} icon={<Truck size={24} />} onClick={() => navigate('/purchases')} />
          <StatCard title="Expenses" value={stats.expensesCount} icon={<DollarSign size={24} />} onClick={() => navigate('/expenses')} />
          <StatCard title="Credits" value={stats.creditsCount} icon={<CreditCard size={24} />} onClick={() => navigate('/credits')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue & Costs</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Total Order Revenue</span>
                <span className="text-xl font-bold text-green-600">₦{stats.ordersRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Total Purchase Cost</span>
                <span className="text-xl font-bold text-red-600">₦{stats.purchasesCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Net Margin</span>
                <span className={`text-xl font-bold ${stats.ordersRevenue - stats.purchasesCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₦{(stats.ordersRevenue - stats.purchasesCost).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/goods')}>
                <Package size={20} />
                <span className="text-xs">Goods</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/orders')}>
                <ShoppingCart size={20} />
                <span className="text-xs">Orders</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/purchases')}>
                <Truck size={20} />
                <span className="text-xs">Purchases</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => navigate('/expenses')}>
                <DollarSign size={20} />
                <span className="text-xs">Expenses</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
