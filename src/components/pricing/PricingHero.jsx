import React from 'react';
import { motion } from 'framer-motion';
import PricingToggle from './PricingToggle';

export default function PricingHero({ isAnnual, setIsAnnual }) {
  return (
    <div className="relative pt-16 sm:pt-20 pb-8 text-center px-4">

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <span className="text-pl-accent-text font-bold tracking-wider text-sm uppercase mb-4 block">Transparent Pricing</span>
        <h1 className="font-pl-display text-4xl md:text-6xl font-semibold text-pl-text mb-6">
          Choose the plan that fits <br />
          <span className="text-pl-primary-text">
            your safety culture
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-pl-muted mb-10 max-w-2xl mx-auto">
          From free tools for small teams to enterprise-grade compliance operating systems. Always know what you pay.
        </p>

        <PricingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      </motion.div>
    </div>
  );
}