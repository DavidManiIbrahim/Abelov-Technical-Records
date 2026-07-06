import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { goodsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddGoodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddGoodsModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddGoodsModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(editItem?.name || '');
      setSku(editItem?.sku || '');
      setPrice(editItem?.price?.toString() || '');
    }
  }, [open, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, sku, price: parseFloat(price), quantity: 1 };
      if (editItem) {
        await goodsAPI.update(editItem.id, payload);
      } else {
        await goodsAPI.create(payload as any);
      }
      toast({ title: 'Success', description: editItem ? 'Goods updated successfully' : 'Goods added successfully' });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to save goods', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Goods' : 'Add Goods'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" placeholder="Enter product name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="Enter SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" placeholder="Enter price" value={price} onChange={(e) => setPrice(e.target.value)} required />
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
