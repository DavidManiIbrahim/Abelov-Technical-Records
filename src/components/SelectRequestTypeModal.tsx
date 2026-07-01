import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { GraduationCap, Wifi } from 'lucide-react';

interface SelectRequestTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'student' | 'internet') => void;
}

export default function SelectRequestTypeModal({ open, onOpenChange, onSelect }: SelectRequestTypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Request Type</DialogTitle>
          <DialogDescription>Choose the type of record you want to create.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Card
            className="p-5 flex items-center gap-4 cursor-pointer hover:bg-accent hover:border-primary transition-all"
            onClick={() => { onSelect('student'); onOpenChange(false); }}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Student Registration</p>
              <p className="text-sm text-muted-foreground">Register new student</p>
            </div>
          </Card>
          <Card
            className="p-5 flex items-center gap-4 cursor-pointer hover:bg-accent hover:border-primary transition-all"
            onClick={() => { onSelect('internet'); onOpenChange(false); }}
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">Internet User</p>
              <p className="text-sm text-muted-foreground">Track internet usage time</p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}