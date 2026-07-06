import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/types/database";
import { expensesAPI } from "@/lib/api";
import { Plus, DollarSign, Search, Edit, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ExpensesAnalytics from "@/components/ExpensesAnalytics";
import AddExpensesModal from "@/components/AddExpensesModal";

export default function ExpensesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await expensesAPI.getAll(user.id);
      setExpenses(data || []);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const query = searchQuery.toLowerCase();
    return (
      expense.category.toLowerCase().includes(query) ||
      expense.description.toLowerCase().includes(query) ||
      expense.vendor?.toLowerCase().includes(query)
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
    return <ExpensesAnalytics onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5" />
                  <h3 className="font-semibold">{expense.category}</h3>
                  <Badge variant="outline">{expense.description}</Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>Amount: ₦{expense.amount.toLocaleString()}</span>
                  {expense.vendor && <span>Vendor: {expense.vendor}</span>}
                  {expense.date && <span>Date: {new Date(expense.date).toLocaleDateString()}</span>}
                  {expense.is_recurring && <Badge variant="secondary">Recurring</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingItem(expense)}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
          <p className="text-muted-foreground">Add your first expense to get started.</p>
        </div>
      )}

      <AddExpensesModal
        open={showAddModal || !!editingItem}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
        onSuccess={loadExpenses}
      />
    </div>
  );
}