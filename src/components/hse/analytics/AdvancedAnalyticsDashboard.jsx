import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountScope, AccountPage, AccountHeader } from '@/components/account/accountChrome';

// This page previously showed hardcoded teaser figures (12 incidents YTD,
// 5 open permits, a 94/100 safety score, a 12-bar forecast and a "PPE" root
// cause) that were not read from the organization's data. Until it is rebuilt
// on real aggregates it points people at the analytics that are computed.
//
// /dashboard/analytics/advanced sits outside the signed-in layout, so it
// opens its own design-system scope (AccountScope) with the light/dark
// toggle in its header (docs/scope/DesignSystem-Rollout.md section 4.2).
export default function AdvancedAnalyticsDashboard() {
  return (
    <AccountScope testId="advanced-analytics-theme-scope" className="text-pl-text">
      <AccountPage>
        <AccountHeader eyebrow="Analytics" icon={BarChart3} title="Advanced Analytics" />
        <Card>
          <CardContent className="p-10 text-center text-pl-muted">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p className="text-pl-text font-medium">Not enough data</p>
            <p className="text-sm mt-1 mb-6">
              Advanced analytics are not computed yet. Reporting trends and the AI safety forecast
              built from your organization's reports are available from the dashboard.
            </p>
            <Button asChild variant="outline">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </AccountPage>
    </AccountScope>
  );
}
