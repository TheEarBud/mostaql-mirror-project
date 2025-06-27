import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, DollarSign, Users, Calendar, Star, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProjectDetails = () => {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState('');
  const [bidDescription, setBidDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Mock project data - replace with actual data from Supabase
  const project = {
    id: 1,
    title: 'E-commerce Website Development',
    description: `Looking for a skilled developer to build a modern e-commerce website with the following requirements:

    - Responsive design that works on all devices
    - Product catalog with search and filtering
    - Shopping cart and checkout functionality
    - Payment integration (Stripe/PayPal)
    - Admin panel for inventory management
    - User authentication and profiles
    - Order tracking system
    - SEO optimization

    The design should be modern, clean, and user-friendly. We have wireframes ready and will provide all necessary assets.

    Please include examples of similar projects in your proposal.`,
    budget: '$1,500-$3,000',
    budgetType: 'fixed',
    timeframe: '2-3 months',
    location: 'Remote',
    skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
    proposals: 15,
    postedDate: '2 days ago',
    category: 'Web Development',
    client: {
      name: 'TechCorp Solutions',
      avatar: '/placeholder.svg',
      rating: 4.8,
      reviews: 23,
      location: 'United States',
      memberSince: 'January 2022',
      totalSpent: '$50,000+',
      projectsPosted: 45
    }
  };

  const proposals = [
    {
      id: 1,
      freelancer: {
        name: 'Sarah Johnson',
        avatar: '/placeholder.svg',
        rating: 4.9,
        reviews: 127,
        location: 'United States'
      },
      bidAmount: 2500,
      deliveryTime: '6 weeks',
      description: 'I have 5+ years of experience building e-commerce websites with React and Node.js. I can deliver exactly what you need.',
      submittedDate: '1 day ago'
    },
    {
      id: 2,
      freelancer: {
        name: 'Ahmed Hassan',
        avatar: '/placeholder.svg',
        rating: 4.8,
        reviews: 94,
        location: 'Egypt'
      },
      bidAmount: 1800,
      deliveryTime: '8 weeks',
      description: 'I specialize in e-commerce development and have built 20+ similar projects. I offer competitive pricing and quality work.',
      submittedDate: '2 days ago'
    }
  ];

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Proposal submitted:', { bidAmount, bidDescription, deliveryTime });
    // TODO: Implement Supabase proposal submission
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
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
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.proposals} proposals
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Project Description</h3>
                      <div className="text-gray-700 whitespace-pre-line">{project.description}</div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Skills Required</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Posted {project.postedDate}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Proposal */}
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Proposal</CardTitle>
                </CardHeader>
                <CardContent>
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
                        <Label htmlFor="deliveryTime">Delivery Time</Label>
                        <Input
                          id="deliveryTime"
                          placeholder="e.g., 4 weeks"
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
                    
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Proposals */}
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
                            <AvatarImage src={proposal.freelancer.avatar} />
                            <AvatarFallback>
                              {proposal.freelancer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{proposal.freelancer.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{proposal.freelancer.rating}</span>
                                    <span>({proposal.freelancer.reviews} reviews)</span>
                                  </div>
                                  <span>•</span>
                                  <span>{proposal.freelancer.location}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">${proposal.bidAmount}</div>
                                <div className="text-sm text-gray-600">in {proposal.deliveryTime}</div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{proposal.description}</p>
                            <div className="text-sm text-gray-600">
                              Submitted {proposal.submittedDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                        <AvatarImage src={project.client.avatar} />
                        <AvatarFallback>TC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{project.client.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{project.client.rating}</span>
                          <span>({project.client.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location</span>
                        <span>{project.client.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since</span>
                        <span>{project.client.memberSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total spent</span>
                        <span className="text-green-600 font-semibold">{project.client.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projects posted</span>
                        <span>{project.client.projectsPosted}</span>
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
                        <span className="text-gray-600">Proposals</span>
                        <span className="font-semibold">{project.proposals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average bid</span>
                        <span className="font-semibold">$2,150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posted</span>
                        <span>{project.postedDate}</span>
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
