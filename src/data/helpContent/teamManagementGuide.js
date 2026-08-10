import { Users, UserPlus, ShieldCheck, UserCog, Mail } from 'lucide-react';

export const teamManagementGuide = {
  id: 'team',
  title: 'Team & Members Guide',
  icon: Users,
  description: 'Invite colleagues, assign roles, and manage the members of your organization.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: [
        { type: 'paragraph', text: 'Team Management is where you build and maintain your organization\'s roster. From a single screen you can invite new people by email, see everyone who is already active, assign each person a role, and update or remove members as your team changes.' },
        { type: 'paragraph', text: 'The screen is split into two parts: an "Invite New Member" card at the top for adding people, and an "Active Members" list below that shows everyone currently in the organization.' },
        { type: 'alert', variant: 'info', title: 'Roles control access', text: 'The role you give a member controls which modules and features they can see and use inside the app. Choose roles carefully so that each person has the right level of access.' }
      ]
    },
    {
      id: 'inviting-members',
      title: 'Inviting Members',
      description: 'Send an email invitation so a colleague can join your organization.',
      content: [
        { type: 'paragraph', text: 'New people join by accepting an email invitation. Use the "Invite New Member" card at the top of the Team Management screen to send one.' },
        { type: 'step-list', items: [
          { title: 'Open Team Management', description: 'Go to the Team Management screen, where the "Invite New Member" card appears at the top.' },
          { title: 'Enter the email address', description: 'Type the colleague\'s work email (for example, colleague@company.com) into the email field.' },
          { title: 'Choose a role', description: 'Pick a role from the dropdown next to the email field: Member, Admin, or Supervisor.' },
          { title: 'Send the invite', description: 'Click "Send Invite". The person receives an email invitation to join your organization.' },
          { title: 'Confirm it was sent', description: 'A confirmation message appears, and the invitation shows up under "Pending Invitations" until it is accepted.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Resending an invite', text: 'If a colleague does not receive their invitation, find them under "Pending Invitations" and click "Resend". A short cooldown applies before you can resend the same invite again.' },
        { type: 'alert', variant: 'warning', title: 'If the email cannot be delivered', text: 'The invitation still gets created. Its link is copied to your clipboard with a notice, so you can share it with the person directly over chat or any channel you like. The link works exactly like the emailed one.' }
      ]
    },
    {
      id: 'managing-roles',
      title: 'Managing Roles',
      description: 'Understand the roles you can assign and what they mean.',
      content: [
        { type: 'paragraph', text: 'Every member has a role. The role determines how much of the app a person can access, so assign the lowest level that still lets someone do their job.' },
        { type: 'paragraph', text: 'When inviting a new member, you can choose from these roles:' },
        { type: 'list', items: [
          'Member — standard access for everyday users.',
          'Admin — elevated access for managing the organization and its settings.',
          'Supervisor — oversight access for people who manage teams or work areas.'
        ]},
        { type: 'alert', variant: 'info', title: 'Roles control which modules a user can see', text: 'A member\'s role decides which modules and features appear for them in the app. Changing a member\'s role changes what they can access.' },
        { type: 'paragraph', text: 'In the Active Members list, each person\'s role is shown as a coloured badge so you can tell at a glance who has elevated access. You can change a member\'s role at any time by editing the member.' }
      ]
    },
    {
      id: 'editing-removing',
      title: 'Editing & Removing Members',
      description: 'Update a member\'s details or remove them from the organization.',
      content: [
        { type: 'paragraph', text: 'The Active Members list shows everyone currently in your organization, along with their email, the date they joined, and their role badge. From here you can update a member\'s information or remove someone who has left.' }
      ],
      subsections: [
        {
          title: 'Editing a member',
          content: [
            { type: 'paragraph', text: 'Editing lets you correct a person\'s details or move them between teams and roles. The Edit Member dialog lets you change:' },
            { type: 'list', items: [
              'First Name',
              'Last Name',
              'Team — assign the member to a team or set "No Team".',
              'Role — change the member\'s role.'
            ]},
            { type: 'step-list', items: [
              { title: 'Open the member', description: 'Find the person in the Active Members list and open their Edit Member details dialog.' },
              { title: 'Update the fields', description: 'Change the first name, last name, team, or role as needed.' },
              { title: 'Save changes', description: 'Click "Save Changes". A confirmation message appears once the member\'s details are updated.' }
            ]}
          ]
        },
        {
          title: 'Removing a member',
          content: [
            { type: 'paragraph', text: 'When someone leaves your organization, you can remove them from the Active Members list using the remove (trash) button next to their entry.' },
            { type: 'step-list', items: [
              { title: 'Find the member', description: 'Locate the person you want to remove in the Active Members list.' },
              { title: 'Click remove', description: 'Click the trash icon next to the member to start removal.' },
              { title: 'Confirm', description: 'In the confirmation dialog, click "Remove" to take the member out of the organization.' }
            ]},
            { type: 'alert', variant: 'warning', title: 'Removal cannot be undone', text: 'Removing a member from the organization cannot be undone. Owners and admins are protected and do not show a remove button.' }
          ]
        }
      ]
    }
  ]
};
