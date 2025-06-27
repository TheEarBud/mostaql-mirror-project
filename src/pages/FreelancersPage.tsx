
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FreelancersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');

  // Mock data - replace with actual data from Supabase
  const freelancers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Full Stack Developer',
      avatar: '/placeholder.svg',
      rating: 4.9,
      reviews: 127,
      hourlyRate: 45,
      location: 'United States',
      description: 'Experienced developer with 5+ years in React, Node.js, and cloud technologies. Specialized in building scalable web applications.',
      skills: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript'],
      completedProjects: 89,
      responseTime: '2 hours',
      availability: 'Available now'
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      title: 'UI/UX Designer',
      avatar: '/placeholder.svg',
      rating: 4.8,
      reviews: 94,
      hourlyRate: 35,
      location: 'Egypt',
      description: 'Creative designer with expertise in mobile and web design. Passionate about creating user-centered experiences.',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      completedProjects: 156,
      responseTime: '1 hour',
      availability: 'Available now'
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      title: 'Digital Marketing Specialist',
      avatar: '/placeholder.svg',
      rating: 4.7,
      reviews: 73,
      hourlyRate: 30,
      location: 'Spain',
      description: 'Marketing expert with proven track record in SEO, social media, and content marketing. Helped 50+ businesses grow online.',
      skills: ['SEO', 'Google Ads', 'Social Media', 'Content Marketing', 'Analytics'],
      completedProjects: 112,
      responseTime: '3 hours',
      availability: 'Available in 2 days'
    },
    {
      id: 4,
      name: 'David Chen',
      title: 'Data Scientist',
      avatar: '/placeholder.svg',
      rating: 4.9,
      reviews: 56,
      hourlyRate: 55,
      location: 'Canada',
      description: 'PhD in Computer Science with expertise in machine learning, data analysis, and statistical modeling.',
      skills: ['Python', 'R', 'Machine Learning', 'TensorFlow', 'SQL'],
      completedProjects: 67,
      responseTime: '4 hours',
      availability: 'Available now'
    }
  ];

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = location === 'all' || freelancer.location === location;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Freelancers</h1>
            <p className="text-gray-600">Discover talented professionals ready to work on your project</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search freelancers..."
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
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>

          {/* Freelancers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                      <AvatarFallback>{freelancer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{freelancer.name}</h3>
                      <p className="text-blue-600 font-medium">{freelancer.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{freelancer.rating}</span>
                          <span>({freelancer.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {freelancer.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${freelancer.hourlyRate}</div>
                      <div className="text-sm text-gray-600">/hour</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{freelancer.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {freelancer.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{freelancer.completedProjects}</div>
                      <div className="text-gray-600">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{freelancer.responseTime}</div>
                      <div className="text-gray-600">Response time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{freelancer.availability}</div>
                      <div className="text-gray-600">Availability</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Contact
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
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

export default FreelancersPage;
