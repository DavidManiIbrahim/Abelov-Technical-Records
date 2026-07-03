import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  ticketCount: number;
  totalRevenue: number;
  pendingTickets: number;
  completedTickets: number;
  lastActivityDate: string | null;
  roles?: string[];
  department?: string;
}

const DEPARTMENTS = [
  { value: 'none', label: 'None' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'sales', label: 'Sales' },
  { value: 'it_academy', label: 'IT Academy' },
];

const ROLES = [
  { value: 'secretary', label: 'Secretary' },
  { value: 'technician', label: 'Technician' },
  { value: 'sales', label: 'Sales' },
  { value: 'academy', label: 'Academy' },
  { value: 'admin', label: 'Administrator' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('secretary');
  const [newUserDept, setNewUserDept] = useState('none');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await adminAPI.getAllUsersWithStats();
      setUsers((usersData as any[]).map((u) => ({ ...u } as UserData)));
    } catch {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.createUser({ email: newUserEmail, password: newUserPassword, roles: [newUserRole], department: newUserDept === 'none' ? '' : newUserDept });
      toast({ title: 'Success', description: 'User created successfully' });
      setIsCreatingUser(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('secretary');
      setNewUserDept('none');
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await adminAPI.deleteUser(id);
      loadUsers();
      toast({ title: 'Success', description: 'User has been deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      await adminAPI.assignRole(userId, newRole);
      toast({ title: 'Success', description: `Role updated to ${newRole}` });
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update role', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deptLabel = (val: string) => {
    const lookup = val || 'none';
    const d = DEPARTMENTS.find(d => d.value === lookup);
    return d ? d.label : val || '-';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setIsCreatingUser(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Card className="p-6">
        {loading && !users.length ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Email</TableHead>
                  <TableHead className="text-xs font-semibold">Username</TableHead>
                  <TableHead className="text-xs font-semibold">Role</TableHead>
                  <TableHead className="text-xs font-semibold">Department</TableHead>
                  <TableHead className="text-xs font-semibold">Tickets</TableHead>
                  <TableHead className="text-xs font-semibold">Revenue</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const nameFromEmail = u.email.split('@')[0];
                    const primaryRole = (u.roles && u.roles.length > 0 ? u.roles[0] : 'secretary') || 'secretary';
                    return (
                      <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm font-medium">{nameFromEmail}</TableCell>
                        <TableCell className="text-sm capitalize">
                          <Select value={primaryRole} onValueChange={(val) => handleRoleChange(u.id, val)} disabled={loading}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">{deptLabel(u.department || '')}</TableCell>
                        <TableCell className="text-sm font-semibold">{u.ticketCount}</TableCell>
                        <TableCell className="text-sm font-semibold">₦{u.totalRevenue?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? 'default' : 'secondary'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleDeleteUser(u.id)} variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
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

      <Dialog open={isCreatingUser} onOpenChange={setIsCreatingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with an @abelov.ng email address.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input placeholder="staff@abelov.ng" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">User Role</label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={newUserDept} onValueChange={setNewUserDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreatingUser(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
