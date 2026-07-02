import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Clock, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_INTERNET = [
  { id: 'NET-001', name: 'Michael Okoro', hours: 3.5, rate: 500, charge: 1750, paid: 1750, status: 'paid', date: '2025-04-01' },
  { id: 'NET-002', name: 'Sarah Adeleke', hours: 2, rate: 500, charge: 1000, paid: 500, status: 'partial', date: '2025-04-02' },
  { id: 'NET-003', name: 'David Eze', hours: 5, rate: 400, charge: 2000, paid: 0, status: 'pending', date: '2025-04-03' },
  { id: 'NET-004', name: 'Grace Okafor', hours: 1.5, rate: 500, charge: 750, paid: 750, status: 'paid', date: '2025-04-05' },
  { id: 'NET-005', name: 'Peter Ibrahim', hours: 4, rate: 500, charge: 2000, paid: 1000, status: 'partial', date: '2025-04-07' },
];

export default function InternetUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const totalUsers = MOCK_INTERNET.length;
  const totalHours = MOCK_INTERNET.reduce((s, r) => s + r.hours, 0);
  const totalRevenue = MOCK_INTERNET.reduce((s, r) => s + r.paid, 0);
  const outstanding = MOCK_INTERNET.reduce((s, r) => s + (r.charge - r.paid), 0);

  const filtered = MOCK_INTERNET.filter(r =>
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
            <h1 className="text-3xl font-bold text-primary">Internet Users</h1>
            <p className="text-muted-foreground mt-1">Track internet usage and payments.</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500/30" />
            </div>
          </Card>
          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{totalHours}h</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500/30" />
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
            placeholder="Search users..."
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
                <TableHead>Hours</TableHead>
                <TableHead>Rate/hr (₦)</TableHead>
                <TableHead>Charge (₦)</TableHead>
                <TableHead>Paid (₦)</TableHead>
                <TableHead>Balance (₦)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No records found</TableCell>
                </TableRow>
              ) : (
                filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.hours}</TableCell>
                    <TableCell>₦{r.rate.toLocaleString()}</TableCell>
                    <TableCell>₦{r.charge.toLocaleString()}</TableCell>
                    <TableCell>₦{r.paid.toLocaleString()}</TableCell>
                    <TableCell className={r.charge - r.paid > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      ₦{(r.charge - r.paid).toLocaleString()}
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
