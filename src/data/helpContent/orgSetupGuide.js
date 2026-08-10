import { Building2 } from 'lucide-react';

export const orgSetupGuide = {
  id: 'org-setup',
  title: 'Organization Setup Guide',
  icon: Building2,
  description: 'Set up sites, departments, and your team so reports are organized from day one.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: [
        { type: 'paragraph', text: 'Organization Setup is where admins define the structure everything else hangs on: the sites where work happens, the departments that own reports and actions, and the people on your team.' },
        { type: 'paragraph', text: 'New organizations see a checklist on the dashboard that tracks these steps and disappears once setup is complete. You can revisit Organization Setup anytime from the sidebar to add or change things later.' },
        { type: 'alert', variant: 'info', title: 'Who can do this', text: 'The Organization Setup section is visible to admins only. The person who registered the organization is automatically an admin.' }
      ]
    },
    {
      id: 'steps',
      title: 'The Setup Steps',
      content: [
        { type: 'step-list', items: [
          { title: 'Add your sites', description: 'Create one entry per physical location: rigs, plants, offices, depots, fields. Each site automatically gets its own QR observation code.' },
          { title: 'Create your departments', description: 'Add the functional units that will own reports and actions, for example Operations, Maintenance, HSE. Reports are grouped and analyzed by department.' },
          { title: 'Invite your team', description: 'From Members, invite each person by email and pick their role: Member, Supervisor, or Admin. If email delivery is unavailable you get an invite link to share directly.' },
          { title: 'Submit a first observation', description: 'Try the Quick Report flow yourself so you know exactly what your team will experience, and print your site QR posters for walk-up reporting.' }
        ]},
        { type: 'paragraph', text: 'Once you have at least one site, one department, and a second member or pending invitation, setup is marked complete automatically and the dashboard checklist disappears.' }
      ]
    },
    {
      id: 'roles',
      title: 'Choosing Roles',
      content: [
        { type: 'list', items: [
          'Member: submits reports, completes training, sees their own reports and the dashboard.',
          'Supervisor: triages incoming reports in the Supervisor View, assigns owners, investigates, and resolves.',
          'Admin: full access including Organization Setup, member management, and settings.'
        ]},
        { type: 'alert', variant: 'info', title: 'Start least-privileged', text: 'Give each person the lowest role that lets them do their job. You can raise a member\'s role at any time from Team Management.' }
      ]
    },
    {
      id: 'maintenance',
      title: 'Managing Structure Later',
      content: [
        { type: 'paragraph', text: 'Sites and departments can be edited or retired at any time. Retiring a department is a soft delete: existing reports keep their data.' },
        { type: 'paragraph', text: 'Each site\'s QR code can be regenerated or disabled from the Sites admin. See the QR Site Observations guide for the full workflow.' }
      ]
    }
  ]
};
