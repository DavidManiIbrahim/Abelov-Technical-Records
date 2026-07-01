import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/database";
import { ordersAPI } from "@/lib/api";
import { Plus, Truck, Search, Edit, Loader2, BarChart3, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import OrdersAnalytics from "@/components/OrdersAnalytics";
import AddOrdersModal from "@/components/AddOrdersModal";

export default function OrdersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await ordersAPI.getAll(user.id);
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showAnalytics) {
    return <OrdersAnalytics onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Order
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5" />
                  <h3 className="font-semibold">{order.customer_name}</h3>
                  <Badge variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'shipped' ? 'secondary' :
                    order.status === 'confirmed' ? 'outline' : 'destructive'
                  }>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Total: ₦{order.total_amount.toLocaleString()}</span>
                  <span>Items: {order.items.length}</span>
                  <span>Payment: {order.payment_status}</span>
                  {order.order_date && <span>Date: {new Date(order.order_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(order)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground">Add your first order to get started.</p>
        </div>
      )}

      <AddOrdersModal
        open={showAddModal || !!editingItem}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={loadOrders}
      />
    </div>
  );
}