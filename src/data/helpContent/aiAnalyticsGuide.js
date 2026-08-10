import { Brain } from 'lucide-react';

export const aiAnalyticsGuide = {
  id: 'analytics',
  title: 'AI Safety Predictor & Analytics Guide',
  icon: Brain,
  description: 'Turn your submitted reports into a forward-looking forecast of what could happen next.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      description: 'What the predictor does and where to find it.',
      content: [
        { type: 'paragraph', text: 'The AI Safety Predictor reads your organisation\'s safety history — submitted reports, observed behaviours, incidents, hazards and trends — and produces a forward-looking forecast of the incidents most likely to occur next, so you can act before they happen.' },
        { type: 'paragraph', text: 'You\'ll find it in the AI Safety Predictor section on the main Dashboard, and the underlying figures are also available under the Analytics navigation item.' },
        { type: 'alert', variant: 'info', title: 'Predictive, not just historical', text: 'Most dashboards tell you what already happened. The AI Forecast tab estimates what is likely to happen in the next 30 days and what to do about it.' },
      ],
    },
    {
      id: 'forecast',
      title: 'Generating an AI Forecast',
      description: 'Produce a fresh 30-day outlook.',
      content: [
        { type: 'step-list', items: [
          { title: 'Open the AI Safety Predictor', description: 'From the Dashboard, then select the "AI Forecast" tab (it is the default view).' },
          { title: 'Click "Generate Forecast"', description: 'The engine summarises your recent reports and history and asks the AI to produce a 30-day outlook. This takes a few seconds.' },
          { title: 'Read the outlook', description: 'You get an overall risk level, a plain-English summary, and a confidence score for the forecast.' },
          { title: 'Regenerate any time', description: 'As new reports come in, click Regenerate to refresh the forecast with the latest signals.' },
        ]},
        { type: 'alert', variant: 'info', title: 'No data, no guesswork', text: 'If there is little history to learn from, the forecast says so and lowers its confidence rather than inventing risks.' },
      ],
    },
    {
      id: 'reading',
      title: 'Reading the Forecast',
      description: 'What each part of the forecast means.',
      content: [
        { type: 'list', items: [
          'Predicted Incidents — the most likely incident categories, each with the department/area most at risk and a likelihood percentage.',
          'Rationale & Leading Indicators — why each prediction was made, citing the specific signals (e.g. rising near-misses, a recurring behaviour, a hotspot location).',
          'Preventive Actions — concrete steps to get ahead of each predicted incident.',
          'Leading Indicators — organisation-level signals worth watching.',
          'Recommended Focus — the top preventive priorities, most important first.',
        ]},
        { type: 'paragraph', text: 'Treat the forecast as decision support: use the predicted incidents and recommended focus to direct inspections, toolbox talks and corrective actions where the risk is rising.' },
      ],
    },
    {
      id: 'learning',
      title: 'How It Learns (Feedback Loop)',
      description: 'The forecast sharpens itself over time.',
      content: [
        { type: 'paragraph', text: 'Each predicted incident is later scored against what actually happened in that window. The resulting hit rate is shown as a badge next to the Generate button, and it is fed back into the next forecast so the engine calibrates its confidence over time.' },
        { type: 'paragraph', text: 'The more reports your team submits, the better the signal — which makes consistent reporting (including near misses) the single biggest thing you can do to improve forecast quality.' },
      ],
    },
    {
      id: 'analytics-metrics',
      title: 'Supporting Analytics',
      description: 'The aggregated metrics behind the forecast.',
      content: [
        { type: 'paragraph', text: 'Alongside the forecast, the predictor shows aggregated safety intelligence drawn directly from your data: incident frequency, the near-miss-to-incident ratio (a key leading indicator), corrective-action closure rate and average audit compliance, plus six-month incident/near-miss trends and automatically detected risk factors.' },
      ],
    },
  ],
};
