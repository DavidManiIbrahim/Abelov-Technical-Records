import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AddCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddCreditsModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddCreditsModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast({
        title: 'Success',
        description: editItem ? 'Credit updated successfully' : 'Credit added successfully',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save credit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Credit' : 'Add Credit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer">Customer Name</Label>
            <Input id="customer" placeholder="Enter customer name" defaultValue={editItem?.customer_name || ''} />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" placeholder="Enter amount" defaultValue={editItem?.amount || ''} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
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
