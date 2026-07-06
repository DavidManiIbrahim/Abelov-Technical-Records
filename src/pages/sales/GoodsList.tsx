import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Goods } from "@/types/database";
import { goodsAPI } from "@/lib/api";
import { Plus, Package, Search, Edit, BarChart3, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import GoodsAnalytics from "@/components/GoodsAnalytics";
import AddGoodsModal from "@/components/AddGoodsModal";

export default function GoodsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goods, setGoods] = useState<Goods[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Goods | null>(null);

  useEffect(() => {
    loadGoods();
  }, [user]);

  const loadGoods = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await goodsAPI.getAll(user.id);
      setGoods(data || []);
    } catch (error) {
      console.error('Failed to load goods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load goods',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGoods = goods.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-9 w-56 mb-6" />
        <Skeleton className="h-10 w-full mb-6 rounded-lg" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (showAnalytics) {
    return <GoodsAnalytics onBack={() => setShowAnalytics(false)} />;
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
        <h1 className="text-3xl font-bold">Goods Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goods
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredGoods.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5" />
                  <h3 className="font-semibold">{item.name}</h3>
                  <Badge variant={item.is_active ? "default" : "secondary"}>
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="flex gap-4 text-sm">
                  <span>SKU: {item.sku}</span>
                  <span>Price: ₦{item.price.toLocaleString()}</span>
                  <span>Quantity: {item.quantity}</span>
                  {item.category && <span>Category: {item.category}</span>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredGoods.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No goods found</h3>
          <p className="text-muted-foreground">Add your first goods item to get started.</p>
        </div>
      )}

      <AddGoodsModal
        open={showAddModal || !!editingItem}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={loadGoods}
      />
    </div>
  );
}