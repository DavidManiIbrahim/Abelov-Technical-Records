import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { purchasesAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddPurchasesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddPurchasesModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddPurchasesModalProps) {
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSupplier(editItem?.supplier || '');
      setAmount(editItem?.total_amount?.toString() || '');
    }
  }, [open, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { supplier, total_amount: parseFloat(amount), items: [] };
      if (editItem) {
        await purchasesAPI.update(editItem.id, payload);
      } else {
        await purchasesAPI.create(payload as any);
      }
      toast({ title: 'Success', description: editItem ? 'Purchase updated successfully' : 'Purchase added successfully' });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save purchase', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Purchase' : 'Add Purchase'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input id="supplier" placeholder="Enter supplier name" value={supplier} onChange={(e) => setSupplier(e.target.value)} required />
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
