import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PETROLORD_BRANDING } from '@/components/branding/BrandingGuide';

const PetroLordLogo = ({ className, linkTo = "/dashboard", collapsed = false, size = "md" }) => {
  // Size mapping
  const heightClass = {
    sm: "h-6",   // 24px - Compact
    md: "h-10",  // 40px - Standard (TopBar)
    lg: "h-16",  // 64px - Login/Heroes
    xl: "h-24",  // 96px - Reports/Splash
  }[size] || "h-10";

  return (
    <Link 
      to={linkTo} 
      className={cn(
        "flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none select-none", 
        className
      )}
      aria-label={`${PETROLORD_BRANDING.companyName} Home`}
    >
      <img
        src={PETROLORD_BRANDING.logoUrl}
        alt={PETROLORD_BRANDING.companyName}
        className={cn(
          "w-auto object-contain", 
          collapsed ? "h-8" : heightClass
        )}
      />
    </Link>
  );
};

export default PetroLordLogo;