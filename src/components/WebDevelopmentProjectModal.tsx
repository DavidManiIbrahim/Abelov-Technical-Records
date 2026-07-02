import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WebDevelopmentProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WebDevelopmentProjectModal({ open, onOpenChange }: WebDevelopmentProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [projectCost, setProjectCost] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const balance = Math.max(0, projectCost - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 500));
      toast({ title: 'Success', description: 'Web development project saved' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to save project', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Web Development Project</DialogTitle>
          <DialogDescription>Track web development project details and payments.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input id="clientName" placeholder="Enter client full name" required />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input id="clientPhone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" placeholder="client@example.com" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="company">Company / Organization</Label>
                <Input id="company" placeholder="Enter company name (if applicable)" />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input id="projectTitle" placeholder="e.g. E-commerce Website" required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea id="description" placeholder="Describe the project scope..." rows={3} />
              </div>
              <div>
                <Label htmlFor="projectType">Project Type</Label>
                <Select name="projectType">
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="webapp">Web Application</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="api">API / Backend</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technologies">Technologies</Label>
                <Input id="technologies" placeholder="e.g. React, Node.js, MongoDB" />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="pending">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Billing & Payment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Billing & Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectCost">Project Cost (₦)</Label>
                <Input
                  id="projectCost"
                  type="number"
                  placeholder="0"
                  value={projectCost || ''}
                  onChange={(e) => setProjectCost(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="amountPaid">Amount Paid (₦)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  placeholder="0"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select name="paymentStatus" defaultValue="pending">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Balance Card */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{balance.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Project Cost: ₦{projectCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Paid: ₦{amountPaid.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" placeholder="Any additional notes about the project..." rows={3} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
