import { QrCode } from 'lucide-react';

export const qrObservationsGuide = {
  id: 'qr-observations',
  title: 'QR Site Observations Guide',
  icon: QrCode,
  description: 'Let anyone at your site report a safety observation by scanning a QR poster, with no login or app required.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      content: [
        { type: 'paragraph', text: 'Every site in your organization has its own QR code. When someone scans it with a phone camera, a simple mobile page opens where they can describe what they observed, attach a photo, or record a voice note, and submit it in seconds. No account, login, or app install is needed.' },
        { type: 'paragraph', text: 'Submissions land directly in the Supervisor View alongside staff reports, tagged with the site they came from and marked with a QR badge so your team knows it was a walk-up report.' },
        { type: 'alert', variant: 'info', title: 'Why this matters', text: 'Contractors, visitors, and field crews see hazards your registered users may miss. The QR poster removes every barrier between seeing something unsafe and reporting it.' }
      ]
    },
    {
      id: 'admin-setup',
      title: 'For Admins: Print and Manage QR Posters',
      description: 'Each site\'s QR code lives in the Sites admin.',
      content: [
        { type: 'step-list', items: [
          { title: 'Open Sites', description: 'Go to Organization Setup, then Sites. Every site row has a QR code button.' },
          { title: 'Open the QR dialog', description: 'Click the QR icon on a site to see its code, the public link, and its current status.' },
          { title: 'Print the poster', description: 'Click "Print poster" to get a clean, ready-to-post page with the QR code and three simple instructions for workers.' },
          { title: 'Post it where people work', description: 'Laminate the poster and place it at the site entrance, near the safety briefing board, or anywhere workers gather.' }
        ]},
        { type: 'paragraph', text: 'Two controls are available in the same dialog:' },
        { type: 'list', items: [
          'Regenerate code: issues a brand-new QR code for the site. Use this if a poster falls into the wrong hands. Every previously printed poster stops working immediately, so reprint afterwards.',
          'Disable submissions: temporarily switches off public reporting for the site without changing the code. Anyone scanning sees a clear "disabled" message until you enable it again.'
        ]},
        { type: 'alert', variant: 'warning', title: 'Treat the link like a key', text: 'Anyone with the QR code or its link can submit observations to your organization. Only share posters at your own sites, and regenerate the code if one leaks.' }
      ]
    },
    {
      id: 'worker-flow',
      title: 'For Workers: Submitting an Observation',
      content: [
        { type: 'step-list', items: [
          { title: 'Scan the poster', description: 'Point your phone camera at the QR code and tap the link that appears. The observation page opens in your browser.' },
          { title: 'Describe what you saw', description: 'Type a short description, take a photo, or tap to record a voice note. Any one of the three is enough.' },
          { title: 'Add your name if you want', description: 'Name and phone number are optional. Leave them blank to report anonymously.' },
          { title: 'Submit', description: 'Tap Submit Observation. The site\'s safety team sees it immediately.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Anonymous by default', text: 'A report without name or phone number cannot be traced back to you. Contact details help the safety team follow up, but they are never required.' }
      ]
    },
    {
      id: 'triage',
      title: 'For Supervisors: Triaging QR Reports',
      content: [
        { type: 'paragraph', text: 'QR submissions appear in the Supervisor View reports list with a yellow "QR" badge next to the reporter. The reporter column shows the name the person provided, or "Anonymous (QR)" if they left it blank. The details view shows their phone number when provided.' },
        { type: 'paragraph', text: 'From there the workflow is identical to staff reports: view details, assign an owner, investigate with the 5-Whys editor, and resolve.' },
        { type: 'paragraph', text: 'When a photo or voice note is attached, the AI analysis runs automatically and pre-fills the category, severity, and recommended actions, subject to your organization\'s monthly AI allowance.' }
      ]
    },
    {
      id: 'limits',
      title: 'Rate Limits and Privacy',
      content: [
        { type: 'list', items: [
          'Submissions are rate limited per device connection to prevent spam.',
          'AI analysis of public submissions is capped per site per hour and counts toward your organization\'s monthly AI allowance.',
          'Public reporters never see any of your organization\'s data. The page only shows the site name and the submission form.'
        ]}
      ]
    }
  ]
};
