import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { academyAPI } from '@/lib/api';

interface AddAcademyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddAcademyModal({
  open,
  onOpenChange,
  editItem,
  onSuccess,
}: AddAcademyModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement)?.value || null,
      instructor: (form.elements.namedItem('instructor') as HTMLInputElement).value,
      status: (form.elements.namedItem('status') as HTMLSelectElement)?.value || 'draft',
    };

    try {
      if (editItem) {
        await academyAPI.update(editItem.id, data);
      } else {
        await academyAPI.create(data as any);
      }
      toast({
        title: 'Success',
        description: editItem ? 'Course updated successfully' : 'Course added successfully',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save course',
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
          <DialogTitle>{editItem ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" placeholder="Enter course title" defaultValue={editItem?.title || ''} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter course description" defaultValue={editItem?.description || ''} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={editItem?.category || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Repair">Repair</SelectItem>
                <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="instructor">Instructor</Label>
            <Input id="instructor" placeholder="Enter instructor name" defaultValue={editItem?.instructor || ''} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={editItem?.status || 'draft'}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
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
