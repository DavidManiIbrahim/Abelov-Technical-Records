import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Eye } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface RequestData {
  id: string;
  customer_name: string;
  device_brand: string;
  device_model: string;
  status: string;
  total_cost: number | null;
  deposit_paid?: number | null;
  balance?: number | null;
  payment_completed?: boolean;
  technician_name: string;
  created_at: string;
  user_id: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'In-Progress': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Unsuccessful': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function TicketManagementPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [previewRequest, setPreviewRequest] = useState<RequestData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const results = await adminAPI.getAllServiceRequests(20, 0, true);
      setRequests(results.requests || []);
      setTotalRequests(results.total || 0);
    } catch {
      toast({ title: 'Error', description: 'Failed to load tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRequests();
      return;
    }
    setLoading(true);
    try {
      const results = await adminAPI.searchRequests(searchQuery, 20, 0);
      setRequests(results.requests);
      setTotalRequests(results.total);
      setCurrentPage(0);
    } catch {
      toast({ title: 'Error', description: 'Search failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    if (val === 'all') {
      loadRequests();
    } else {
      filterByStatus(val);
    }
  };

  const filterByStatus = async (status: string) => {
    setLoading(true);
    try {
      const results = await adminAPI.getRequestsByStatus(status, 20, 0);
      setRequests(results.requests);
      setTotalRequests(results.total);
      setCurrentPage(0);
    } catch {
      toast({ title: 'Error', description: 'Filter failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
    try {
      const offset = newPage * 20;
      let results;
      if (searchQuery.trim()) {
        results = await adminAPI.searchRequests(searchQuery, 20, offset);
      } else if (statusFilter !== 'all') {
        results = await adminAPI.getRequestsByStatus(statusFilter, 20, offset);
      } else {
        results = await adminAPI.getAllServiceRequests(20, offset, true);
      }
      setRequests(results.requests || []);
      setTotalRequests(results.total || 0);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Ticket Management</h1>

      <Card className="p-6">
        <div className="mb-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Search by request ID, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In-Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {[...Array(10)].map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                  ))}
                  <TableHead className="text-xs font-semibold text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(11)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Request ID</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-xs font-semibold">Device</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Total Cost</TableHead>
                    <TableHead className="text-xs font-semibold">Deposit Paid</TableHead>
                    <TableHead className="text-xs font-semibold">Balance</TableHead>
                    <TableHead className="text-xs font-semibold">Payment</TableHead>
                    <TableHead className="text-xs font-semibold">Technician</TableHead>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((req) => (
                      <TableRow
                        key={req.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/view/${req.id}`)}
                      >
                        <TableCell className="font-mono text-sm font-semibold">{req.id}</TableCell>
                        <TableCell className="text-sm">{req.customer_name}</TableCell>
                        <TableCell className="text-sm">{req.device_brand} {req.device_model}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">₦{(req.total_cost ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">₦{(req.deposit_paid ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">₦{(req.balance ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className={req.payment_completed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                            {req.payment_completed ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{req.technician_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-right">
                          <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); setPreviewRequest(req); setIsPreviewOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">Showing {requests.length} of {totalRequests} tickets</p>
              <div className="flex gap-2">
                <Button onClick={() => handlePageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0 || loading} variant="outline" size="sm">Previous</Button>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={requests.length < 20 || loading} variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket Preview</DialogTitle>
          </DialogHeader>
          {previewRequest && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Request ID</span><span className="font-mono">{previewRequest.id}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Customer</span><span>{previewRequest.customer_name}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Device</span><span>{previewRequest.device_brand} {previewRequest.device_model}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Technician</span><span>{previewRequest.technician_name}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Status</span><Badge className={getStatusColor(previewRequest.status)}>{previewRequest.status}</Badge></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Total Cost</span><span>₦{(previewRequest.total_cost || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Deposit Paid</span><span>₦{(previewRequest.deposit_paid || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Balance</span><span>₦{(previewRequest.balance || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Payment</span>
                <Badge variant="outline" className={previewRequest.payment_completed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                  {previewRequest.payment_completed ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              <div className="flex justify-between"><span className="font-medium text-muted-foreground">Created</span><span>{new Date(previewRequest.created_at).toLocaleString()}</span></div>
            </div>
          )}
          <DialogFooter>
            {previewRequest && (
              <Button variant="outline" onClick={() => { setIsPreviewOpen(false); navigate(`/view/${previewRequest.id}`); }}>
                Open full ticket
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
