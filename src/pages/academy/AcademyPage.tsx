import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, BookOpen, Search, Edit, Trash2, Eye, DollarSign, User, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { academyAPI } from '@/lib/api';
import { AcademyCourse } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import AddAcademyModal from '@/components/AddAcademyModal';
import SelectRequestTypeModal from '@/components/SelectRequestTypeModal';
import StudentRegistrationModal from '@/components/StudentRegistrationModal';
import InternetUserModal from '@/components/InternetUserModal';
import WebDevelopmentProjectModal from '@/components/WebDevelopmentProjectModal';

export default function AcademyPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademyCourse | null>(null);
  const [viewingItem, setViewingItem] = useState<AcademyCourse | null>(null);
  const [showSelectType, setShowSelectType] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showInternetModal, setShowInternetModal] = useState(false);
  const [showWebDevModal, setShowWebDevModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await academyAPI.getAll(user.id);
      setCourses(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await academyAPI.delete(id);
      toast({ title: 'Success', description: 'Course deleted' });
      loadCourses();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete course', variant: 'destructive' });
    }
  };

  const handleAddClick = () => setShowSelectType(true);

  const handleSelectType = (type: 'student' | 'internet' | 'webdev') => {
    if (type === 'student') setShowStudentModal(true);
    else if (type === 'internet') setShowInternetModal(true);
    else setShowWebDevModal(true);
  };

  const filtered = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPublished = courses.filter((c) => c.status === 'published').length;
  const totalRevenue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header / Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Abelov IT Academy</h1>
            <p className="text-muted-foreground mt-1">Manage your course catalog — track, add, and update courses.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{courses.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{totalPublished}</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500/30" />
            </div>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, category, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Active</SelectItem>
              <SelectItem value="published">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Request
          </Button>
        </div>

        {/* Course Cards */}
        {filtered.length === 0 && searchQuery ? (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter.</p>
            <Button onClick={() => setSearchQuery('')} variant="outline">Clear Search</Button>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first course to the catalog.</p>
            <Button onClick={handleAddClick}>
              <Plus className="w-4 h-4 mr-2" /> Add Request
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((course) => (
              <Card key={course.id} className="p-5 hover:shadow-lg transition-shadow">
                {/* Top Row: ID + Status */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono text-muted-foreground">ID: {course.id.slice(0, 8)}</p>
                  <Badge className={getStatusBadge(course.status)}>
                    {course.status === 'published' ? 'Completed' : course.status === 'draft' ? 'Active' : course.status}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base mb-3">{course.title}</h3>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{course.instructor || 'No instructor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(course.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-bold text-primary">₦{(course.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance</span>
                    <span className="font-bold text-green-600">₦{(course.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingItem(course)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingItem(course)}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AddAcademyModal
          open={showAddModal || !!editingItem}
          onOpenChange={(open) => {
            setShowAddModal(open);
            if (!open) setEditingItem(null);
          }}
          editItem={editingItem}
          onSuccess={loadCourses}
        />

        {/* View Detail Modal */}
        <Dialog open={!!viewingItem} onOpenChange={(open) => { if (!open) setViewingItem(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewingItem?.title}</DialogTitle>
            </DialogHeader>
            {viewingItem && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusBadge(viewingItem.status)}>
                    {viewingItem.status === 'published' ? 'Completed' : viewingItem.status === 'draft' ? 'Active' : viewingItem.status}
                  </Badge>
                  {viewingItem.category && <Badge variant="outline">{viewingItem.category}</Badge>}
                  {viewingItem.level && <Badge variant="outline">{viewingItem.level}</Badge>}
                </div>

                {viewingItem.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{viewingItem.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {viewingItem.instructor && (
                    <div>
                      <p className="text-muted-foreground">Instructor</p>
                      <p className="font-medium">{viewingItem.instructor}</p>
                    </div>
                  )}
                  {viewingItem.duration && (
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{viewingItem.duration}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">₦{(viewingItem.price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(viewingItem.created_at)}</p>
                  </div>
                </div>

                {viewingItem.syllabus && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Syllabus</p>
                    <p className="text-sm whitespace-pre-wrap">{viewingItem.syllabus}</p>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-xs font-mono text-muted-foreground">Course ID: {viewingItem.id}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Request Type Selection & Forms */}
        <SelectRequestTypeModal
          open={showSelectType}
          onOpenChange={setShowSelectType}
          onSelect={handleSelectType}
        />
        <StudentRegistrationModal
          open={showStudentModal}
          onOpenChange={setShowStudentModal}
        />
        <InternetUserModal
          open={showInternetModal}
          onOpenChange={setShowInternetModal}
        />
        <WebDevelopmentProjectModal
          open={showWebDevModal}
          onOpenChange={setShowWebDevModal}
        />
      </div>
    </div>
  );
}