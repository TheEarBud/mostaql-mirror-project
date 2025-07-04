import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Clock, DollarSign, Users, Calendar, Star, Send, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProposals, useCreateProposal } from '@/hooks/useProposals';
import ChatDialog from '@/components/ChatDialog';
import PaymentButton from '@/components/PaymentButton';
import ProjectMilestones from '@/components/ProjectMilestones';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [bidAmount, setBidAmount] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Check for payment status in URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your project is now live.');
      // Verify payment
      if (id) {
        supabase.functions.invoke('verify-payment', {
          body: { projectId: id }
        }).then(({ data, error }) => {
          if (error) {
            toast.error('Payment verification failed');
          } else if (data.success) {
            queryClient.invalidateQueries({ queryKey: ['project', id] });
          }
        });
      }
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled');
    }
  }, [searchParams, id, queryClient]);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:client_id (
            first_name,
            last_name,
            avatar_url,
            location,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Check payment status
  const { data: paymentInfo } = useQuery({
    queryKey: ['project-payment', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('project_payments')
        .select('*')
        .eq('project_id', id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id
  });

  // Use the proposals hook
  const { data: proposals = [] } = useProposals(id);
  const createProposalMutation = useCreateProposal();

  // Delete proposal mutation
  const deleteProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', id] });
      toast.success('Proposal deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete proposal');
    }
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      navigate('/projects');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    }
  });

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a proposal');
      navigate('/login');
      return;
    }

    if (!bidAmount || !bidDescription || !deliveryTime) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if project is paid
    if (project?.payment_status !== 'paid') {
      toast.error('This project payment is still pending. Proposals can only be submitted to paid projects.');
      return;
    }

    createProposalMutation.mutate({
      project_id: id!,
      freelancer_id: user.id,
      cover_letter: bidDescription,
      proposed_budget: parseFloat(bidAmount),
      delivery_time: parseInt(deliveryTime)
    }, {
      onSuccess: () => {
        setBidAmount('');
        setBidDescription('');
        setDeliveryTime('');
        toast.success('Proposal submitted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to submit proposal');
      }
    });
  };

  const handleDeleteProposal = (proposalId: string) => {
    deleteProposalMutation.mutate(proposalId);
  };

  const handleDeleteProject = () => {
    if (project) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">Loading project details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">Project not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  const budgetDisplay = project.budget_min && project.budget_max 
    ? `$${project.budget_min}-$${project.budget_max}`
    : project.budget_min 
    ? `$${project.budget_min}+`
    : 'Budget not specified';

  const isProjectOwner = user?.id === project.client_id;
  const isProjectPaid = project.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Status Banner */}
              {isProjectOwner && !isProjectPaid && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-yellow-800">Payment Required</h3>
                        <p className="text-yellow-700">
                          Complete the escrow payment to make your project live and start receiving proposals.
                        </p>
                      </div>
                      <PaymentButton 
                        projectId={project.id}
                        amount={project.budget_min || 0}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{project.title}</CardTitle>
                        {isProjectPaid && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid & Live
                          </Badge>
                        )}
                        {!isProjectPaid && (
                          <Badge variant="secondary">
                            Payment Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {budgetDisplay}
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.profiles?.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {proposals.length} proposals
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{project.category}</Badge>
                      {/* Chat button for freelancers to contact project owner */}
                      {user && !isProjectOwner && isProjectPaid && (
                        <ChatDialog
                          projectId={id!}
                          receiverId={project.client_id}
                          receiverName={`${project.profiles?.first_name} ${project.profiles?.last_name}`}
                          receiverAvatar={project.profiles?.avatar_url}
                          triggerText="Contact Client"
                        />
                      )}
                      {isProjectOwner && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete Project
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this project? This action cannot be undone and will also delete all proposals.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteProject}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Project Description</h3>
                      <div className="text-gray-700 whitespace-pre-line">{project.description}</div>
                    </div>
                    
                    {project.skills_required && project.skills_required.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.skills_required.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      Posted {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Proposal - only show if not project owner and project is paid */}
              {user && !isProjectOwner && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Proposal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!isProjectPaid ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">
                          This project is pending payment. Proposals can only be submitted once the client completes the escrow payment.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitProposal} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bidAmount">Your Bid Amount ($)</Label>
                            <Input
                              id="bidAmount"
                              type="number"
                              placeholder="Enter your bid"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="mt-2"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
                            <Input
                              id="deliveryTime"
                              type="number"
                              placeholder="e.g., 30"
                              value={deliveryTime}
                              onChange={(e) => setDeliveryTime(e.target.value)}
                              className="mt-2"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="bidDescription">Cover Letter</Label>
                          <Textarea
                            id="bidDescription"
                            placeholder="Describe your approach, experience, and why you're the best fit for this project..."
                            value={bidDescription}
                            onChange={(e) => setBidDescription(e.target.value)}
                            className="mt-2 min-h-[120px]"
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={createProposalMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {createProposalMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Existing Proposals - only show if project is paid */}
              {isProjectPaid && proposals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Proposals ({proposals.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {proposals.map((proposal) => (
                        <div key={proposal.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={proposal.profiles?.avatar_url} />
                              <AvatarFallback>
                                {proposal.profiles?.first_name?.[0]}{proposal.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">
                                    {proposal.profiles?.first_name} {proposal.profiles?.last_name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{proposal.profiles?.location}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-600">${proposal.proposed_budget}</div>
                                  <div className="text-sm text-gray-600">in {proposal.delivery_time} days</div>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{proposal.cover_letter}</p>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                  Submitted {new Date(proposal.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                  {/* Chat button - ONLY for project owner */}
                                  {isProjectOwner && (
                                    <ChatDialog
                                      projectId={id!}
                                      receiverId={proposal.freelancer_id}
                                      receiverName={`${proposal.profiles?.first_name} ${proposal.profiles?.last_name}`}
                                      receiverAvatar={proposal.profiles?.avatar_url}
                                      triggerText="Contact"
                                    />
                                  )}
                                  {/* Delete button for proposal owner */}
                                  {user?.id === proposal.freelancer_id && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete your proposal? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteProposal(proposal.id)}>
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Milestones - only show if project is paid */}
              {isProjectPaid && (
                <ProjectMilestones 
                  projectId={id!}
                  isClient={isProjectOwner}
                  freelancerId={proposals.length > 0 ? proposals[0]?.freelancer_id : undefined}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>About the Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={project.profiles?.avatar_url} />
                        <AvatarFallback>
                          {project.profiles?.first_name?.[0]}{project.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {project.profiles?.first_name} {project.profiles?.last_name}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location</span>
                        <span>{project.profiles?.location || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since</span>
                        <span>{new Date(project.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className={`font-semibold ${isProjectPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                          {isProjectPaid ? 'Live' : 'Pending Payment'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proposals</span>
                        <span className="font-semibold">{proposals.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posted</span>
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Escrow Protection Info */}
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Escrow Protected</h4>
                        <p className="text-sm text-green-700">
                          {isProjectPaid ? 
                            `$${project.budget_min} is securely held in escrow and will be released upon project completion.` :
                            'This project will be protected by escrow payment upon client payment.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProjectDetails;
