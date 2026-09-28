import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { PublicBrandBar } from '@/components/public/PublicPage';

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

  // Batch 3C: the ink brand bar of the public frame (PublicBrandBar, the
  // Petrolord HSE wordmark) with the section links from md up, the sign-in
  // controls, and a phone menu that drops below the bar.
  const linkClass = (id) => cn(
    'rounded-sm text-sm font-medium transition-colors',
    activeSection === id ? 'text-pl-accent-text' : 'text-pl-muted hover:text-pl-text',
  );

  return (
    <PublicBrandBar>
      <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            onClick={(e) => handleNavClick(e, link)}
            aria-current={activeSection === link.id ? 'true' : undefined}
            className={linkClass(link.id)}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        {session ? (
          <Button onClick={() => navigate('/dashboard')} className="font-semibold">
            <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" /> Go to Dashboard
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" className="text-pl-text">
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" aria-hidden="true" /> Login</Link>
            </Button>
            <Button asChild variant="accent" className="font-semibold">
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className="text-pl-text md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </Button>

      {isOpen && (
        <div
          data-testid="public-mobile-menu"
          className="absolute inset-x-0 top-full border-b border-pl-border bg-pl-surface shadow-pl-lg md:hidden"
        >
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn('block px-2 py-2 text-base', linkClass(link.id))}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              {session ? (
                <Button onClick={() => navigate('/dashboard')} className="w-full justify-center">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild variant="accent" className="w-full justify-center font-semibold">
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicBrandBar>
  );
}
