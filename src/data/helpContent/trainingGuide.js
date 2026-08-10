import { GraduationCap, LayoutDashboard, BookOpen, Calendar, CheckSquare, Award } from 'lucide-react';

export const trainingGuide = {
  id: 'training',
  title: 'Training & Competency Guide',
  icon: GraduationCap,
  description: 'Manage training programs, schedules, completion records, competencies, and assessments.',
  sections: [
    {
      id: 'overview',
      title: 'Training & Competency Overview',
      description: 'The Training & Competency module helps you build training programs and track that your workforce stays qualified.',
      content: [
        { type: 'paragraph', text: 'This module brings training programs, scheduled sessions, completion records, your competency framework, and individual assessments together in one place. Use it to plan what people need to learn, when sessions happen, and whether each person is qualified for their role.' },
        { type: 'paragraph', text: 'The module is organized into six tabs along the top of the screen: Dashboard, Programs, Schedule, Records, Competency, and Assessments. Click any tab to switch between them.' },
        { type: 'alert', variant: 'info', title: 'Where to start', text: 'New organizations should begin on the Programs tab and create their first training program. The Dashboard and other tabs fill in automatically as programs, sessions, and records are added.' }
      ]
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'A high-level summary of your training activity and competency coverage.',
      content: [
        { type: 'paragraph', text: 'The Dashboard is the default view when you open the module. It surfaces four headline metrics and two charts so you can gauge training health at a glance.' },
        { type: 'step-list', items: [
          { title: 'Active Programs', description: 'The number of training programs currently marked as Active.' },
          { title: 'Upcoming Sessions', description: 'Scheduled training sessions that have not yet taken place.' },
          { title: 'Completed Trainings', description: 'Total training records logged as completed.' },
          { title: 'Qualified Personnel', description: 'The count of people who currently meet their competency requirements.' }
        ]},
        { type: 'paragraph', text: 'Below the metrics, the Training Compliance Trend chart plots completed trainings over the last six months, and the Competency Gaps radar chart shows average assessment scores by category.' },
        { type: 'alert', variant: 'info', title: 'Empty charts are normal at first', text: 'If you have not logged any completed trainings or assessments yet, the charts show a "no data" message instead. They populate as records and assessments accumulate.' }
      ]
    },
    {
      id: 'programs',
      title: 'Programs',
      description: 'Define the catalogue of training courses your organization offers.',
      content: [
        { type: 'paragraph', text: 'A program is a reusable course definition, for example "Working at Heights" or "H2S Awareness". The Programs tab lists every program with its ID, name, category, duration in hours, and status.' },
        { type: 'paragraph', text: 'When this tab is active, two extra controls appear: a filter panel on the left (filter by category, status, or search text) and a "New Program" button in the top-right header. The New Program button is only shown while you are on the Programs tab.' }
      ],
      subsections: [
        {
          title: 'How to create a training program',
          content: [
            { type: 'step-list', items: [
              { title: 'Open the Programs tab', description: 'Click the "Programs" tab at the top of the Training & Competency module.' },
              { title: 'Click "New Program"', description: 'Use the New Program button in the top-right corner of the header to open the Create Training Program dialog.' },
              { title: 'Enter the program name', description: 'Program Name is required. Give the course a clear, recognizable title.' },
              { title: 'Choose a category', description: 'Pick from Safety, Technical, Leadership, Compliance, or Health. It defaults to Safety.' },
              { title: 'Set the duration', description: 'Enter the course length in hours (optional).' },
              { title: 'Add a target audience', description: 'Note who the course is intended for, such as a role or department (optional).' },
              { title: 'Write a description', description: 'Describe the course content and objectives (optional).' },
              { title: 'Click "Create Program"', description: 'The program is saved with an auto-generated ID and appears in the Programs list.' }
            ]}
          ]
        }
      ]
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'View planned training sessions.',
      content: [
        { type: 'paragraph', text: 'The Schedule tab lists upcoming and past training sessions in a table showing the date, the program being delivered, the location, the assigned trainer, and the session status.' },
        { type: 'paragraph', text: 'Where a location or trainer has not been assigned yet, the table displays "TBD".' },
        { type: 'alert', variant: 'info', title: 'View-only at this stage', text: 'The Schedule tab currently displays existing sessions. In-app creation and editing of scheduled sessions is still in progress.' }
      ]
    },
    {
      id: 'records',
      title: 'Records',
      description: 'Track who has completed which training and how they scored.',
      content: [
        { type: 'paragraph', text: 'The Records tab is the audit trail of training delivery. Each row shows the training date, the employee, the program taken, the completion status, and the score (where one was recorded).' },
        { type: 'paragraph', text: 'Use this tab to confirm that a specific person has completed a required course, or to review historical completion across the workforce.' },
        { type: 'alert', variant: 'info', title: 'Completion logging is in progress', text: 'The Records tab currently displays existing completion records. An in-app form for recording a new completion directly from this tab is still in progress; records may be populated through your data setup in the meantime.' }
      ]
    },
    {
      id: 'competency',
      title: 'Competency',
      description: 'Define the competency framework people are measured against.',
      content: [
        { type: 'paragraph', text: 'The Competency tab holds your competency framework, the list of skills and qualifications your roles require. Each entry shows an ID, the competency name, its category, and the required level.' },
        { type: 'paragraph', text: 'Competencies are the benchmark that the Assessments tab and the Dashboard\'s "Qualified Personnel" metric measure people against.' },
        { type: 'alert', variant: 'info', title: 'Framework setup', text: 'In-app editing of the competency framework from this tab is still in progress. Defined competencies appear here once configured.' }
      ]
    },
    {
      id: 'assessments',
      title: 'Assessments',
      description: 'Record how individuals perform against required competencies.',
      content: [
        { type: 'paragraph', text: 'The Assessments tab links people to your competency framework. Each row shows the assessment date, the employee assessed, the competency evaluated, and the result.' },
        { type: 'paragraph', text: 'Assessment results feed the Competency Gaps radar chart on the Dashboard, helping you spot categories where average scores are low and additional training may be needed.' },
        { type: 'alert', variant: 'info', title: 'Recording assessments', text: 'In-app creation of new assessments from this tab is still in progress. Existing assessment results are displayed here.' }
      ]
    }
  ]
};
