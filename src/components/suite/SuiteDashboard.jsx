import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Droplet, Hammer, Factory, Building2, 
  LineChart, Shield, ArrowRight, LayoutGrid 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { AccountScope, AccountPage, AccountHeader } from '@/components/account/accountChrome';

const modules = [
  {
    id: 'hse',
    title: 'HSE Management',
    description: 'Integrated Health, Safety, and Environment monitoring.',
    icon: Shield,
    link: '/dashboard',
    isFree: true
  },
  {
    id: 'geoscience',
    title: 'Geoscience',
    description: 'Seismic interpretation and geological modeling.',
    icon: Layers,
    link: '/suite/geoscience',
    isFree: false
  },
  {
    id: 'reservoir',
    title: 'Reservoir',
    description: 'Reservoir simulation and performance analysis.',
    icon: Droplet,
    link: '/suite/reservoir',
    isFree: false
  },
  {
    id: 'drilling',
    title: 'Drilling',
    description: 'Well planning, drilling optimization and reporting.',
    icon: Hammer,
    link: '/suite/drilling',
    isFree: false
  },
  {
    id: 'production',
    title: 'Production',
    description: 'Production monitoring and artificial lift optimization.',
    icon: Factory,
    link: '/suite/production',
    isFree: false
  },
  {
    id: 'facilities',
    title: 'Facilities',
    description: 'Asset integrity and facility maintenance.',
    icon: Building2,
    link: '/suite/facilities',
    isFree: false
  },
  {
    id: 'economics',
    title: 'Economics',
    description: 'Asset valuation and portfolio economics.',
    icon: LineChart,
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

  // /suite sits outside the signed-in layout, so it opens its own
  // design-system scope (AccountScope) with the light/dark toggle in its
  // header (docs/scope/DesignSystem-Rollout.md section 4.2, batch 3A). The
  // module tiles share one icon style: colour is kept for status.
  return (
    <AccountScope testId="suite-dashboard-theme-scope" className="text-pl-text">
      <AccountPage width="max-w-7xl">
        <AccountHeader
          eyebrow="Suite"
          icon={LayoutGrid}
          title="Petrolord Suite"
          description="Select a module to begin"
          actions={(
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go to HSE Dashboard
            </Button>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const isAccessible = hasAccess(module.id);
            const Icon = module.icon;

            return (
              <Card 
                key={module.id} 
                className={`transition-all duration-300 ${!isAccessible ? 'opacity-75' : 'cursor-pointer hover:border-pl-primary/50 hover:shadow-pl-md'}`}
                onClick={() => isAccessible && navigate(module.link)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-pl-sunken border border-pl-border flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-pl-primary-text" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pl-muted text-sm mb-6 min-h-[40px]">
                    {module.description}
                  </p>
                  
                  {isAccessible ? (
                    <Button variant="secondary" className="w-full group">
                      Enter Module
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-pl-muted py-2">
                      <span>Not Subscribed</span>
                      <Badge variant="neutral">Upgrade</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </AccountPage>
    </AccountScope>
  );
};

export default SuiteDashboard;
