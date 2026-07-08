import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceRequest } from "@/types/database";
import { serviceRequestAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FileText, Calendar, User, Phone, Search, Edit, UserPlus, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddAnonymousJobModal from "@/components/AddAnonymousJobModal";

export default function JobsPage() {
  const navigate = useNavigate();
  const { user, userRoles } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showAnonymousModal, setShowAnonymousModal] = useState(false);

  const isTechnician = userRoles.includes('technician');
  const canCreate = userRoles.some(r => ['admin', 'secretary', 'technician'].includes(r));

  useEffect(() => {
    const fetchRequests = async () => {
      if (user) {
        try {
          const data = await serviceRequestAPI.getAll(true);
          setRequests(data.reverse());
        } catch (error) {
          console.error('Failed to fetch jobs:', error);
        }
      }
    };
    fetchRequests();
  }, [user]);

  const filteredRequests = requests.filter(request => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      request.customer_name.toLowerCase().includes(query) ||
      request.customer_phone.toLowerCase().includes(query) ||
      request.device_model.toLowerCase().includes(query) ||
      request.device_brand.toLowerCase().includes(query) ||
      request.id.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    if (isTechnician) {
      return matchesSearch && matchesStatus && request.assigned_to === user.id;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In-Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Unsuccessful":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "partial": return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default: return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Jobs</h1>
              <p className="text-muted-foreground">
                {isTechnician ? "Jobs assigned to you" : "View and manage all jobs"}
              </p>
            </div>
            {canCreate && (
              <Button onClick={() => setShowChoiceModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, phone, device, ID, or status..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRequests.length === 0 && searchQuery ? (
          <Card className="p-12 text-center">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search query.</p>
            <Button onClick={() => setSearchQuery("")} variant="outline">
              Clear Search
            </Button>
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Jobs Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first job to get started.</p>
            {canCreate && (
              <Button onClick={() => setShowChoiceModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Job ID</p>
                    <p className="font-mono font-semibold text-primary">{request.id}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{request.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{request.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>{request.device_model} - {request.device_brand}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(request.request_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="font-bold text-primary">₦{request.total_cost.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <div>{getPaymentBadge(request.payment_status)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/edit/${request.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {isTechnician ? 'Work on Job' : 'Edit'}
                    </Button>
                    <Button
                      onClick={() => navigate(`/view/${request.id}`)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showChoiceModal} onOpenChange={setShowChoiceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Job</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => {
                setShowChoiceModal(false);
                setShowAnonymousModal(true);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all"
            >
              <UserPlus className="w-10 h-10 text-muted-foreground" />
              <span className="font-semibold">Anonymous Customer</span>
              <span className="text-xs text-muted-foreground text-center">Quick entry with just description & price</span>
            </button>
            <button
              onClick={() => {
                setShowChoiceModal(false);
                navigate("/new-request");
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-all"
            >
              <UserRound className="w-10 h-10 text-muted-foreground" />
              <span className="font-semibold">Register Customer</span>
              <span className="text-xs text-muted-foreground text-center">Full form with customer & device details</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AddAnonymousJobModal
        open={showAnonymousModal}
        onOpenChange={setShowAnonymousModal}
        onSuccess={async () => {
          const data = await serviceRequestAPI.getAll(true);
          setRequests(data.reverse());
        }}
      />
    </div>
  );
}
