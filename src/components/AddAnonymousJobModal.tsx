import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { serviceRequestAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddAnonymousJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddAnonymousJobModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAnonymousJobModalProps) {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await serviceRequestAPI.create({
        problem_description: description,
        total_cost: parseFloat(price) || 0,
        customer_name: 'Anonymous',
        customer_phone: '',
        customer_address: '',
        device_model: 'Other',
        device_brand: '',
        serial_number: '',
        operating_system: '',
        accessories_received: '',
        shop_name: '',
        technician_name: '',
        request_date: new Date().toISOString(),
        customer_email: '',
        diagnosis_date: '',
        diagnosis_technician: '',
        fault_found: '',
        parts_used: '',
        repair_action: '',
        status: 'Pending',
        service_charge: parseFloat(price) || 0,
        parts_cost: 0,
        deposit_paid: 0,
        balance: parseFloat(price) || 0,
        payment_completed: false,
        payment_status: 'unpaid',
        department: '',
        assigned_to: null,
        assigned_by: null,
        assigned_at: null,
        accepted_at: null,
        delivered_at: null,
        delivered: false,
        technician_notes: '',
        user_id: '',
      });
      toast({ title: 'Success', description: 'Anonymous job created successfully' });
      onOpenChange(false);
      setDescription('');
      setPrice('');
      onSuccess();
    } catch {
      toast({ title: 'Error', description: 'Failed to create job', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Anonymous Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
