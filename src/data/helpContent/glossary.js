import { Book } from 'lucide-react';

export const glossary = {
  id: 'glossary',
  title: 'HSE Glossary',
  icon: Book,
  description: 'Definitions of key terms and acronyms used in Petrolord HSE.',
  sections: [
    {
      id: 'acronyms',
      title: 'Common Acronyms',
      content: [
        { type: 'list', items: [
          'ALARP: As Low As Reasonably Practicable',
          'BBS: Behavior Based Safety',
          'EIA: Environmental Impact Assessment',
          'EMP: Environmental Management Plan',
          'HSE: Health, Safety, and Environment',
          'JSA: Job Safety Analysis',
          'KPI: Key Performance Indicator',
          'KRI: Key Risk Indicator',
          'LTI: Lost Time Injury',
          'LTIFR: Lost Time Injury Frequency Rate',
          'PPE: Personal Protective Equipment',
          'PTW: Permit to Work',
          'SDS: Safety Data Sheet',
          'TRIFR: Total Recordable Injury Frequency Rate'
        ]}
      ]
    },
    {
      id: 'definitions',
      title: 'Key Definitions',
      content: [
        { type: 'step-list', items: [
          { title: 'Hazard', description: 'Anything with the potential to cause harm.' },
          { title: 'Risk', description: 'The likelihood that a hazard will cause harm in combination with the severity of injury, damage or loss.' },
          { title: 'Incident', description: 'An unplanned event that resulted in injury, ill health, damage or other loss.' },
          { title: 'Near Miss', description: 'An event not causing harm, but has the potential to cause injury or ill health.' }
        ]}
      ]
    }
  ]
};