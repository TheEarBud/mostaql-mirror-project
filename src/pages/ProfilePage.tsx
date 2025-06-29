
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
import { User, Settings, Briefcase, Star, Edit, Plus, X, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FreelancerBalance from '@/components/FreelancerBalance';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    phone: '',
    website_url: '',
    hourly_rate: '',
    skills: [] as string[]
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        website_url: profile.website_url || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        skills: profile.skills || []
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user?.id);
      
      if (error) throw error;
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData = {
      ...formData,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      updated_at: new Date().toISOString()
    };
    
    updateProfileMutation.mutate(updatedData);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              {profile?.user_type === 'freelancer' && (
                <TabsTrigger value="balance" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Balance
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="City, Country"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website_url">Website</Label>
                          <Input
                            id="website_url"
                            value={formData.website_url}
                            onChange={(e) => handleInputChange('website_url', e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="mt-2"
                          />
                        </div>
                        {profile?.user_type === 'freelancer' && (
                          <div>
                            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                            <Input
                              id="hourly_rate"
                              type="number"
                              value={formData.hourly_rate}
                              onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                              placeholder="25"
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>

                      {profile?.user_type === 'freelancer' && (
                        <div>
                          <Label htmlFor="skills">Skills</Label>
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
                          
                          {formData.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {formData.skills.map((skill) => (
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
                      )}

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>
                            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold">
                            {profile?.first_name} {profile?.last_name}
                          </h2>
                          <p className="text-gray-600 capitalize">
                            {profile?.user_type}
                          </p>
                          {profile?.location && (
                            <p className="text-gray-600">{profile.location}</p>
                          )}
                          {profile?.hourly_rate && (
                            <p className="text-green-600 font-semibold">
                              ${profile.hourly_rate}/hour
                            </p>
                          )}
                        </div>
                      </div>

                      {profile?.bio && (
                        <div>
                          <h3 className="font-semibold mb-2">About</h3>
                          <p className="text-gray-700">{profile.bio}</p>
                        </div>
                      )}

                      {profile?.skills && profile.skills.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {profile?.phone && (
                          <div>
                            <span className="font-medium">Phone: </span>
                            {profile.phone}
                          </div>
                        )}
                        {profile?.website_url && (
                          <div>
                            <span className="font-medium">Website: </span>
                            <a 
                              href={profile.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {profile.website_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {profile?.user_type === 'freelancer' && (
              <TabsContent value="balance">
                <FreelancerBalance />
              </TabsContent>
            )}

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Account Type</h3>
                      <p className="text-gray-600 capitalize">{profile?.user_type}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <Button 
                      onClick={signOut}
                      variant="destructive"
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
