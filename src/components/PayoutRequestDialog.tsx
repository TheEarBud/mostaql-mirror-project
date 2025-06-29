
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface PayoutRequestDialogProps {
  availableBalance: number;
  triggerText: string;
}

const PayoutRequestDialog = ({ availableBalance, triggerText }: PayoutRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0 || amountNum > availableBalance) {
      toast.error('Invalid amount');
      return;
    }

    try {
      setIsLoading(true);
      
      const paymentDetails = paymentMethod === 'paypal' 
        ? { email: paypalEmail }
        : { bank_details: bankDetails };

      const { error } = await supabase.functions.invoke('request-payout', {
        body: {
          amount: amountNum,
          paymentMethod,
          paymentDetails
        }
      });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      setOpen(false);
      setAmount('');
      setPaymentMethod('');
      setPaypalEmail('');
      setBankDetails('');
      
      // Refresh balance and payout requests
      queryClient.invalidateQueries({ queryKey: ['freelancer-balance'] });
      queryClient.invalidateQueries({ queryKey: ['payout-requests'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payout request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (Available: ${availableBalance.toFixed(2)})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={availableBalance}
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'paypal' && (
            <div>
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your-paypal@email.com"
                required
              />
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div>
              <Label htmlFor="bankDetails">Bank Details</Label>
              <Textarea
                id="bankDetails"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Bank name, account number, routing number, etc."
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayoutRequestDialog;
