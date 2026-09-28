import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function BenefitFeatures({ features, benefits }) {
  return (
    <section className="py-16 sm:py-24 bg-pl-surface border-y border-pl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Key Benefits Column */}
          <div className="lg:col-span-1 space-y-8">
            <h3 className="text-2xl font-semibold text-pl-text mb-6">Key Benefits</h3>
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-pl-primary/10 flex items-center justify-center text-pl-primary-text">
                    <benefit.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-pl-text mb-1">{benefit.title}</h4>
                  <p className="text-pl-muted text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Features Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-pl-text mb-8">Powerful Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="bg-pl-raised h-full">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-pl-primary-text mb-3">{feature.title}</h4>
                    <p className="text-pl-muted text-sm">{feature.desc}</p>
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