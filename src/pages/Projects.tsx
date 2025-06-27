
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
import { useProjects } from '@/hooks/useProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { data: projects, isLoading } = useProjects();
  const { t, isRTL } = useLanguage();

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

  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || project.category === category;
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('projects.title')}</h1>
            <p className="text-gray-600">{t('projects.subtitle')}</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('projects.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {t('projects.search')}
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
                      <div className={`flex items-center gap-4 mt-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="h-4 w-4" />
                          {project.budget_min && project.budget_max 
                            ? `$${project.budget_min}-$${project.budget_max}`
                            : project.budget_min 
                            ? `$${project.budget_min}`
                            : 'Budget not specified'
                          }
                        </div>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="h-4 w-4" />
                          {project.deadline 
                            ? new Date(project.deadline).toLocaleDateString()
                            : 'No deadline'
                          }
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  
                  {project.skills_required && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills_required.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className={`flex items-center gap-4 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Users className="h-4 w-4" />
                        {project.proposals?.length || 0} {t('projects.proposals')}
                      </div>
                      <span>
                        {t('projects.posted')} {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Link to={`/project/${project.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        {t('projects.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Projects;
