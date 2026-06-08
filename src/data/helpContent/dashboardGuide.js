import { LayoutDashboard } from 'lucide-react';

export const dashboardGuide = {
  id: 'dashboard',
  title: 'Dashboard & Gamification Guide',
  icon: LayoutDashboard,
  description: 'Read the main dashboard KPIs and understand your Safety Score, badges, and team leaderboard.',
  sections: [
    {
      id: 'overview',
      title: 'Dashboard Overview',
      description: 'The main dashboard is your home screen and the first thing you see after signing in.',
      content: [
        { type: 'paragraph', text: 'The main dashboard brings the most important HSE information together on a single screen. From the top down you will find the AI Safety Predictor, your personal gamification widgets (Safety Score and Badges), the Team Leaderboard, and a row of KPI tiles that summarise each HSE pillar for your organization.' },
        { type: 'paragraph', text: 'Everything on the dashboard is scoped to the organization you are currently working in. If you belong to more than one organization, switch organizations to see that organization\'s data.' },
        { type: 'alert', variant: 'info', title: 'Real data only', text: 'The KPI tiles show genuine values pulled from each module. When a pillar has no data yet, the tile shows "--" rather than a made-up number, so a dash simply means nothing has been recorded so far.' }
      ]
    },
    {
      id: 'kpi-tiles',
      title: 'Reading the KPI Tiles',
      description: 'The grid of summary cards that report one headline number per HSE pillar.',
      content: [
        { type: 'paragraph', text: 'Each KPI tile shows a title, a single headline value, and a coloured icon. The tiles are read-only summaries; to dig into the detail behind any number, open the matching module from the sidebar. While data is loading a tile briefly shows "...", and once loaded a tile may show "--" if there is no data for that pillar yet.' },
        { type: 'step-list', items: [
          { title: 'Health Score', description: 'A percentage summarising the organization\'s overall health status.' },
          { title: 'Security Incidents', description: 'A count of security incidents recorded for the organization.' },
          { title: 'Env Score', description: 'A percentage reflecting the organization\'s environmental performance.' },
          { title: 'Permits Active', description: 'The number of currently active permits.' },
          { title: 'Critical Risks', description: 'The number of risks rated as critical.' },
          { title: 'Active Contractors', description: 'The number of contractors currently active.' },
          { title: 'Open Findings', description: 'The number of unresolved audit findings.' },
          { title: 'Training Records', description: 'The number of training records held for the organization.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Where the numbers come from', text: 'Percentages such as Health Score and Env Score are shown with a "%" sign; the remaining tiles are simple counts. Each value is aggregated from its own module, so the figures stay in step with what you record elsewhere in the app.' }
      ]
    },
    {
      id: 'safety-score',
      title: 'Your Safety Score',
      description: 'Your personal points total, daily streak, and progress toward the next reward.',
      content: [
        { type: 'paragraph', text: 'The Safety Score card shows your own gamification stats for the current organization. It is personal to you and refreshes automatically while the dashboard is open.' },
        { type: 'step-list', items: [
          { title: 'Points total', description: 'Your accumulated safety points, shown as a large "pts" figure. Points are earned through your safety contributions in the app.' },
          { title: 'Day streak', description: 'A flame badge showing your current consecutive-day streak of activity.' },
          { title: 'Next reward progress', description: 'A progress bar toward your next reward, with the percentage shown alongside it.' }
        ]},
        { type: 'alert', variant: 'info', title: 'Keep your streak alive', text: 'Stay active day to day to build your streak. The exact rules for how individual points are awarded are managed by the platform; this card simply reflects your current total and streak.' }
      ]
    },
    {
      id: 'badges',
      title: 'Badges',
      description: 'Achievement icons you unlock as you progress.',
      content: [
        { type: 'paragraph', text: 'The "Your Badges" card displays the full set of available badges and highlights which ones you have unlocked. A counter at the top shows how many you have earned out of the total available, for example "3 / 12 Unlocked".' },
        { type: 'list', items: [
          'Unlocked badges appear in full colour.',
          'Badges you have not yet earned appear dimmed and greyed out, with a "Locked" note.',
          'Hover over any badge to see its name and a short description of what it represents.'
        ]},
        { type: 'alert', variant: 'info', title: 'Earning badges', text: 'Badges unlock automatically as you meet the criteria defined for them. The badge list is shared across the platform, so the exact set you see may grow over time.' }
      ]
    },
    {
      id: 'team-leaderboard',
      title: 'Team Leaderboard',
      description: 'How your team is ranked by safety contributions.',
      content: [
        { type: 'paragraph', text: 'The Team Leaderboard ranks members of your organization by their points, so you can see the top performers at a glance. It is scoped to your current organization and shows a friendly empty state ("Be the first to score!") when no one has points yet.' },
        { type: 'step-list', items: [
          { title: 'Ranking order', description: 'Members are listed from highest to lowest points. The top three positions are marked with a trophy and medal icons; everyone else shows a numbered rank (#4, #5, and so on).' },
          { title: 'Each row', description: 'Shows the member\'s name, an avatar, a coloured role tag, their points total, and a flame icon with their day streak when they have one.' },
          { title: 'Refresh cadence', description: 'A footer note states that the leaderboard is "Updated daily" and that points reset monthly.' }
        ]},
        { type: 'paragraph', text: 'There is also a dedicated full-screen Leaderboard view that adds period filters (All Time, This Month, This Week) and a "Rankings" table showing each reporter\'s number of reports, a quality score, points, and a trend arrow. Your own row is highlighted with a "You" tag so it is easy to find.' },
        { type: 'alert', variant: 'info', title: 'Ranking is points-based', text: 'Rankings are determined by points, which come from safety contributions such as reports. The precise points-and-quality formula is handled by the platform, so treat the leaderboard as a relative comparison rather than an exact scoring breakdown.' }
      ]
    },
    {
      id: 'ai-safety-predictor',
      title: 'AI Safety Predictor',
      description: 'A quick pointer to the AI forecasting section at the top of the dashboard.',
      content: [
        { type: 'paragraph', text: 'At the top of the dashboard is the AI Safety Predictor, an embedded panel that surfaces AI-generated safety forecasts and predictive insights for your organization. The "Full AI Dashboard" button opens the complete AI Analytics view, where you can explore these predictions in more detail.' },
        { type: 'alert', variant: 'info', title: 'See the dedicated AI guide', text: 'This guide only introduces the AI Safety Predictor at a glance. A separate AI guide covers the forecasts, insights, and how to interpret them in depth.' }
      ]
    }
  ]
};
