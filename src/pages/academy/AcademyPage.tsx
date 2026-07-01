import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BookOpen, Search, Edit, Trash2, Clock, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { academyAPI } from '@/lib/api';
import { AcademyCourse } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import AddAcademyModal from '@/components/AddAcademyModal';

const statusColor: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  published: 'bg-green-100 text-green-800 border-green-300',
  archived: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const levelColor: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-purple-100 text-purple-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function AcademyPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademyCourse | null>(null);

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

  const filtered = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    archived: courses.filter((c) => c.status === 'archived').length,
    totalRevenue: courses.reduce((sum, c) => sum + (c.price || 0), 0),
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Academy Courses</h1>
              <p className="text-muted-foreground">Manage your course catalog</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.published}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-gray-50 to-gray-50 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <BookOpen className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-700">{stats.draft}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-yellow-50 to-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <BookOpen className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-700">{stats.archived}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-700">₦{stats.totalRevenue.toLocaleString()}</p>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, category, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Cards */}
        {filtered.length === 0 && searchQuery ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search query.</p>
            <Button onClick={() => setSearchQuery('')} variant="outline">Clear Search</Button>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first course to get started.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((course) => (
              <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-5 h-5 text-primary shrink-0" />
                      <h3 className="font-semibold truncate">{course.title}</h3>
                    </div>
                    {course.category && (
                      <p className="text-xs text-muted-foreground">{course.category}</p>
                    )}
                  </div>
                  <Badge className={statusColor[course.status] || ''}>{course.status}</Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description || 'No description'}</p>

                <div className="space-y-2 text-sm mb-4">
                  {course.instructor && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span>Instructor: <strong>{course.instructor}</strong></span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Duration: <strong>{course.duration}</strong></span>
                    </div>
                  )}
                  {course.price > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Price: <strong>₦{course.price.toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {course.level && (
                    <Badge variant="outline" className={levelColor[course.level] || ''}>{course.level}</Badge>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingItem(course)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AddAcademyModal
          open={showAddModal || !!editingItem}
          onOpenChange={(open) => {
            setShowAddModal(open);
            if (!open) setEditingItem(null);
          }}
          editItem={editingItem}
          onSuccess={loadCourses}
        />
      </div>
    </div>
  );
}