import { FileText } from 'lucide-react';

export const reportingGuide = {
  id: 'reporting',
  title: 'Reporting Guide',
  icon: FileText,
  description: 'How to generate, schedule, and export reports.',
  sections: [
    {
      id: 'generating',
      title: 'Generating Reports',
      content: [
        { type: 'paragraph', text: 'Reports can be generated from any module dashboard.' },
        { type: 'step-list', items: [
          { title: 'Select Data Range', description: 'Use the date picker to define the period.' },
          { title: 'Apply Filters', description: 'Filter by department, site, or severity.' },
          { title: 'Click Export', description: 'Choose PDF or Excel format.' }
        ]}
      ]
    },
    {
      id: 'automated',
      title: 'Automated Reports',
      content: [
        { type: 'paragraph', text: 'Admins can schedule reports to be emailed automatically (Daily, Weekly, Monthly).' }
      ]
    }
  ]
};