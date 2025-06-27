
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, Edit, Plus, Briefcase, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    hourly_rate: '',
    skills: '',
    website_url: '',
    phone: ''
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  const handleEdit = () => {
    if (profile) {
      setEditFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        website_url: profile.website_url || '',
        phone: profile.phone || ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    const skillsArray = editFormData.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    updateProfileMutation.mutate({
      first_name: editFormData.first_name,
      last_name: editFormData.last_name,
      bio: editFormData.bio,
      location: editFormData.location,
      hourly_rate: editFormData.hourly_rate ? parseFloat(editFormData.hourly_rate) : null,
      skills: skillsArray.length > 0 ? skillsArray : null,
      website_url: editFormData.website_url,
      phone: editFormData.phone,
      updated_at: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">Loading profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">Please login to view your profile</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
                    <AvatarFallback className="text-2xl">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">
                    {profile.first_name} {profile.last_name}
                  </CardTitle>
                  <p className="text-blue-600 font-medium capitalize">{profile.user_type}</p>
                  {profile.location && (
                    <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.hourly_rate && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">${profile.hourly_rate}</div>
                      <div className="text-sm text-gray-600">per hour</div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={isEditing ? () => setIsEditing(false) : handleEdit} 
                    className="w-full"
                    variant={isEditing ? "outline" : "default"}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* About Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.bio ? (
                        <p className="text-gray-700">{profile.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">No bio added yet. Click "Edit Profile" to add one.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No skills added yet. Click "Edit Profile" to add your skills.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Email:</strong> {profile.email}</div>
                      {profile.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
                      {profile.website_url && (
                        <div>
                          <strong>Website:</strong> 
                          <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                            {profile.website_url}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={editFormData.first_name}
                                onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={editFormData.last_name}
                                onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editFormData.bio}
                              onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                              className="mt-2"
                              rows={4}
                              placeholder="Tell us about yourself..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={editFormData.location}
                                onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                                className="mt-2"
                                placeholder="City, Country"
                              />
                            </div>
                            <div>
                              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                              <Input
                                id="hourlyRate"
                                type="number"
                                value={editFormData.hourly_rate}
                                onChange={(e) => setEditFormData({...editFormData, hourly_rate: e.target.value})}
                                className="mt-2"
                                placeholder="50"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                              id="skills"
                              value={editFormData.skills}
                              onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})}
                              className="mt-2"
                              placeholder="React, Node.js, TypeScript"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                className="mt-2"
                                placeholder="+1234567890"
                              />
                            </div>
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                value={editFormData.website_url}
                                onChange={(e) => setEditFormData({...editFormData, website_url: e.target.value})}
                                className="mt-2"
                                placeholder="https://yourwebsite.com"
                              />
                            </div>
                          </div>

                          <Button 
                            onClick={handleSave} 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">Click "Edit Profile" to update your information</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
