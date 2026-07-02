import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { technicianAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function PaymentAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await technicianAPI.getPaymentAnalytics();
      setData(result);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load payment analytics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground text-center py-12">No payment data available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Payment Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">₦{(data.totalRevenue || 0).toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Collected</p>
          <p className="text-3xl font-bold text-green-600">₦{(data.totalCollected || 0).toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Outstanding Balance</p>
          <p className="text-3xl font-bold text-red-600">₦{(data.totalOutstanding || 0).toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Collection Rate</p>
          <p className="text-3xl font-bold text-blue-600">{data.collectionRate || '0.0'}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Status Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-semibold">Paid</p>
                <p className="text-sm text-muted-foreground">{data.paid || 0} requests</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {data.totalRequests > 0 ? ((data.paid / data.totalRequests) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-semibold">Partial</p>
                <p className="text-sm text-muted-foreground">{data.partial || 0} requests</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {data.totalRequests > 0 ? ((data.partial / data.totalRequests) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-semibold">Unpaid</p>
                <p className="text-sm text-muted-foreground">{data.unpaid || 0} requests</p>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {data.totalRequests > 0 ? ((data.unpaid / data.totalRequests) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
              {data.totalRequests > 0 && (
                <>
                  <div className="bg-green-500 h-full" style={{ width: `${(data.paid / data.totalRequests) * 100}%` }} />
                  <div className="bg-yellow-500 h-full" style={{ width: `${(data.partial / data.totalRequests) * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${(data.unpaid / data.totalRequests) * 100}%` }} />
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue by Department</h2>
          <div className="space-y-4">
            {(data.byDepartment || []).map((dept: any) => (
              <div key={dept._id || 'unknown'} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold capitalize">{dept._id || 'Unassigned'}</p>
                  <p className="text-sm text-muted-foreground">{dept.count} requests</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{(dept.revenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Collected: ₦{(dept.collected || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {(!data.byDepartment || data.byDepartment.length === 0) && (
              <p className="text-muted-foreground text-center py-4">No department data</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{data.totalRequests || 0}</p>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.paid || 0}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{data.partial || 0}</p>
            <p className="text-xs text-muted-foreground">Partial</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{data.unpaid || 0}</p>
            <p className="text-xs text-muted-foreground">Unpaid</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
