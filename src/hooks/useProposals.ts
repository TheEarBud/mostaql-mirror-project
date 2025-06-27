
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProposals = (projectId?: string) => {
  return useQuery({
    queryKey: ['proposals', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles:freelancer_id (
            first_name,
            last_name,
            avatar_url,
            location
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });
};

export const useCreateProposal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposalData: {
      project_id: string;
      freelancer_id: string;
      cover_letter: string;
      proposed_budget: number;
      delivery_time: number;
    }) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert([proposalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals', data.project_id] });
    }
  });
};
