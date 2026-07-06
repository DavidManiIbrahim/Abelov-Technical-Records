import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Purchase } from "@/types/database";
import { purchasesAPI } from "@/lib/api";
import { Plus, ShoppingCart, Search, Edit, BarChart3, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import PurchasesAnalytics from "@/components/PurchasesAnalytics";
import AddPurchasesModal from "@/components/AddPurchasesModal";

export default function PurchasesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Purchase | null>(null);

  useEffect(() => {
    loadPurchases();
  }, [user]);

  const loadPurchases = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await purchasesAPI.getAll(user.id);
      setPurchases(data || []);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchases',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const query = searchQuery.toLowerCase();
    return (
      purchase.supplier.toLowerCase().includes(query) ||
      purchase.status.toLowerCase().includes(query)
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
    return <PurchasesAnalytics onBack={() => setShowAnalytics(false)} />;
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
        <h1 className="text-3xl font-bold">Purchases</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="font-semibold">{purchase.supplier}</h3>
                  <Badge variant={
                    purchase.status === 'received' ? 'default' :
                    purchase.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {purchase.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Total: ₦{purchase.total_amount.toLocaleString()}</span>
                  <span>Items: {purchase.items.length}</span>
                  {purchase.purchase_date && <span>Date: {new Date(purchase.purchase_date).toLocaleDateString()}</span>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(purchase)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No purchases found</h3>
          <p className="text-muted-foreground">Add your first purchase to get started.</p>
        </div>
      )}

      <AddPurchasesModal
        open={showAddModal || !!editingItem}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={loadPurchases}
      />
    </div>
  );
}