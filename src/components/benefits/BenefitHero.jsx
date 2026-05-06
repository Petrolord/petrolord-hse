import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function BenefitHero({ title, subtitle, image, icon: Icon }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#1a1a2e]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-500/30 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm font-semibold uppercase tracking-wider">Feature Spotlight</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-[#b0b0c0] mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button className="h-14 px-8 text-lg bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold rounded-full shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all">
                  Start Using for Free
                </Button>
              </Link>
              {/* Removed "Book a Demo" button as requested */}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-xl lg:max-w-none"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#3a3a5a] bg-[#1f1f35]">
              <div className="aspect-[16/10] relative">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f35] to-transparent opacity-60"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}