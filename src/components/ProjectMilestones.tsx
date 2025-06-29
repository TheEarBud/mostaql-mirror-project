
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProjectMilestonesProps {
  projectId: string;
  isClient: boolean;
  freelancerId?: string;
}

const ProjectMilestones = ({ projectId, isClient, freelancerId }: ProjectMilestonesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select(`
          *,
          profiles:freelancer_id (
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const approveMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, amount, freelancerId }: { milestoneId: string, amount: number, freelancerId: string }) => {
      // Update milestone status
      const { error: updateError } = await supabase
        .from('project_milestones')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (updateError) throw updateError;

      // Release escrow funds
      const { error: escrowError } = await supabase.functions.invoke('release-escrow', {
        body: {
          projectId,
          freelancerId,
          amount
        }
      });

      if (escrowError) throw escrowError;
    },
    onSuccess: () => {
      toast.success('Milestone approved and payment released!');
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve milestone');
    }
  });

  const handleApproveMilestone = (milestone: any) => {
    approveMilestoneMutation.mutate({
      milestoneId: milestone.id,
      amount: milestone.amount,
      freelancerId: milestone.freelancer_id
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading milestones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones && milestones.length > 0 ? (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${milestone.amount.toFixed(2)}
                    </div>
                    <Badge variant={
                      milestone.status === 'approved' ? 'default' :
                      milestone.status === 'submitted' ? 'secondary' :
                      milestone.status === 'rejected' ? 'destructive' :
                      'outline'
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                </div>
                
                {milestone.status === 'submitted' && isClient && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleApproveMilestone(milestone)}
                      disabled={approveMilestoneMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve & Release Payment
                    </Button>
                  </div>
                )}
                
                {milestone.client_feedback && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium">Client Feedback:</div>
                    <div className="text-sm text-gray-700">{milestone.client_feedback}</div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(milestone.created_at).toLocaleDateString()}
                  {milestone.approved_at && ` • Approved: ${new Date(milestone.approved_at).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No milestones created yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMilestones;
