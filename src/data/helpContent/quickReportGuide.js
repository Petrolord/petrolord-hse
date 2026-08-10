import { Camera } from 'lucide-react';

export const quickReportGuide = {
  id: 'quick-report',
  title: 'Quick Report Guide',
  icon: Camera,
  description: 'File a safety report in seconds with a photo and a voice note — the AI does the rest.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'The fastest way to report a hazard, near miss or unsafe act.',
      content: [
        { type: 'paragraph', text: 'Quick Report lets anyone capture a safety observation on the spot. You snap a photo and/or record a short voice note; the AI analyses them and pre-fills the report — category, severity, a description and suggested corrective actions — so you only need to review and submit.' },
        { type: 'alert', variant: 'info', title: 'Report everything, especially near misses', text: 'Near misses are the strongest early warning of future incidents — and they feed the AI Safety Predictor. The quicker and more often your team reports, the better protected they are.' },
      ],
    },
    {
      id: 'filing',
      title: 'Filing a Quick Report',
      description: 'From capture to submitted in four steps.',
      content: [
        { type: 'step-list', items: [
          { title: 'Capture', description: 'Open Quick Report and take a photo of the hazard and/or record a voice note describing what you see. You can use one or both.' },
          { title: 'Let the AI analyse', description: 'The photo is reviewed for hazards and the voice note is transcribed. The AI suggests a category, severity, description and recommended actions.' },
          { title: 'Review & edit', description: 'Check the AI\'s suggestions and adjust anything — title, description, category, severity, location. Nothing is submitted until you confirm.' },
          { title: 'Submit', description: 'You get a confirmation with the report\'s reference ID. The report is now logged and routed for review.' },
        ]},
      ],
    },
    {
      id: 'after',
      title: 'What Happens After You Submit',
      description: 'Where your report goes.',
      content: [
        { type: 'list', items: [
          'It appears under My Reports, where you can track its status (submitted → acknowledged → in progress → resolved → closed).',
          'Supervisors see it in the Supervisor View, where they can investigate (5 Whys), assign an owner, and resolve it.',
          'It feeds the Analytics and the AI Safety Predictor, improving the organisation\'s forecast of future risk.',
        ]},
      ],
    },
    {
      id: 'tips',
      title: 'Tips for Good Reports',
      content: [
        { type: 'list', items: [
          'Get the hazard clearly in frame — the AI analyses what it can see.',
          'In the voice note, say what the hazard is and where it is.',
          'Always correct the AI if a category or severity looks wrong before submitting.',
          'If the AI service is unavailable, you can still fill in and submit the report manually.',
        ]},
        { type: 'alert', variant: 'warning', title: 'Emergencies first', text: 'Quick Report is for logging observations. In an emergency, follow your site\'s emergency procedures first, then file the report.' },
      ],
    },
  ],
};
