import React from 'react';
import { Mail, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicFooter() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleNavClick = (e, id) => {
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  return <footer className="bg-[#151525] border-t border-[#3a3a5a] text-[#b0b0c0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-white text-xl font-bold">
              <img src="https://horizons-cdn.hostinger.com/b49b4b29-7343-48e8-91d9-c4b871e9bda0/ae5f1d1634568560d86caaa352c14e62.png" alt="Petrolord Logo" className="h-8 w-auto" />
              Petrolord HSE
            </div>
            <p className="text-sm text-[#7a7a9a] max-w-sm">The HSE component of the digital operating system for the modern energy enterprise. Ensuring safety, compliance, and efficiency across all operations.</p>
          </div>

          {/* Links Column 1: Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/#features" 
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="hover:text-[#FFC107] transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/#benefits" 
                  onClick={(e) => handleNavClick(e, 'benefits')}
                  className="hover:text-[#FFC107] transition-colors"
                >
                  Benefits
                </Link>
              </li>
              <li>
                <Link 
                  to="/#pricing" 
                  onClick={(e) => handleNavClick(e, 'pricing')}
                  className="hover:text-[#FFC107] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  to="/#faq" 
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="hover:text-[#FFC107] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Legal & Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-[#FFC107] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-[#FFC107] transition-colors">Terms of Service</Link></li>
              <li><Link to="/security" className="hover:text-[#FFC107] transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@petrolord.com" className="flex items-center gap-2 hover:text-[#FFC107] transition-colors">
                  <Mail className="h-4 w-4 text-[#FFC107]" />
                  support@petrolord.com
                </a>
              </li>
              <li>
                <a href="https://petrolord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#FFC107] transition-colors">
                  <Globe className="h-4 w-4 text-[#FFC107]" />
                  petrolord.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3a3a5a] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#7a7a9a]">
          <p>© 2026 Lordsway Energy. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>;
}