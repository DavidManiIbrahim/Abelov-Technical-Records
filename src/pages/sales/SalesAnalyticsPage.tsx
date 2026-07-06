import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminAPI, goodsAPI, ordersAPI, purchasesAPI } from '@/lib/api';
import { Package, ShoppingCart, Truck, DollarSign, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [salesStats, setSalesStats] = useState({
    totalGoods: 0,
    totalOrders: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalCredits: 0,
    salesRevenue: 0,
    salesCost: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; cost: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [moduleStats, goods, orders, purchases] = await Promise.all([
        adminAPI.getModuleStats(true),
        goodsAPI.getAll(''),
        ordersAPI.getAll(''),
        purchasesAPI.getAll(''),
      ]);

      setSalesStats(moduleStats.sales);

      const ordersByMonth = orders.reduce((acc, o) => {
        const month = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = acc.find((a) => a.month === month);
        if (existing) {
          existing.revenue += o.total_amount || 0;
        } else {
          acc.push({ month, revenue: o.total_amount || 0, cost: 0 });
        }
        return acc;
      }, [] as { month: string; revenue: number; cost: number }[]);

      const purchasesByMonth = purchases.reduce((acc, p) => {
        const month = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = acc.find((a) => a.month === month);
        if (existing) {
          existing.cost += p.total_amount || 0;
        } else {
          acc.push({ month, revenue: 0, cost: p.total_amount || 0 });
        }
        return acc;
      }, [] as { month: string; revenue: number; cost: number }[]);

      const mergedMap = new Map<string, { month: string; revenue: number; cost: number }>();
      [...ordersByMonth, ...purchasesByMonth].forEach((item) => {
        const existing = mergedMap.get(item.month);
        if (existing) {
          existing.revenue += item.revenue;
          existing.cost += item.cost;
        } else {
          mergedMap.set(item.month, { ...item });
        }
      });

      const merged = Array.from(mergedMap.values()).sort((a, b) => {
        const aDate = new Date(`${a.month} 1`).getTime();
        const bDate = new Date(`${b.month} 1`).getTime();
        return aDate - bDate;
      });

      setMonthlyData(merged);

      setCategoryData([
        { name: 'Goods', value: moduleStats.sales.totalGoods },
        { name: 'Orders', value: moduleStats.sales.totalOrders },
        { name: 'Purchases', value: moduleStats.sales.totalPurchases },
        { name: 'Expenses', value: moduleStats.sales.totalExpenses },
        { name: 'Credits', value: moduleStats.sales.totalCredits },
      ]);
    } catch (error) {
      console.error('Error loading sales analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-56 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Sales Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your sales and inventory performance.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Goods in Stock</p>
              <Package size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{salesStats.totalGoods}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <ShoppingCart size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{salesStats.totalOrders}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <Truck size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{salesStats.totalPurchases}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <DollarSign size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{salesStats.totalExpenses}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Credits</p>
              <CreditCard size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{salesStats.totalCredits}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">₦{salesStats.salesRevenue.toLocaleString()}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">₦{salesStats.salesCost.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue vs Cost Over Time</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data available yet.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribution by Category</h3>
            {categoryData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">No data available yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
