import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import PetroLordLogo from '@/components/layout/PetroLordLogo';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { session } = useAuth() || {}; 
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Features', href: '/#features', id: 'features' },
    { name: 'Benefits', href: '/#benefits', id: 'benefits' },
    { name: 'Pricing', href: '/#pricing', id: 'pricing' },
    { name: 'FAQ', href: '/#faq', id: 'faq' },
  ];

  // ScrollSpy to update active link based on viewport
  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -50% 0px' } // Offset for fixed header
    );

    navLinks.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isHomePage]);

  const handleNavClick = (e, link) => {
    setIsOpen(false);
    
    // If we are on the homepage and clicking a section link
    if (isHomePage) {
      e.preventDefault();
      const element = document.getElementById(link.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without reload to maintain history
        window.history.pushState(null, '', link.href);
        setActiveSection(link.id);
      }
    }
    // If not on homepage, Link component handles navigation to /#id
    // HomePage useEffect will handle the scroll after mount
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#1a1a2e]/90 backdrop-blur-md border-b border-[#3a3a5a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer">
            <PetroLordLogo linkTo="/" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    activeSection === link.id
                      ? "text-[#FFC107]"
                      : "text-[#b0b0c0] hover:text-[#FFC107]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-[#FFC107] hover:bg-[#252541]">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold shadow-lg shadow-yellow-500/20">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#b0b0c0] hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1f1f35] border-t border-[#3a3a5a]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                  activeSection === link.id
                    ? "text-[#FFC107]"
                    : "text-[#b0b0c0] hover:text-[#FFC107]"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3 px-3">
              {session ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full border-[#3a3a5a] text-white hover:bg-[#3a3a5a] justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold justify-center">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}