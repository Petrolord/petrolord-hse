import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function BenefitFeatures({ features, benefits }) {
  return (
    <section className="py-24 bg-[#151525]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Key Benefits Column */}
          <div className="lg:col-span-1 space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6">Key Benefits</h3>
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{benefit.title}</h4>
                  <p className="text-[#b0b0c0] text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Features Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-8">Powerful Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="bg-[#1f1f35] border-[#3a3a5a] text-white h-full">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-bold text-[#FFC107] mb-3">{feature.title}</h4>
                    <p className="text-[#b0b0c0] text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}