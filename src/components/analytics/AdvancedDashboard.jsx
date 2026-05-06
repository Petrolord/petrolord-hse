import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from "@/components/ui/button";
import { Settings, Save, RefreshCw } from 'lucide-react';

// Import all charts
import SafetyMetricsDashboard from './SafetyMetricsDashboard';
import SafetyOutlook from './SafetyOutlook';
import RiskHeatMap from './RiskHeatMap';
import IncidentProbabilityTimeline from './IncidentProbabilityTimeline';
import DepartmentRiskChart from './DepartmentRiskChart';
import IncidentTypeDistribution from './IncidentTypeDistribution';
import RiskTrendAnalysis from './RiskTrendAnalysis';
import HazardSeverityMatrix from './HazardSeverityMatrix';

const ResponsiveGridLayout = WidthProvider(Responsive);

const initialLayouts = {
  lg: [
    { i: 'metrics', x: 0, y: 0, w: 12, h: 3, static: true }, // Metrics strip always top
    { i: 'outlook', x: 0, y: 3, w: 8, h: 8 },
    { i: 'heatmap', x: 8, y: 3, w: 4, h: 8 },
    { i: 'timeline', x: 0, y: 11, w: 12, h: 6 },
    { i: 'dept_risk', x: 0, y: 17, w: 4, h: 8 },
    { i: 'risk_trend', x: 4, y: 17, w: 8, h: 8 },
    { i: 'inc_type', x: 0, y: 25, w: 6, h: 8 },
    { i: 'matrix', x: 6, y: 25, w: 6, h: 8 },
  ]
};

export default function AdvancedDashboard() {
  const [isDraggable, setIsDraggable] = useState(false);
  const [layouts, setLayouts] = useState(initialLayouts);

  const toggleEditMode = () => setIsDraggable(!isDraggable);

  return (
    <div className="min-h-screen bg-[#0F1B2E] p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Safety Analytics</h1>
          <p className="text-[#7a7a9a]">Interactive prediction models and risk visualization</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isDraggable ? "secondary" : "outline"} 
            onClick={toggleEditMode}
            className="border-[#3a3a5a] text-white"
          >
            <Settings className="h-4 w-4 mr-2" /> 
            {isDraggable ? "Finish Editing" : "Customize Layout"}
          </Button>
          <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
            <Save className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        isDraggable={isDraggable}
        isResizable={isDraggable}
        onLayoutChange={(layout, layouts) => setLayouts(layouts)}
        draggableHandle=".drag-handle"
      >
        <div key="metrics">
          <SafetyMetricsDashboard />
        </div>
        
        <div key="outlook" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <SafetyOutlook />
        </div>
        
        <div key="heatmap" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <RiskHeatMap />
        </div>
        
        <div key="timeline" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <IncidentProbabilityTimeline />
        </div>
        
        <div key="dept_risk" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <DepartmentRiskChart />
        </div>
        
        <div key="risk_trend" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <RiskTrendAnalysis />
        </div>
        
        <div key="inc_type" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <IncidentTypeDistribution />
        </div>
        
        <div key="matrix" className="relative group h-full">
          {isDraggable && <div className="drag-handle absolute top-2 right-2 z-50 cursor-move bg-white/20 p-1 rounded">✋</div>}
          <HazardSeverityMatrix />
        </div>

      </ResponsiveGridLayout>
    </div>
  );
}