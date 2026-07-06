import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { expensesAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddExpensesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddExpensesModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddExpensesModalProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCategory(editItem?.category || '');
      setAmount(editItem?.amount?.toString() || '');
    }
  }, [open, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { category, amount: parseFloat(amount), description: '' };
      if (editItem) {
        await expensesAPI.update(editItem.id, payload);
      } else {
        await expensesAPI.create(payload as any);
      }
      toast({ title: 'Success', description: editItem ? 'Expense updated successfully' : 'Expense added successfully' });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save expense', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" placeholder="Enter category" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
