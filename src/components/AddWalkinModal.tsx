import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { serviceRequestAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AddWalkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddWalkinModal({
  open,
  onOpenChange,
  onSuccess,
}: AddWalkinModalProps) {
  const [amount, setAmount] = useState('');
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await serviceRequestAPI.create({
        problem_description: problem,
        total_cost: parseFloat(amount) || 0,
        customer_name: 'Walk-in Customer',
        customer_phone: '',
        customer_address: '',
        device_model: 'Laptop',
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
        service_charge: parseFloat(amount) || 0,
        parts_cost: 0,
        deposit_paid: 0,
        balance: parseFloat(amount) || 0,
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
      toast({ title: 'Success', description: 'Walk-in job created successfully' });
      onOpenChange(false);
      setAmount('');
      setProblem('');
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
          <DialogTitle>Walk-in Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="problem">Problem of Laptop</Label>
            <Textarea
              id="problem"
              placeholder="Describe the issue..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
