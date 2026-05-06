import { HelpCircle, RefreshCw, WifiOff } from 'lucide-react';

export const troubleshootingGuide = {
  id: 'troubleshooting',
  title: 'Troubleshooting Guide',
  icon: HelpCircle,
  description: 'Solutions for common issues and errors.',
  sections: [
    {
      id: 'login',
      title: 'Login Issues',
      content: [
        { type: 'step-list', items: [
          { title: 'Check Internet Connection', description: 'Ensure you are connected to the network.' },
          { title: 'Clear Browser Cache', description: 'Sometimes stale cookies cause login loops.' },
          { title: 'Reset Password', description: 'Use the "Forgot Password" link if credentials are invalid.' }
        ]}
      ]
    },
    {
      id: 'sync',
      title: 'Data Sync Issues',
      content: [
        { type: 'paragraph', text: 'If data is not appearing in real-time:' },
        { type: 'list', items: [
          'Check the "Offline Indicator" at the bottom of the screen.',
          'Refresh the page manually.',
          'Ensure no firewall is blocking WebSocket connections to Supabase.'
        ]}
      ]
    }
  ]
};