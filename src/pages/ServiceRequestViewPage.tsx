import { useState, useEffect, useRef, useCallback } from 'react';
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


export default function ServiceRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePrint = () => {
    if (!printRef.current) return;
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            background: white !important;
          }
          .print-hide { display: none !important; }
          .print-show { display: block !important; }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0.5cm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .print-header {
             margin-bottom: 0.5rem !important;
          }
          .print-qr {
             margin-top: 0.5rem !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Screen Top Header (Buttons and ID) */}
        <div className="print-hide mb-8 flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <img src={abelovLogo} alt="Abelov Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Service Request</h1>
              <p className="text-muted-foreground text-sm">ID: {request.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {user && (
              <>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button size="sm" onClick={() => navigate(`/edit/${request.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="md:hidden flex flex-col gap-2 mb-6 print-hide">
          {user && (
            <>
              <Button variant="outline" onClick={handlePrint} className="w-full">
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

        <div ref={printRef} className="print-content">
          {/* Print-Only Header (Logo + Title) */}
          <div className="hidden print:block print-container">
            <div className="print-header">
              <img src={abelovLogo} alt="Abelov Logo" className="w-10 h-10 mx-auto mb-2" />
              <h1 className="text-lg font-bold text-black">Abelov Technical Records</h1>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tight">Service Request Record</p>
              <p className="text-[8px] font-mono mt-0.5">ID: {request.id}</p>
              <div className="w-1/3 mx-auto border-b border-gray-200 mt-2"></div>
            </div>

            <div className="flex flex-col items-center print-qr">
              <div className="bg-white p-2 border border-gray-100">
                <QRCode
                  value={`${window.location.origin}/#/view/${request.id}`}
                  size={100}
                />
              </div>
              <p className="mt-2 text-[8px] font-bold text-black uppercase tracking-widest">
                SCAN TO VIEW DETAILS
              </p>
            </div>
          </div>

          {/* Screen Content (Records Details) */}
          <div className="print-hide space-y-6">
            <div className="mb-4">
              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DetailRow label="Request Date" value={request.request_date ? new Date(request.request_date).toLocaleDateString() : '-'} />
                <DetailRow label="Technician" value={request.technician_name} />
                <DetailRow label="Shop Name" value={request.shop_name} />
                <DetailRow label="Status" value={request.status} />
              </div>

              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailRow label="Name" value={request.customer_name} />
                  <DetailRow label="Phone" value={request.customer_phone} />
                  <DetailRow label="Email" value={request.customer_email} />
                  <DetailRow label="Address" value={request.customer_address} />
                </div>
              </div>

              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">Device Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailRow label="Brand" value={request.device_brand} />
                  <DetailRow label="Model" value={request.device_model} />
                  <DetailRow label="Serial Number" value={request.serial_number} />
                  <DetailRow label="OS" value={request.operating_system} />
                  <div className="md:col-span-3">
                    <DetailRow label="Accessories" value={request.accessories_received || 'None'} />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">Problem Description</h3>
                <p className="text-sm bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{request.problem_description}</p>
              </div>

              {(request.fault_found || request.repair_action) && (
                <div className="mt-8 border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Diagnosis & Repair</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailRow label="Fault Found" value={request.fault_found} />
                    <DetailRow label="Repair Action" value={request.repair_action} />
                    <DetailRow label="Parts Used" value={request.parts_used} />
                    <DetailRow label="Diagnosis Date" value={request.diagnosis_date ? new Date(request.diagnosis_date).toLocaleDateString() : '-'} />
                  </div>
                </div>
              )}

              <div className="mt-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">Cost Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <DetailRow label="Service Charge" value={`₦${(request.service_charge || 0).toLocaleString()}`} />
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <DetailRow label="Parts Cost" value={`₦${(request.parts_cost || 0).toLocaleString()}`} />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <DetailRow label="Total Cost" value={`₦${(request.total_cost || 0).toLocaleString()}`} />
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <DetailRow label="Deposit Paid" value={`₦${(request.deposit_paid || 0).toLocaleString()}`} />
                  </div>
                  <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <DetailRow label="Balance" value={`₦${(request.balance || 0).toLocaleString()}`} />
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <DetailRow label="Payment Status" value={request.payment_completed ? 'Completed' : 'Pending'} />
                  </div>
                </div>
              </div>

              {/* Screen-Only QR Code for convenience */}
              <div className="mt-12 pt-8 border-t text-center">
                <div className="inline-block p-4 bg-white rounded-xl shadow-sm border">
                  <QRCode
                    value={`${window.location.origin}/#/view/${request.id}`}
                    size={140}
                  />
                  <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Record QR Code</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
