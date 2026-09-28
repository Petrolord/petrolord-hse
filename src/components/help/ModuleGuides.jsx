import React, { useState, useEffect } from 'react';
import { guideList } from '@/data/helpContent/index';
import GuideViewer from './GuideViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

// Design family (batch 2C): guide cards on the theme roles.
export default function ModuleGuides({ openGuideId = null, openToken = 0 }) {
  const [selectedGuideId, setSelectedGuideId] = useState(openGuideId);
  const [filter, setFilter] = useState('');

  // Open a specific guide when requested from outside (e.g. global search).
  // Keyed on openToken so re-requesting the same guide re-opens it.
  useEffect(() => {
    if (openGuideId) setSelectedGuideId(openGuideId);
  }, [openToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedGuide = guideList.find(g => g.id === selectedGuideId);

  if (selectedGuide) {
    return <GuideViewer guide={selectedGuide} onBack={() => setSelectedGuideId(null)} />;
  }

  const filteredGuides = guideList.filter(g => 
    g.title.toLowerCase().includes(filter.toLowerCase()) || 
    g.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-2">Module Guides</h2>
          <p className="text-pl-muted">Detailed documentation for every component of the Petrolord HSE platform.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
          <Input 
            placeholder="Find a guide..." 
            className="pl-9"
            aria-label="Find a guide"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((module) => (
          <Card 
            key={module.id} 
            className="hover:border-pl-primary hover:shadow-pl-md transition-all group cursor-pointer h-full flex flex-col"
            onClick={() => setSelectedGuideId(module.id)}
          >
            <CardHeader className="flex-1">
              <div className="h-12 w-12 rounded-lg bg-pl-sunken border border-pl-border flex items-center justify-center mb-4 text-pl-primary-text">
                {module.icon && <module.icon className="h-6 w-6" aria-hidden="true" />}
              </div>
              <CardTitle className="group-hover:text-pl-primary-text transition-colors">{module.title}</CardTitle>
              <CardDescription className="mt-2">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="ghost" className="text-sm p-0 h-auto hover:bg-transparent group-hover:text-pl-primary-text group-hover:translate-x-1 transition-transform">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Guide Banner */}
      {!filter && (
        <div className="mt-8 bg-pl-surface border border-pl-border shadow-pl-sm rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-pl-muted mb-2 font-bold uppercase text-xs tracking-wider">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Recommended Reading
            </div>
            <h3 className="text-2xl font-semibold text-pl-text mb-4">Risk Management Fundamentals</h3>
            <p className="text-pl-muted mb-6">
              Learn how to effectively identify hazards, calculate risk scores using the 5x5 matrix, and implement mitigation strategies.
            </p>
            <Button 
              onClick={() => setSelectedGuideId('risk')}
            >
              Start Learning
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}