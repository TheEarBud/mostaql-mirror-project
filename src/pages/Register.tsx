
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('freelancer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signUp } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: userType
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-blue-600">
            farz.pw
          </Link>
          <p className="text-gray-600 mt-2">{t('auth.joinCommunity')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('auth.createAccount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>{t('auth.workAs')}</Label>
                <RadioGroup value={userType} onValueChange={setUserType} className="flex space-x-6 rtl:space-x-reverse">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <Label htmlFor="freelancer">{t('auth.workAsFreelancer')}</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client">{t('auth.hireFreelancers')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                  <div className="relative">
                    <User className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder={t('auth.firstName')}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={t('auth.lastName')}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-3 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('auth.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center text-sm">
                <input type="checkbox" className={`${isRTL ? 'ml-2' : 'mr-2'}`} required />
                <span className="text-gray-600">
                  {t('auth.agreeTerms')}
                </span>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? t('common.loading') : t('auth.createAccount')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
