
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FreelancersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');

  // Fetch real freelancers from database
  const { data: freelancers = [], isLoading } = useQuery({
    queryKey: ['freelancers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'freelancer')
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredFreelancers = freelancers.filter(freelancer => {
    const fullName = `${freelancer.first_name} ${freelancer.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         (freelancer.skills && freelancer.skills.some((skill: string) => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesLocation = location === 'all' || freelancer.location === location;
    return matchesSearch && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">Loading freelancers...</div>
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
          {filteredFreelancers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No freelancers found. Be the first to join our platform!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFreelancers.map((freelancer) => (
                <Card key={freelancer.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={freelancer.avatar_url} alt={`${freelancer.first_name} ${freelancer.last_name}`} />
                        <AvatarFallback>
                          {freelancer.first_name?.[0]}{freelancer.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {freelancer.first_name} {freelancer.last_name}
                        </h3>
                        <p className="text-blue-600 font-medium">{freelancer.bio || 'Professional Freelancer'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>New</span>
                          </div>
                          {freelancer.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {freelancer.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {freelancer.hourly_rate && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">${freelancer.hourly_rate}</div>
                          <div className="text-sm text-gray-600">/hour</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {freelancer.bio && (
                      <p className="text-gray-700 mb-4">{freelancer.bio}</p>
                    )}
                    
                    {freelancer.skills && freelancer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {freelancer.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
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
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FreelancersPage;
