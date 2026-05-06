import React from 'react';
import { motion } from 'framer-motion';
import PricingToggle from './PricingToggle';

export default function PricingHero({ isAnnual, setIsAnnual }) {
  return (
    <div className="relative pt-32 pb-12 text-center px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10 -translate-x-1/3 translate-y-1/4"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <span className="text-[#FFC107] font-bold tracking-wider text-sm uppercase mb-4 block">Transparent Pricing</span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Choose the plan that fits <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC107] to-orange-500">
            your safety culture
          </span>
        </h1>
        <p className="text-xl text-[#b0b0c0] mb-12 max-w-2xl mx-auto">
          From free tools for small teams to enterprise-grade compliance operating systems. Always know what you pay.
        </p>

        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      </motion.div>
    </div>
  );
}