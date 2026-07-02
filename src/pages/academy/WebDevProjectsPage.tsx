import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Code2, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_PROJECTS = [
  { id: 'WEB-001', client: 'Tech Corp', title: 'E-commerce Platform', cost: 500000, paid: 300000, status: 'in_progress', deadline: '2025-06-30' },
  { id: 'WEB-002', client: 'Green Farms', title: 'Landing Page', cost: 150000, paid: 150000, status: 'completed', deadline: '2025-04-15' },
  { id: 'WEB-003', client: 'EduLearn', title: 'LMS Portal', cost: 800000, paid: 200000, status: 'in_progress', deadline: '2025-08-01' },
  { id: 'WEB-004', client: 'John Doe', title: 'Portfolio Website', cost: 100000, paid: 0, status: 'pending', deadline: '2025-05-20' },
  { id: 'WEB-005', client: 'Style Hub', title: 'Fashion Store API', cost: 350000, paid: 350000, status: 'completed', deadline: '2025-03-01' },
];

export default function WebDevProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const totalProjects = MOCK_PROJECTS.length;
  const completed = MOCK_PROJECTS.filter(r => r.status === 'completed').length;
  const totalRevenue = MOCK_PROJECTS.reduce((s, r) => s + r.paid, 0);
  const outstanding = MOCK_PROJECTS.reduce((s, r) => s + (r.cost - r.paid), 0);

  const filtered = MOCK_PROJECTS.filter(r =>
    !searchQuery || r.client.toLowerCase().includes(searchQuery.toLowerCase()) || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Web Development Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track web development projects.</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{totalProjects}</p>
              </div>
              <Code2 className="w-10 h-10 text-green-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-500/30" />
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
            placeholder="Search projects..."
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
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Cost (₦)</TableHead>
                <TableHead>Paid (₦)</TableHead>
                <TableHead>Balance (₦)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No projects found</TableCell>
                </TableRow>
              ) : (
                filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.client}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>₦{r.cost.toLocaleString()}</TableCell>
                    <TableCell>₦{r.paid.toLocaleString()}</TableCell>
                    <TableCell className={r.cost - r.paid > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      ₦{(r.cost - r.paid).toLocaleString()}
                    </TableCell>
                    <TableCell><Badge className={getStatusBadge(r.status)}>{r.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm">{r.deadline}</TableCell>
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
