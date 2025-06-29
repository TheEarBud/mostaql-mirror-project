
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import PaymentButton from '@/components/PaymentButton';

const PostProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    skills_required: [] as string[],
    project_type: 'fixed'
  });
  
  const [skillInput, setSkillInput] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design & Creative',
    'Writing & Content',
    'Digital Marketing',
    'Data Science',
    'Translation',
    'Video & Animation',
    'Music & Audio',
    'Business'
  ];

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to post a project');
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budgetMin = parseFloat(formData.budget_min);
    if (!budgetMin || budgetMin <= 0) {
      toast.error('Please enter a valid minimum budget');
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget_min: budgetMin,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        deadline: formData.deadline || null,
        skills_required: formData.skills_required,
        project_type: formData.project_type,
        client_id: user.id,
        payment_required: true,
        payment_status: 'unpaid'
      };

      const result = await createProjectMutation.mutateAsync(projectData);
      setCreatedProjectId(result.id);
      toast.success('Project created! Please complete the payment to make it live.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  if (createdProjectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">
                  Project Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-gray-600">
                  Your project has been created. To make it live and start receiving proposals, 
                  please complete the escrow payment. This protects both you and the freelancers.
                </p>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Payment Details</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    ${formData.budget_min}
                  </div>
                  <p className="text-sm text-gray-600">
                    This amount will be held in escrow and released to the freelancer upon project completion and your approval.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <PaymentButton 
                    projectId={createdProjectId}
                    amount={parseFloat(formData.budget_min)}
                    className="w-full"
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/project/${createdProjectId}`)}
                  >
                    View Project (Payment Required)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a Project</h1>
            <p className="text-gray-600">
              Create a detailed project description to attract the best freelancers
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a clear, descriptive title"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project in detail, including requirements, expectations, and deliverables"
                    className="mt-2 min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="project_type">Project Type</Label>
                    <Select value={formData.project_type} onValueChange={(value) => handleInputChange('project_type', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budget_min">Minimum Budget ($) *</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => handleInputChange('budget_min', e.target.value)}
                      placeholder="100"
                      className="mt-2"
                      min="1"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      This amount will be held in escrow
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="budget_max">Maximum Budget ($)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => handleInputChange('budget_max', e.target.value)}
                      placeholder="500"
                      className="mt-2"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline">Project Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Required Skills</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills_required.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Escrow Protection</h3>
                  <p className="text-sm text-yellow-700">
                    Your minimum budget amount will be securely held in escrow. 
                    It will only be released to the freelancer upon your approval of the completed work.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? 'Creating Project...' : 'Create Project & Proceed to Payment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostProject;
