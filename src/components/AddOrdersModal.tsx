import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ordersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddOrdersModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddOrdersModalProps) {
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomer(editItem?.customer_name || '');
      setAmount(editItem?.total_amount?.toString() || '');
    }
  }, [open, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { customer_name: customer, total_amount: parseFloat(amount), items: [] };
      if (editItem) {
        await ordersAPI.update(editItem.id, payload);
      } else {
        await ordersAPI.create(payload as any);
      }
      toast({ title: 'Success', description: editItem ? 'Order updated successfully' : 'Order added successfully' });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save order', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Order' : 'Add Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer Name</Label>
            <Input id="customer" placeholder="Enter customer name" value={customer} onChange={(e) => setCustomer(e.target.value)} required />
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
