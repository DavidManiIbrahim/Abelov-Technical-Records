import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Wrench } from 'lucide-react';
import { secretaryAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  roles?: string[];
  department?: string;
  ticketCount: number;
}

const ROLES = [
  { value: 'secretary', label: 'Secretary' },
  { value: 'technician', label: 'Technician' },
];

export default function ManageTechniciansPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await secretaryAPI.getUsers();
      setUsers((usersData as any[]).map((u) => ({ ...u } as UserData)));
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await secretaryAPI.assignRole(userId, newRole);
      toast({ title: 'Success', description: `Role updated to ${newRole}` });
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update role', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manage Technicians</h1>
          <p className="text-muted-foreground mt-1">Assign or change technician roles for staff members.</p>
        </div>
      </div>

      <Card className="p-6">
        {loading && !users.length ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {[...Array(4)].map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(4)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Email</TableHead>
                  <TableHead className="text-xs font-semibold">Current Role</TableHead>
                  <TableHead className="text-xs font-semibold">Department</TableHead>
                  <TableHead className="text-xs font-semibold">Assigned Jobs</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const primaryRole = (u.roles && u.roles.length > 0 ? u.roles[0] : 'secretary') || 'secretary';
                    return (
                      <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm capitalize">
                          <Badge variant="outline">{primaryRole}</Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize text-muted-foreground">
                          {u.department || '—'}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">{u.ticketCount}</TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? 'default' : 'secondary'}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={primaryRole}
                              onValueChange={(val) => handleRoleChange(u.id, val)}
                              disabled={actionLoading === u.id}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map(r => (
                                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {actionLoading === u.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
