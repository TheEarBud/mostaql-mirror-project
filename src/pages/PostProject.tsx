
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';

const PostProject = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const createProject = useCreateProject();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    skills: []
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to post a project');
      return;
    }

    try {
      const projectData = {
        client_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        project_type: formData.budgetType,
        budget_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        deadline: formData.deadline || null,
        skills_required: formData.skills
      };

      await createProject.mutateAsync(projectData);
      toast.success('Project posted successfully!');
      navigate('/projects');
    } catch (error) {
      console.error('Error posting project:', error);
      toast.error('Failed to post project. Please try again.');
    }
  };

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
    'Business',
    'Other'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'PHP', 'Java',
    'HTML/CSS', 'WordPress', 'Shopify', 'Figma', 'Photoshop',
    'Content Writing', 'SEO', 'Social Media Marketing', 'Data Analysis'
  ];

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('postProject.title')}</h1>
            <p className="text-gray-600">{t('postProject.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Title */}
            <Card>
              <CardHeader>
                <CardTitle>{t('postProject.projectTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('postProject.whatNeedDone')}</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Build a responsive e-commerce website"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">{t('projects.category')}</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('postProject.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('postProject.description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">{t('postProject.describeProject')}</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of your project..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-2 min-h-[120px]"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t('postProject.budgetTimeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>{t('postProject.budgetType')}</Label>
                    <RadioGroup 
                      value={formData.budgetType} 
                      onValueChange={(value) => setFormData({...formData, budgetType: value})}
                      className="mt-2"
                    >
                      <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">{t('postProject.fixedPrice')}</Label>
                      </div>
                      <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">{t('postProject.hourlyRate')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="budgetMin">
                        {formData.budgetType === 'fixed' ? t('postProject.projectBudget') : t('postProject.hourlyRateLabel')} (Min)
                      </Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        placeholder="e.g., 500"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({...formData, budgetMin: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">
                        {formData.budgetType === 'fixed' ? t('postProject.projectBudget') : t('postProject.hourlyRateLabel')} (Max)
                      </Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        placeholder="e.g., 1500"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({...formData, budgetMax: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline (Optional)</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle>{t('postProject.skillsRequired')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>{t('postProject.selectSkills')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {popularSkills.map((skill) => (
                      <div key={skill} className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Checkbox 
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                skills: [...formData.skills, skill]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                skills: formData.skills.filter(s => s !== skill)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={skill} className="text-sm">{skill}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                disabled={createProject.isPending}
              >
                {createProject.isPending ? t('common.loading') : t('postProject.submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostProject;
