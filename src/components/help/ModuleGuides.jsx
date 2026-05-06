import React, { useState } from 'react';
import { guideList } from '@/data/helpContent/index';
import GuideViewer from './GuideViewer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function ModuleGuides() {
  const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [filter, setFilter] = useState('');

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
          <h2 className="text-3xl font-bold mb-2">Module Guides</h2>
          <p className="text-[#b0b0c0]">Detailed documentation for every component of the Petrolord HSE platform.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Find a guide..." 
            className="pl-9 bg-[#252541] border-[#3a3a5a] text-white focus:border-[#FFC107]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((module) => (
          <Card 
            key={module.id} 
            className="bg-[#252541] border-[#3a3a5a] hover:border-[#FFC107] transition-all group cursor-pointer h-full flex flex-col"
            onClick={() => setSelectedGuideId(module.id)}
          >
            <CardHeader className="flex-1">
              <div className="h-12 w-12 rounded-lg bg-[#1a1a2e] border border-[#3a3a5a] flex items-center justify-center mb-4 text-[#FFC107]">
                {module.icon && <module.icon className="h-6 w-6" />}
              </div>
              <CardTitle className="text-white group-hover:text-[#FFC107] transition-colors">{module.title}</CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="ghost" className="text-sm p-0 h-auto hover:bg-transparent text-gray-400 hover:text-white group-hover:translate-x-1 transition-transform">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Guide Banner */}
      {!filter && (
        <div className="mt-8 bg-gradient-to-r from-[#252541] to-[#1a1a2e] border border-[#3a3a5a] rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[#FFC107] mb-2 font-bold uppercase text-xs tracking-wider">
              <BookOpen className="h-4 w-4" /> Recommended Reading
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Risk Management Fundamentals</h3>
            <p className="text-gray-400 mb-6">
              Learn how to effectively identify hazards, calculate risk scores using the 5x5 matrix, and implement mitigation strategies.
            </p>
            <Button 
              className="bg-[#FFC107] text-black hover:bg-[#e0a800]"
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