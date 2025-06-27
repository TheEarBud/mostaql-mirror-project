
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [budget, setBudget] = useState('all');

  // Mock data - replace with actual data from Supabase
  const projects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      description: 'Looking for a skilled developer to build a modern e-commerce website with payment integration and admin panel.',
      budget: '$1,500-$3,000',
      timeframe: '2-3 months',
      location: 'Remote',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      proposals: 15,
      postedDate: '2 days ago',
      category: 'Web Development'
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Design',
      description: 'Need a creative designer for a fitness tracking mobile app. Must have experience with health apps.',
      budget: '$800-$1,200',
      timeframe: '3-4 weeks',
      location: 'Remote',
      skills: ['Figma', 'Adobe XD', 'Mobile Design', 'Prototyping'],
      proposals: 8,
      postedDate: '1 day ago',
      category: 'Design'
    },
    {
      id: 3,
      title: 'Content Marketing Strategy',
      description: 'Seeking an experienced content marketer to develop and execute a comprehensive content strategy.',
      budget: '$500-$1,000',
      timeframe: '1 month',
      location: 'Remote',
      skills: ['Content Strategy', 'SEO', 'Social Media', 'Analytics'],
      proposals: 12,
      postedDate: '3 days ago',
      category: 'Marketing'
    },
    {
      id: 4,
      title: 'Python Data Analysis Project',
      description: 'Analyze customer data to identify trends and create visualizations. Experience with pandas and matplotlib required.',
      budget: '$300-$600',
      timeframe: '2 weeks',
      location: 'Remote',
      skills: ['Python', 'Pandas', 'Matplotlib', 'Data Science'],
      proposals: 6,
      postedDate: '5 hours ago',
      category: 'Data Science'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || project.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Projects</h1>
            <p className="text-gray-600">Find your next opportunity from thousands of projects</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                </SelectContent>
              </Select>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="under-500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500-$1,000</SelectItem>
                  <SelectItem value="1000-3000">$1,000-$3,000</SelectItem>
                  <SelectItem value="over-3000">Over $3,000</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link to={`/project/${project.id}`}>
                        <CardTitle className="text-xl text-blue-600 hover:text-blue-800 transition-colors">
                          {project.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {project.budget}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {project.timeframe}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.proposals} proposals
                      </div>
                      <span>Posted {project.postedDate}</span>
                    </div>
                    <Link to={`/project/${project.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Projects;
