import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Credit } from "@/types/database";
import { creditsAPI } from "@/lib/api";
import {
  Plus,
  CreditCard,
  Search,
  Edit,
  Loader2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import CreditsAnalytics from "@/components/CreditsAnalytics";
import AddCreditsModal from "@/components/AddCreditsModal";

export default function CreditsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Credit | null>(null);

  useEffect(() => {
    loadCredits();
  }, [user]);

  const loadCredits = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await creditsAPI.getAll(user.id);
      setCredits(data || []);
    } catch (error) {
      console.error("Failed to load credits:", error);
      toast({
        title: "Error",
        description: "Failed to load credits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCredits = credits.filter((credit) => {
    const query = searchQuery.toLowerCase();
    return (
      credit.customer_name.toLowerCase().includes(query) ||
      credit.status.toLowerCase().includes(query)
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
    return <CreditsAnalytics onBack={() => setShowAnalytics(false)} />;
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
        <h1 className="text-3xl font-bold">Credits</h1>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credit
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCredits.map((credit) => (
          <Card key={credit.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5" />
                  <h3 className="font-semibold">{credit.customer_name}</h3>
                  <Badge
                    variant={
                      credit.status === "active"
                        ? "default"
                        : credit.status === "used"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {credit.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Amount: ₦{credit.amount.toLocaleString()}</span>
                  <span>Used: ₦{credit.used_amount.toLocaleString()}</span>
                  <span>
                    Remaining: ₦
                    {(credit.amount - credit.used_amount).toLocaleString()}
                  </span>
                  {credit.issued_date && (
                    <span>
                      Issued:{" "}
                      {new Date(credit.issued_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(credit)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No credits found</h3>
          <p className="text-muted-foreground">
            Add your first credit to get started.
          </p>
        </div>
      )}

      <AddCreditsModal
        open={showAddModal || !!editingItem}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={loadCredits}
      />
    </div>
  );
}