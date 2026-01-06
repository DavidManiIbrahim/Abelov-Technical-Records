import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serviceRequestAPI } from '@/lib/api';
import { ServiceRequest } from '@/types/database';
import { ArrowLeft, Loader2, Printer, Edit, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import abelovLogo from '@/assets/abelov-logo.png';
import { usePaystackPayment } from 'react-paystack';



const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_3b90c2da7d451e39902743a32258433b014f4f7a'; // Placeholder if not set

// const PaymentSection = ({ request, onPaymentSuccess }: { request: ServiceRequest; onPaymentSuccess: () => void }) => {
//   const config = {
//     reference: (new Date()).getTime().toString(),
//     email: request.customer_email || "customer@abelov.com",
//     amount: Math.ceil(request.balance * 100), // Amount in kobo
//     publicKey: PAYSTACK_PUBLIC_KEY,
//     currency: 'NGN',
//   };

//   const initializePayment = usePaystackPayment(config);

//   const onSuccess = async (reference: any) => {
//     try {
//       await serviceRequestAPI.recordPayment(request.id, request.balance, reference.reference);
//       toast({
//         title: "Payment Successful",
//         description: "Your payment has been recorded.",
//       });
//       onPaymentSuccess();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Payment successful but failed to update record. Please contact support.",
//         variant: "destructive",
//       });
//       console.error(error);
//     }
//   };

//   const onClose = () => {
//     // console.log('Payment closed');
//   };

//   return (
//     <div className="mt-4">
//       <Button
//         onClick={() => initializePayment({ onSuccess, onClose })}
//         className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
//       >
//         <CreditCard className="w-4 h-4 mr-2" />
//         Pay Balance (₦{(request.balance || 0).toLocaleString()})
//       </Button>
//     </div>
//   );
// };


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
            padding: 1.5cm !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .print-header {
             margin-bottom: 2rem !important;
          }
          .print-qr {
             margin-top: 2rem !important;
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

        {/* Main Content Area / Printable Content */}
        <div ref={printRef} className="print-container">

          {/* Print-Only Header (Logo + Title) */}
          <div className="hidden print:block print-header">
            <img src={abelovLogo} alt="Abelov Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold text-black">Abelov Technical Records</h1>
            <p className="text-xl text-gray-600 mt-2">Service Request Record</p>
            <p className="text-lg font-mono mt-1">ID: {request.id}</p>
            <div className="w-1/2 mx-auto border-b-2 border-gray-200 mt-6"></div>
          </div>

          {/* Screen-Only Info Card */}
          <div className="print-hide w-full mb-8">
            <Card className="p-10 text-center bg-muted/30 border-dashed">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Printer className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-primary">Ready to Print</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                The service request tag is ready. Use the <strong>Print</strong> button to generate a physical tag with the QR code.
              </p>
            </Card>
          </div>

          {/* QR Code Section (Visible on both Screen and Print) */}
          <div className="flex flex-col items-center print-qr">
            <div className="bg-white p-6 rounded-2xl border-4 border-primary/5 shadow-xl print:shadow-none print:border-0">
              <QRCode
                value={`${window.location.origin}/#/view/${request.id}`}
                size={220}
              />
            </div>
            <p className="mt-6 text-sm font-medium text-muted-foreground print:text-black print:font-bold">
              SCAN TO VIEW RECORD DETAILS
            </p>
          </div>
        </div>

        {/* Mobile Action Buttons (Print Hide) */}
        <div className="md:hidden flex flex-col gap-2 mt-8 print-hide">
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
      </div>
    </div>
  );
}
