
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentButtonProps {
  projectId: string;
  amount: number;
  isDisabled?: boolean;
  className?: string;
}

const PaymentButton = ({ projectId, amount, isDisabled = false, className }: PaymentButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to make a payment');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-project-payment', {
        body: { projectId, amount }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isDisabled || isLoading}
      className={`bg-green-600 hover:bg-green-700 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Pay ${amount} (Escrow)
    </Button>
  );
};

export default PaymentButton;
