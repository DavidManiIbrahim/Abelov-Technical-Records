import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { academyAPI } from '@/lib/api';

interface AddAcademyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any | null;
  onSuccess: () => void;
}

export default function AddAcademyModal({ open, onOpenChange, editItem, onSuccess }: AddAcademyModalProps) {
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
      duration: (form.elements.namedItem('duration') as HTMLInputElement).value,
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value) || 0,
      level: (form.elements.namedItem('level') as HTMLSelectElement)?.value || '',
      syllabus: (form.elements.namedItem('syllabus') as HTMLTextAreaElement).value,
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
    } catch {
      toast({ title: 'Error', description: 'Failed to save course', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogDescription>
            Fill in the course details below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Course Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input id="title" placeholder="Enter course title" defaultValue={editItem?.title || ''} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter course description" defaultValue={editItem?.description || ''} rows={3} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editItem?.category || ''}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
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
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g. 4 weeks" defaultValue={editItem?.duration || ''} />
              </div>
              <div>
                <Label htmlFor="price">Price (₦)</Label>
                <Input id="price" type="number" placeholder="0" defaultValue={editItem?.price || ''} />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select name="level" defaultValue={editItem?.level || ''}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editItem?.status || 'draft'}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Syllabus */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Syllabus & Curriculum</h3>
            <div>
              <Label htmlFor="syllabus">Course Syllabus</Label>
              <Textarea
                id="syllabus"
                placeholder="Enter course syllabus, topics, or learning objectives..."
                defaultValue={editItem?.syllabus || ''}
                rows={6}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : (editItem ? 'Update Course' : 'Add Course')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}