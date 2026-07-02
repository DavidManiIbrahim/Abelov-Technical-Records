import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, GraduationCap, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_STUDENTS = [
  { id: 'STU-001', name: 'John Doe', course: 'Web Development', fee: 250000, paid: 150000, status: 'partial', date: '2025-01-15' },
  { id: 'STU-002', name: 'Jane Smith', course: 'Data Science', fee: 300000, paid: 300000, status: 'paid', date: '2025-02-01' },
  { id: 'STU-003', name: 'Alice Johnson', course: 'UI/UX Design', fee: 200000, paid: 50000, status: 'partial', date: '2025-03-10' },
  { id: 'STU-004', name: 'Bob Williams', course: 'Mobile Development', fee: 280000, paid: 0, status: 'pending', date: '2025-04-05' },
  { id: 'STU-005', name: 'Carol Brown', course: 'Web Development', fee: 250000, paid: 250000, status: 'paid', date: '2025-04-20' },
];

export default function StudentRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const totalStudents = MOCK_STUDENTS.length;
  const totalRevenue = MOCK_STUDENTS.reduce((s, r) => s + r.paid, 0);
  const outstanding = MOCK_STUDENTS.reduce((s, r) => s + (r.fee - r.paid), 0);
  const completed = MOCK_STUDENTS.filter(r => r.status === 'paid').length;

  const filtered = MOCK_STUDENTS.filter(r =>
    !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Student Registrations</h1>
            <p className="text-muted-foreground mt-1">Manage and track student registrations.</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{completed}</p>
              </div>
              <GraduationCap className="w-10 h-10 text-green-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-3xl font-bold text-red-700 mt-1">₦{outstanding.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-500/30" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Fee (₦)</TableHead>
                <TableHead>Paid (₦)</TableHead>
                <TableHead>Balance (₦)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No students found</TableCell>
                </TableRow>
              ) : (
                filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.course}</TableCell>
                    <TableCell>₦{r.fee.toLocaleString()}</TableCell>
                    <TableCell>₦{r.paid.toLocaleString()}</TableCell>
                    <TableCell className={r.fee - r.paid > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      ₦{(r.fee - r.paid).toLocaleString()}
                    </TableCell>
                    <TableCell><Badge className={getStatusBadge(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm">{r.date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
