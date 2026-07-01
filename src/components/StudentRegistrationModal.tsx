import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentRegistrationModal({ open, onOpenChange }: StudentRegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [courseFee, setCourseFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const balance = Math.max(0, courseFee - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 500));
      toast({ title: 'Success', description: 'Student registered successfully' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to register student', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Registration</DialogTitle>
          <DialogDescription>Fill in the details to register a new student.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input id="studentName" placeholder="Enter student full name" required />
              </div>
              <div>
                <Label htmlFor="course">Course / Program</Label>
                <Input id="course" placeholder="e.g. Web Development" />
              </div>
              <div>
                <Label htmlFor="regDate">Registration Date</Label>
                <Input id="regDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <Label htmlFor="duration">Duration / Level</Label>
                <Input id="duration" placeholder="e.g. 12 weeks / Beginner" />
              </div>
              <div>
                <Label htmlFor="studentId">Student ID (Optional)</Label>
                <Input id="studentId" placeholder="Auto-generated if left blank" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes / Comments</Label>
                <Textarea id="notes" placeholder="Additional notes about the student..." rows={3} />
              </div>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseFee">Course Fee (₦)</Label>
                <Input
                  id="courseFee"
                  type="number"
                  placeholder="0"
                  value={courseFee || ''}
                  onChange={(e) => setCourseFee(Number(e.target.value) || 0)}
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
                <Label>Status</Label>
                <Select name="paymentStatus" defaultValue="pending">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Balance Card */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{balance.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Course Fee: ₦{courseFee.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Paid: ₦{amountPaid.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Document Upload</h3>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{file ? file.name : 'Click to upload photo or ID document'}</p>
              <p className="text-xs text-muted-foreground mt-1">Optional — PNG, JPG, PDF (Max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Registration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}