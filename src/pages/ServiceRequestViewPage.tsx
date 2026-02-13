import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serviceRequestAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { ArrowLeft, Loader2, Printer, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import abelovLogo from '@/assets/abelov-logo.png';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QrCode, FileText } from "lucide-react";


export default function ServiceRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'qr' | 'receipt' | null>(null);

  const loadRequest = useCallback(async (requestId: string) => {
    try {
      const data = await serviceRequestAPI.getById(requestId);
      setRequest(data);
    } catch (err: any) {
      console.error('Request load failed:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load request',
        variant: 'destructive',
      });
      // Don't navigate away; the UI handles !request state with a clear message
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    if (id) {
      loadRequest(id);
    }
  }, [id, loadRequest]);

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
      case 'Successful':
        return 'bg-green-100 text-green-800';
      case 'Unsuccessful':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
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
    // Give enough time for the state to update and classes to apply
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
          .print-header {
             margin-bottom: 0.2rem !important;
          }
          .print-qr {
             margin-top: 0.2rem !important;
          }
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
        {/* Screen Top Header (Buttons and ID) */}
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

        {/* Unified Form - Screen Only */}
        <div className="print-hide">
          <div className="print-content">
            {/* Print Header */}

            <div className="print-show mb-6 text-center hidden">
              <h1 className="text-2xl font-bold mb-1">Abelov Technical Records</h1>
              <p className="text-sm text-muted-foreground">Service Request Report</p>
              <hr className="my-4" />
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
            </div>

            {/* Unified Form - All Sections in One */}
            <Card className="p-6">
              {/* Request Header */}
              <div className="mb-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <DetailRow label="Request ID" value={request.id} />
                  </div>
                  <div>
                    <DetailRow label="Request Date" value={request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'} />
                  </div>
                  <div>
                    <DetailRow label="Status" value={request.status} />
                  </div>
                  <div>
                    <DetailRow label="Technician" value={request.technician_name} />
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <DetailRow label="Name" value={request.customer_name} />
                  </div>
                  <div>
                    <DetailRow label="Phone" value={request.customer_phone} />
                  </div>
                  <div>
                    <DetailRow label="Address" value={request.customer_address} />
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Device</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <DetailRow label="Brand" value={request.device_brand} />
                  </div>
                  <div>
                    <DetailRow label="Model" value={request.device_model} />
                  </div>
                  <div>
                    <DetailRow label="Serial" value={request.serial_number} />
                  </div>
                  <div>
                    <DetailRow label="OS" value={request.operating_system} />
                  </div>
                  {request.accessories_received && (
                    <div className="md:col-span-2">
                      <DetailRow label="Accessories" value={request.accessories_received} />
                    </div>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div className="mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Problem</h3>
                <p className="text-sm whitespace-pre-wrap">{request.problem_description}</p>
              </div>

              {/* Diagnosis & Repair */}
              {(request.fault_found || request.parts_used || request.repair_action) && (
                <div className="print-hide mb-6 pb-6 print-section-break">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Diagnosis & Repair</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {request.diagnosis_date && (
                      <div>
                        <DetailRow label="Diagnosis Date" value={request.diagnosis_date ? new Date(request.diagnosis_date).toLocaleDateString() : '-'} />
                      </div>
                    )}
                    {request.diagnosis_technician && (
                      <div>
                        <DetailRow label="Technician" value={request.diagnosis_technician} />
                      </div>
                    )}
                  </div>
                  {request.fault_found && (
                    <div className="mb-3 text-primary">
                      <p className="text-xs font-medium text-muted-foreground">Fault Found</p>
                      <p className="text-sm whitespace-pre-wrap">{request.fault_found}</p>
                    </div>
                  )}
                  {request.parts_used && (
                    <div className="mb-3 text-primary">
                      <p className="text-xs font-medium text-muted-foreground">Parts Used</p>
                      <p className="text-sm whitespace-pre-wrap">{request.parts_used}</p>
                    </div>
                  )}
                  {request.repair_action && (
                    <div className="text-primary">
                      <p className="text-xs font-medium text-muted-foreground">Repair Action</p>
                      <p className="text-sm text-primary whitespace-pre-wrap">{request.repair_action}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cost Summary */}
              <div className="print-hide mb-6 pb-6 print-section-break">
                <h3 className="text-lg font-semibold mb-3 text-primary">Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <DetailRow label="Service" value={`₦${(request.service_charge || 0).toLocaleString()}`} />
                  </div>
                  <div>
                    <DetailRow label="Parts" value={`₦${(request.parts_cost || 0).toLocaleString()}`} />
                  </div>
                  <div>
                    <DetailRow label="Total" value={`₦${(request.total_cost || 0).toLocaleString()}`} />
                  </div>
                  <div>
                    <DetailRow label="Deposit" value={`₦${(request.deposit_paid || 0).toLocaleString()}`} />
                  </div>
                  <div>
                    <DetailRow label="Balance" value={`₦${(request.balance || 0).toLocaleString()}`} />
                  </div>
                  <div>
                    <DetailRow label="Payment" value={request.payment_completed ? 'Completed' : 'Pending'} />
                  </div>

                </div>
              </div>

              {/* Customer Confirmation */}
              {request.customer_confirmation && (
                <div className="print-hide pb-6 print-section-break">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Confirmation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <DetailRow label="Device Collected" value={request.customer_confirmation.customer_collected} />
                    </div>
                    <div>
                      <DetailRow label="Technician" value={request.customer_confirmation.technician} />
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps - Hide on Print */}
              <div className="print-hide text-xs text-muted-foreground mt-6 pt-4 border-t">
                <p>Created: {request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</p>
                <p>Last Updated: {request.updated_at ? new Date(request.updated_at).toLocaleString() : '-'}</p>
              </div>

              {/* Payment Section - always visible logic */}
              <div className="mt-6 pt-4 border-t text-center print-hide">
                <h3 className="text-lg font-semibold mb-3 text-primary">Payment Status</h3>

                {request.payment_completed ? (
                  <div className="p-4 bg-green-100 text-green-800 rounded-md inline-block">
                    <p className="font-bold flex items-center justify-center gap-2">
                      <span className="text-xl">✓</span> Payment Completed
                    </p>
                  </div>
                ) : request.balance <= 0 ? (
                  <div className="p-4 bg-gray-100 text-gray-600 rounded-md inline-block">
                    <p className="font-medium">No pending balance to pay.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please complete the payment to finalize your service request.
                    </p>
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => loadRequest(request.id)}>
                        Refresh Payment Status
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* QR Code */}
              <div className="mt-6 pt-4 border-t text-center">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-muted-foreground mb-2">Service Request QR Code</p>
                  <QRCode
                    value={`${window.location.origin}/#/view/${request.id}`}
                    size={128}
                  />

                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons - Hide on Print */}
        {/* Action Buttons - Mobile */}
        <div className="md:hidden flex flex-col gap-2 mb-6 print-hide">
          {user && (
            <>
              <Button variant="outline" onClick={() => setPrintModalOpen(true)} className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => navigate(`/edit/${request.id}`)} className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </>
          )}
        </div>

        {/* Print Modal */}
        <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Print Options</DialogTitle>
              <DialogDescription>
                Choose what you would like to print for this service request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handlePrint('qr')}
              >
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <QrCode className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">QR Code</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Compact tag for device</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => handlePrint('receipt')}
              >
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

        {/* QR Code - Print Only */}
        <div className={cn("hidden", printType === 'qr' && "print:block")}>
          <div className="print-container font-bold text-black">
            <div className="print-header">
              <img src={abelovLogo} alt="Abelov Logo" className="w-10 h-10 mx-auto mb-2" />
              <h1 className="text-lg font-bold text-black">Abelov Technical Records</h1>
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
                <QRCode
                  value={`${window.location.origin}/#/view/${request.id}`}
                  size={100}
                />
              </div>
              <h5 className="mt-2 text-[8px] font-bold text-black uppercase tracking-widest">
                SCAN TO VIEW DETAILS
              </h5>
            </div>
          </div>
        </div>

        {/* Full Receipt - Print Only */}
        <div className={cn("hidden", (printType === 'receipt' || printType === null) && "print:block")}>
          <div className="print-container max-w-[8cm] mx-auto text-black p-4 font-bold">
            <div className="text-center mb-4">
              <img src={abelovLogo} alt="Abelov Logo" className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-xl font-bold">Abelov Technical Records</h1>
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
                <span className={cn("px-2 py-0.5 rounded text-xs uppercase font-bold",
                  request.payment_completed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                  {request.payment_completed ? "Payment Completed" : "Payment Pending"}
                </span>
              </div>
            </div>

            <div className="text-center mt-8 border-t border-dashed pt-4">
              <p className="text-xs italic text-gray-600 mb-4">Thank you for choosing Abelov International Ltd!</p>
              <div className="flex flex-col items-center gap-2">
                <QRCode
                  value={`${window.location.origin}/#/view/${request.id}`}
                  size={64}
                />
                <p className="text-[10px] font-bold uppercase tracking-tight">Scan to Track Progress</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
