import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';

interface CreditsAnalyticsProps {
  onBack: () => void;
}

export default function CreditsAnalytics({ onBack }: CreditsAnalyticsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Credits
        </Button>
      </div>
      
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Credits Analytics</h2>
          <p className="text-muted-foreground">Analytics dashboard coming soon</p>
        </div>
      </div>
    </div>
  );
}
