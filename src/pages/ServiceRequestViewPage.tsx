import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { serviceRequestAPI, technicianAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { ArrowLeft, Loader2, Printer, Edit, Wrench, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import abelovLogo from '@/assets/abelov-logo.png';
import { cn } from "@/lib/utils";
import { QrCode, FileText } from "lucide-react";

export default function ServiceRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRoles } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'qr' | 'receipt' | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressData, setProgressData] = useState({
    status: '',
    technician_notes: '',
    fault_found: '',
    parts_used: '',
    repair_action: '',
  });

  const isTechnician = userRoles.includes('technician');
  const isAssignedToMe = request?.assigned_to === user?.id;
  const canAccept = isTechnician && isAssignedToMe && !request?.accepted_at && request?.status === 'Pending';
  const canUpdateProgress = isTechnician && isAssignedToMe && !!request?.accepted_at;
  const canDeliver = isTechnician && isAssignedToMe && request?.status === 'In-Progress';

  const loadRequest = useCallback(async (requestId: string) => {
    try {
      const data = await serviceRequestAPI.getById(requestId);
      setRequest(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadRequest(id);
    }
  }, [id, loadRequest]);

  const handleAcceptJob = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await technicianAPI.acceptJob(id);
      toast({ title: 'Success', description: 'Job accepted successfully' });
      loadRequest(id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to accept job', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await technicianAPI.updateProgress(id, progressData);
      toast({ title: 'Success', description: 'Progress updated' });
      setShowProgressDialog(false);
      loadRequest(id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update progress', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!id) return;
    if (!window.confirm('Mark this job as delivered? The customer has collected the device.')) return;
    setActionLoading(true);
    try {
      await technicianAPI.markDelivered(id);
      toast({ title: 'Success', description: 'Job marked as delivered' });
      loadRequest(id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to mark delivered', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Request Not Found</h1>
          <Button onClick={() => navigate('/login')}>Return to Login</Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In-Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Unsuccessful':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: string | number | boolean | null }) => (
    <div className="py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-primary">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || '-'}
      </p>
    </div>
  );

  const handlePrint = (type: 'qr' | 'receipt') => {
    setPrintType(type);
    setPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
            width: auto !important;
            background: white !important;
            color: black !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-scheme: light !important;
          }
          .print-hide { display: none !important; }
          .print-show { display: block !important; }
          .print-content {
            height: auto !important;
            min-height: auto !important;
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.2cm !important;
            background: white !important;
            color: black !important;
          }
          .print-container {
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.2cm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            height: auto !important;
            min-height: auto !important;
            background: white !important;
            color: black !important;
          }
          .print-header { margin-bottom: 0.2rem !important; }
          .print-qr { margin-top: 0.2rem !important; }
          .card {
            padding: 0.3cm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            height: auto !important;
            width: auto !important;
            background: white !important;
            color: black !important;
          }
          [role="dialog"], .radix-state-open {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="print-hide mb-8 flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <img src={abelovLogo} alt="Abelov Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-primary">Service Request</h1>
              <p className="text-muted-foreground text-xs md:text-sm">ID: {request.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {user && (
              <>
                <Button variant="outline" size="sm" onClick={() => setPrintModalOpen(true)} className="hidden md:flex">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPrintModalOpen(true)} className="md:hidden">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => navigate(`/edit/${request.id}`)} className="hidden md:flex">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" onClick={() => navigate(`/edit/${request.id}`)} className="md:hidden">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="hidden md:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="md:hidden">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Technician Actions */}
        {isTechnician && (
          <div className="print-hide mb-6 flex flex-wrap gap-3">
            {canAccept && (
              <Button onClick={handleAcceptJob} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wrench className="w-4 h-4 mr-2" />}
                Accept Job
              </Button>
            )}
            {canUpdateProgress && (
              <Button onClick={() => { setProgressData({ status: request.status, technician_notes: request.technician_notes || '', fault_found: request.fault_found || '', parts_used: request.parts_used || '', repair_action: request.repair_action || '' }); setShowProgressDialog(true); }} variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Update Progress
              </Button>
            )}
            {canDeliver && (
              <Button onClick={handleMarkDelivered} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Mark Delivered
              </Button>
            )}
          </div>
        )}

        <div className="print-hide">
          <div className="print-content">
            <div className="print-show mb-6 text-center hidden">
              <h1 className="text-2xl font-bold mb-1">Abelov Records Management System</h1>
              <p className="text-sm text-muted-foreground">Service Request Report</p>
              <hr className="my-4" />
            </div>

            <div className="mb-4">
              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
              {request.delivered && (
                <Badge className="ml-2 bg-green-100 text-green-800">Delivered</Badge>
              )}
              <Badge className="ml-2" variant="outline">
                Payment: {request.payment_status}
              </Badge>
            </div>

            <Card className="p-6">
              <div className="mb-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div><DetailRow label="Request ID" value={request.id} /></div>
                  <div><DetailRow label="Request Date" value={request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'} /></div>
                  <div><DetailRow label="Status" value={request.status} /></div>
                  <div><DetailRow label="Department" value={request.department} /></div>
                </div>
              </div>

              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><DetailRow label="Name" value={request.customer_name} /></div>
                  <div><DetailRow label="Phone" value={request.customer_phone} /></div>
                  <div><DetailRow label="Address" value={request.customer_address} /></div>
                </div>
              </div>

              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><DetailRow label="Brand" value={request.device_brand} /></div>
                  <div><DetailRow label="Model" value={request.device_model} /></div>
                  <div><DetailRow label="Serial" value={request.serial_number} /></div>
                  <div><DetailRow label="OS" value={request.operating_system} /></div>
                  {request.accessories_received && (
                    <div className="md:col-span-2"><DetailRow label="Accessories" value={request.accessories_received} /></div>
                  )}
                </div>
              </div>

              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Problem</h3>
                <p className="text-sm whitespace-pre-wrap">{request.problem_description}</p>
              </div>

              {(request.fault_found || request.parts_used || request.repair_action) && (
                <div className="print-hide mb-6 pb-6 print-section-break">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Diagnosis & Repair</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {request.diagnosis_date && <div><DetailRow label="Diagnosis Date" value={request.diagnosis_date ? new Date(request.diagnosis_date).toLocaleDateString() : '-'} /></div>}
                    {request.diagnosis_technician && <div><DetailRow label="Technician" value={request.diagnosis_technician} /></div>}
                  </div>
                  {request.fault_found && <div className="mb-3 text-primary"><p className="text-xs font-medium text-muted-foreground">Fault Found</p><p className="text-sm whitespace-pre-wrap">{request.fault_found}</p></div>}
                  {request.parts_used && <div className="mb-3 text-primary"><p className="text-xs font-medium text-muted-foreground">Parts Used</p><p className="text-sm whitespace-pre-wrap">{request.parts_used}</p></div>}
                  {request.repair_action && <div className="text-primary"><p className="text-xs font-medium text-muted-foreground">Repair Action</p><p className="text-sm text-primary whitespace-pre-wrap">{request.repair_action}</p></div>}
                </div>
              )}

              {request.technician_notes && (
                <div className="mb-6 pb-6 print-section-break">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Technician Notes</h3>
                  <p className="text-sm whitespace-pre-wrap">{request.technician_notes}</p>
                </div>
              )}

              <div className="print-hide mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><DetailRow label="Service" value={`₦${(request.service_charge || 0).toLocaleString()}`} /></div>
                  <div><DetailRow label="Parts" value={`₦${(request.parts_cost || 0).toLocaleString()}`} /></div>
                  <div><DetailRow label="Total" value={`₦${(request.total_cost || 0).toLocaleString()}`} /></div>
                  <div><DetailRow label="Deposit" value={`₦${(request.deposit_paid || 0).toLocaleString()}`} /></div>
                  <div><DetailRow label="Balance" value={`₦${(request.balance || 0).toLocaleString()}`} /></div>
                  <div><DetailRow label="Payment" value={request.payment_status} /></div>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><DetailRow label="Assigned To" value={request.assigned_to || 'Unassigned'} /></div>
                  <div><DetailRow label="Accepted At" value={request.accepted_at ? new Date(request.accepted_at).toLocaleString() : '-'} /></div>
                  <div><DetailRow label="Delivered At" value={request.delivered_at ? new Date(request.delivered_at).toLocaleString() : '-'} /></div>
                </div>
              </div>

              <div className="print-hide text-xs text-muted-foreground mt-6 pt-4 border-t">
                <p>Created: {request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</p>
                <p>Last Updated: {request.updated_at ? new Date(request.updated_at).toLocaleString() : '-'}</p>
              </div>

              <div className="mt-6 pt-4 border-t text-center print-hide">
                <h3 className="text-lg font-semibold mb-3 text-primary">Payment Status</h3>
                {request.payment_completed ? (
                  <div className="p-4 bg-green-100 text-green-800 rounded-md inline-block">
                    <p className="font-bold flex items-center justify-center gap-2">
                      <span className="text-xl">✓</span> Payment Completed
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    {request.payment_status === 'partial' ? 'Partial payment received' : 'Payment pending'}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t text-center">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2">Service Request QR Code</p>
                  <QRCode value={`${window.location.origin}/#/view/${request.id}`} size={128} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress Dialog */}
        <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Update Job Progress</DialogTitle>
              <DialogDescription>Update the status and add notes for this job.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={progressData.status} onValueChange={(val) => setProgressData({ ...progressData, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fault Found</label>
                <Textarea value={progressData.fault_found} onChange={(e) => setProgressData({ ...progressData, fault_found: e.target.value })} placeholder="Describe the fault found" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parts Used</label>
                <Textarea value={progressData.parts_used} onChange={(e) => setProgressData({ ...progressData, parts_used: e.target.value })} placeholder="Parts used for repair" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Repair Action</label>
                <Textarea value={progressData.repair_action} onChange={(e) => setProgressData({ ...progressData, repair_action: e.target.value })} placeholder="Actions taken" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Technician Notes</label>
                <Textarea value={progressData.technician_notes} onChange={(e) => setProgressData({ ...progressData, technician_notes: e.target.value })} placeholder="Additional notes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProgressDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateProgress} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Print Options</DialogTitle>
              <DialogDescription>Choose what you would like to print for this service request.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all" onClick={() => handlePrint('qr')}>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <QrCode className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">QR Code</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Compact tag for device</p>
                </div>
              </Button>
              <Button variant="outline" className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all" onClick={() => handlePrint('receipt')}>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Full Receipt</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Detailed service record</p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className={cn("hidden", printType === 'qr' && "print:block")}>
          <div className="print-container font-bold text-black">
            <div className="print-header">
              <img src={abelovLogo} alt="Abelov Logo" className="w-10 h-10 mx-auto mb-2" />
              <h1 className="text-lg font-bold text-black">Abelov Records Management System</h1>
              <h5 className="text-[15px] font-bold text-gray-600 mt-1 uppercase tracking-tight">Service Request Record</h5>
              <h6 className="text-[16px] font-bold font-mono mt-0.5">ID: {request.id}</h6>
              <div className="mt-2 text-center">
                <h4 className="text-[22px] font-bold text-black">{request.customer_name}</h4>
                <h5 className="text-[18px] font-bold text-gray-700">{request.customer_phone}</h5>
                <h6 className="text-[18px] font-bold text-gray-700">{request.problem_description}</h6>
                <h6 className="text-xs italic text-gray-600 mb-4">Thank you for choosing Abelov International Ltd!</h6>
              </div>
              <div className="w-1/3 mx-auto border-b border-gray-200 mt-2"></div>
            </div>
            <div className="flex flex-col items-center print-qr">
              <div className="bg-white p-2 border border-gray-100">
                <QRCode value={`${window.location.origin}/#/view/${request.id}`} size={100} />
              </div>
              <h5 className="mt-2 text-[8px] font-bold text-black uppercase tracking-widest">SCAN TO VIEW DETAILS</h5>
            </div>
          </div>
        </div>

        <div className={cn("hidden", (printType === 'receipt' || printType === null) && "print:block")}>
          <div className="print-container max-w-[8cm] mx-auto text-black p-4 font-bold">
            <div className="text-center mb-4">
              <img src={abelovLogo} alt="Abelov Logo" className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-xl font-bold">Abelov Records Management System</h1>
              <p className="text-xs uppercase font-bold">Service Receipt</p>
            </div>
            <div className="border-t border-b border-gray-200 py-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Request ID:</span>
                <span className="font-mono font-bold">{request.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-bold">{request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            <div className="mb-4 text-sm">
              <h3 className="font-bold border-b border-gray-100 mb-1 pb-1">CUSTOMER</h3>
              <p className="font-semibold">{request.customer_name}</p>
              <p className="text-gray-700">{request.customer_phone}</p>
              <p className="text-xs text-gray-600">{request.customer_address}</p>
            </div>
            <div className="mb-4 text-sm">
              <h3 className="font-bold border-b border-gray-100 mb-1 pb-1">DEVICE INFO</h3>
              <p className="font-semibold">{request.device_brand} {request.device_model}</p>
              <p className="text-gray-700">S/N: {request.serial_number}</p>
              <p className="text-gray-700">OS: {request.operating_system}</p>
            </div>
            <div className="mb-4 text-sm">
              <h3 className="font-bold border-b border-gray-100 mb-1 pb-1">CHARGES</h3>
              <div className="flex justify-between py-1">
                <span>Service Charge:</span>
                <span>₦{Number(request.service_charge || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Parts Cost:</span>
                <span>₦{Number(request.parts_cost || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-100 mt-1 pt-1">
                <span>Total Amount:</span>
                <span>₦{Number(request.total_cost || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Deposit Paid:</span>
                <span>₦{Number(request.deposit_paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-double border-gray-200 mt-1 pt-2">
                <span>Total Balance:</span>
                <span>₦{Number(request.balance || 0).toLocaleString()}</span>
              </div>
              <div className="mt-2 text-center">
                <span className={cn("px-2 py-0.5 rounded text-xs uppercase font-bold", request.payment_completed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                  {request.payment_completed ? "Payment Completed" : "Payment Pending"}
                </span>
              </div>
            </div>
            <div className="text-center mt-8 border-t border-dashed pt-4">
              <p className="text-xs italic text-gray-600 mb-4">Thank you for choosing Abelov International Ltd!</p>
              <div className="flex flex-col items-center gap-2">
                <QRCode value={`${window.location.origin}/#/view/${request.id}`} size={64} />
                <p className="text-[10px] font-bold uppercase tracking-tight">Scan to Track Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
