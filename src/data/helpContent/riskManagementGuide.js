import { AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

export const riskManagementGuide = {
  id: 'risk',
  title: 'Risk Management Guide',
  icon: AlertTriangle,
  description: 'Methodologies for identifying, assessing, and mitigating risks.',
  sections: [
    {
      id: 'risk-register',
      title: 'Risk Register',
      description: 'The central repository of all identified risks.',
      content: [
        { type: 'paragraph', text: 'The Risk Register is a live document that should be reviewed regularly. Risks are categorized by type (Strategic, Operational, Financial, HSE).' }
      ]
    },
    {
      id: 'matrix',
      title: 'Risk Matrix (5x5)',
      description: 'Understanding Risk Scoring.',
      content: [
        { type: 'paragraph', text: 'Petrolord uses a standard 5x5 matrix mapping Likelihood vs. Consequence.' },
        { type: 'list', items: [
          'Low (1-4): Acceptable risk, monitor.',
          'Medium (5-9): ALARP (As Low As Reasonably Practicable).',
          'High (10-16): Requires mitigation plan.',
          'Critical (17-25): Stop work immediately.'
        ]}
      ]
    },
    {
      id: 'mitigation',
      title: 'Mitigation Strategies',
      content: [
        { type: 'step-list', items: [
          { title: 'Identify Controls', description: 'What prevents this risk from happening?' },
          { title: 'Assess Effectiveness', description: 'Are controls working? (Effective, Partially Effective, Ineffective)' },
          { title: 'Create Action Plan', description: 'Assign tasks to improve controls.' }
        ]}
      ]
    }
  ]
};