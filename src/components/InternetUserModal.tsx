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

interface InternetUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InternetUserModal({ open, onOpenChange }: InternetUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [ratePerHour, setRatePerHour] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [loginTime, setLoginTime] = useState<string>('');
  const [logoutTime, setLogoutTime] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calcDuration = (): string => {
    if (!loginTime || !logoutTime) return '0 hrs';
    const diff = new Date(logoutTime).getTime() - new Date(loginTime).getTime();
    if (diff <= 0) return '0 hrs';
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const calcHours = (): number => {
    if (!loginTime || !logoutTime) return 0;
    const diff = new Date(logoutTime).getTime() - new Date(loginTime).getTime();
    return Math.max(0, diff / 3600000);
  };

  const totalCharge = Math.round(calcHours() * ratePerHour);
  const balance = Math.max(0, totalCharge - amountPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 500));
      toast({ title: 'Success', description: 'Internet usage record saved' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to save record', variant: 'destructive' });
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
          <DialogTitle>Internet User</DialogTitle>
          <DialogDescription>Track internet usage time and manage payments.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" placeholder="Enter user full name" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@example.com" />
              </div>
              <div>
                <Label htmlFor="idType">ID Type</Label>
                <Select name="idType">
                  <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers">Driver's License</SelectItem>
                    <SelectItem value="voter">Voter's Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" placeholder="Enter ID number" />
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Session Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loginTime">Login Time</Label>
                <Input
                  id="loginTime"
                  type="datetime-local"
                  value={loginTime}
                  onChange={(e) => setLoginTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="logoutTime">Logout Time</Label>
                <Input
                  id="logoutTime"
                  type="datetime-local"
                  value={logoutTime}
                  onChange={(e) => setLogoutTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={calcDuration()} readOnly className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="deviceType">Device Type</Label>
                <Select name="deviceType">
                  <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="deviceName">Device Name (Optional)</Label>
                <Input id="deviceName" placeholder="e.g. Dell XPS 15, System Unit #3" />
              </div>
            </div>
          </div>

          {/* Billing & Payment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Billing & Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate">Rate per Hour (₦)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="0"
                  value={ratePerHour || ''}
                  onChange={(e) => setRatePerHour(Number(e.target.value) || 0)}
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
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{balance.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Charge: ₦{totalCharge.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Paid: ₦{amountPaid.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes & Upload */}
          <div className="space-y-4">
            <div className="md:col-span-2">
              <Label htmlFor="purpose">Purpose / Notes</Label>
              <Textarea id="purpose" placeholder="Purpose of internet usage..." rows={3} />
            </div>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{file ? file.name : 'Attach receipt or document (optional)'}</p>
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
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}