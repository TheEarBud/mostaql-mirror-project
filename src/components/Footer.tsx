
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">farz.pw</h3>
            <p className="text-gray-400 mb-4">
              The world's largest freelancing and crowdsourcing marketplace.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/post-project" className="hover:text-white transition-colors">Post a Project</Link></li>
              <li><Link to="/freelancers" className="hover:text-white transition-colors">Find Freelancers</Link></li>
              <li><Link to="/help-center" className="hover:text-white transition-colors">How it Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Freelancers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/projects" className="hover:text-white transition-colors">Browse Projects</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/help-center" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 farz.pw. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
