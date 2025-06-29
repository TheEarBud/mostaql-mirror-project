
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { useState } from 'react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleMessagesClick = () => {
    if (user) {
      navigate('/messages');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            farz.pw
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link to="/projects" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('nav.browseProjects')}
            </Link>
            <Link to="/freelancers" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('nav.findFreelancers')}
            </Link>
            <Link to="/post-project" className="text-gray-700 hover:text-blue-600 transition-colors">
              {t('nav.postProject')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <LanguageToggle />
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={handleMessagesClick}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Link to="/profile">
                  <Button variant="outline" size="sm">
                    {t('nav.profile')}
                  </Button>
                </Link>
                <Button onClick={handleSignOut} size="sm" variant="ghost">
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/projects"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.browseProjects')}
              </Link>
              <Link
                to="/freelancers"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.findFreelancers')}
              </Link>
              <Link
                to="/post-project"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.postProject')}
              </Link>
              {user && (
                <Button 
                  variant="ghost" 
                  className="justify-start py-2"
                  onClick={() => {
                    handleMessagesClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
