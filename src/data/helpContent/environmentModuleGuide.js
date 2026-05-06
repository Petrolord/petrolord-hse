import { Leaf, Droplet, Wind, Trash2 } from 'lucide-react';

export const environmentModuleGuide = {
  id: 'environment',
  title: 'Environment Module Guide',
  icon: Leaf,
  description: 'Tracking emissions, waste, spills, and compliance.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: [
        { type: 'paragraph', text: 'Manage your organization\'s environmental footprint and regulatory compliance.' }
      ]
    },
    {
      id: 'spills',
      title: 'Spills & Remediation',
      description: 'Handling hazardous material spills.',
      content: [
        { type: 'paragraph', text: 'Immediate reporting of spills is crucial for environmental protection and regulatory compliance.' },
        { type: 'step-list', items: [
          { title: 'Identify Substance', description: 'Determine what was spilled (Oil, Chemical, Water).' },
          { title: 'Estimate Volume', description: 'Estimate the quantity in Liters or Barrels.' },
          { title: 'Report Immediately', description: 'Use the Quick Report feature for fastest notification.' },
          { title: 'Remediation Plan', description: 'Document the cleanup process and final disposal of contaminated material.' }
        ]}
      ]
    },
    {
      id: 'emissions',
      title: 'Emissions & Flaring',
      description: 'Monitoring GHG and other emissions.',
      content: [
        { type: 'paragraph', text: 'Track daily flaring volumes and calculate carbon footprint automatically based on configured factors.' }
      ]
    },
    {
      id: 'waste',
      title: 'Waste Management',
      content: [
        { type: 'paragraph', text: 'Track waste manifests from generation to disposal. Ensure all hazardous waste is accounted for.' },
        { type: 'list', items: [
          'Waste Stream Classification',
          'Manifest Tracking',
          'Disposal Certificate Upload',
          'Recycling Metrics'
        ]}
      ]
    }
  ]
};