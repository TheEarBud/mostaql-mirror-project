
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PayoutRequestDialog from './PayoutRequestDialog';

const FreelancerBalance = () => {
  const { user } = useAuth();
  
  const { data: balance, isLoading } = useQuery({
    queryKey: ['freelancer-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('freelancer_balances')
        .select('*')
        .eq('freelancer_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: payoutRequests } = useQuery({
    queryKey: ['payout-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading balance...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Freelancer Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${balance?.available_balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                ${balance?.pending_balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${balance?.total_earned?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <PayoutRequestDialog 
              availableBalance={balance?.available_balance || 0}
              triggerText="Request Payout"
            />
          </div>
        </CardContent>
      </Card>

      {payoutRequests && payoutRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payoutRequests.map((request) => (
                <div key={request.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">${request.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      {request.payment_method} • {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FreelancerBalance;
