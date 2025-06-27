
import React, { useState } from 'react';
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

const PostProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: 'fixed',
    budget: '',
    timeframe: '',
    skills: [],
    attachments: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project submission:', formData);
    // TODO: Implement Supabase data submission
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Post a New Project</h1>
            <p className="text-gray-600">Tell us what you need done and receive competitive proposals from talented freelancers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Title */}
            <Card>
              <CardHeader>
                <CardTitle>Project Title</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">What do you need done?</Label>
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
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category" />
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
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Describe your project in detail</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of your project, including requirements, expectations, and any specific instructions..."
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
                <CardTitle>Budget & Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Budget Type</Label>
                    <RadioGroup 
                      value={formData.budgetType} 
                      onValueChange={(value) => setFormData({...formData, budgetType: value})}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Fixed Price - Pay a set amount for the entire project</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">Hourly Rate - Pay per hour of work</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">
                        {formData.budgetType === 'fixed' ? 'Project Budget ($)' : 'Hourly Rate ($)'}
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder={formData.budgetType === 'fixed' ? 'e.g., 1500' : 'e.g., 25'}
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeframe">Project Duration</Label>
                      <Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1-week">Less than 1 week</SelectItem>
                          <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                          <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                          <SelectItem value="1-2-months">1-2 months</SelectItem>
                          <SelectItem value="2-3-months">2-3 months</SelectItem>
                          <SelectItem value="more-than-3-months">More than 3 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Select the skills needed for this project:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {popularSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
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
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Post Project
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
