import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Droplet, Hammer, Factory, Building2, 
  LineChart, Shield, ArrowRight, LayoutGrid 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const modules = [
  {
    id: 'hse',
    title: 'HSE Management',
    description: 'Integrated Health, Safety, and Environment monitoring.',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    link: '/dashboard',
    isFree: true
  },
  {
    id: 'geoscience',
    title: 'Geoscience',
    description: 'Seismic interpretation and geological modeling.',
    icon: Layers,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    link: '/suite/geoscience',
    isFree: false
  },
  {
    id: 'reservoir',
    title: 'Reservoir',
    description: 'Reservoir simulation and performance analysis.',
    icon: Droplet,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20',
    link: '/suite/reservoir',
    isFree: false
  },
  {
    id: 'drilling',
    title: 'Drilling',
    description: 'Well planning, drilling optimization and reporting.',
    icon: Hammer,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    link: '/suite/drilling',
    isFree: false
  },
  {
    id: 'production',
    title: 'Production',
    description: 'Production monitoring and artificial lift optimization.',
    icon: Factory,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    link: '/suite/production',
    isFree: false
  },
  {
    id: 'facilities',
    title: 'Facilities',
    description: 'Asset integrity and facility maintenance.',
    icon: Building2,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-400/10',
    borderColor: 'border-indigo-400/20',
    link: '/suite/facilities',
    isFree: false
  },
  {
    id: 'economics',
    title: 'Economics',
    description: 'Asset valuation and portfolio economics.',
    icon: LineChart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
    link: '/suite/economics',
    isFree: false
  }
];

const SuiteDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Safely get subscribed modules
  const userModules = user?.user_metadata?.subscribed_modules || [];
  const primaryApp = user?.user_metadata?.primary_app;

  // Function to check if user has access to a module
  const hasAccess = (moduleId) => {
    // HSE is accessible if it's primary, or in module list, or explicitly 'hse_free'
    if (moduleId === 'hse') {
        if (primaryApp === 'hse') return true;
        if (userModules.includes('hse') || userModules.includes('hse_free')) return true;
    }
    return userModules.includes(moduleId);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-[#FFC107]" />
              Petrolord Suite
            </h1>
            <p className="text-[#b0b0c0]">Select a module to begin</p>
          </div>
          <Button 
            variant="outline" 
            className="border-[#3a3a5a] hover:bg-[#252541] text-white"
            onClick={() => navigate('/dashboard')}
          >
            Go to HSE Dashboard
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const isAccessible = hasAccess(module.id);
            const Icon = module.icon;

            return (
              <Card 
                key={module.id} 
                className={`bg-[#252541] border-[#3a3a5a] transition-all duration-300 ${!isAccessible ? 'opacity-75' : 'cursor-pointer hover:border-[#FFC107]/50 hover:transform hover:scale-105'}`}
                onClick={() => isAccessible && navigate(module.link)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} border ${module.borderColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-xl text-white">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#b0b0c0] text-sm mb-6 min-h-[40px]">
                    {module.description}
                  </p>
                  
                  {isAccessible ? (
                    <Button 
                      className="w-full bg-[#252541] hover:bg-[#2f2f4d] border border-[#3a3a5a] text-white group"
                    >
                      Enter Module
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#7a7a9a] py-2">
                      <span>Not Subscribed</span>
                      <span className="px-2 py-1 rounded bg-[#1a1a2e] border border-[#3a3a5a]">
                        Upgrade
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuiteDashboard;