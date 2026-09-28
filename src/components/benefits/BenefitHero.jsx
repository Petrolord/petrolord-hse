import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function BenefitHero({ title, subtitle, image, icon: Icon }) {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-pl-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pl-primary/10 text-pl-primary-text border border-pl-primary/30 mb-6">
              {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
              <span className="text-sm font-semibold uppercase tracking-wider">Feature Spotlight</span>
            </div>
            <h1 className="font-pl-display text-4xl md:text-5xl lg:text-6xl font-semibold text-pl-text mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-pl-muted mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild variant="accent" className="h-14 px-8 text-lg font-bold rounded-full">
                <Link to="/signup">Start Using for Free</Link>
              </Button>
              {/* Removed "Book a Demo" button as requested */}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-xl lg:max-w-none"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-pl-lg border border-pl-border bg-pl-surface">
              <div className="aspect-[16/10] relative">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}