import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gauge, LayoutDashboard, TrendingUp, GitCompare, Clock, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useHSE } from '@/context/HSEContext';
import { safetyStatsService, isSchemaMissing } from '@/services/safetyStatsService';
import { METRICS, OCCUPATIONAL_BASES, WORKFORCES, RATE_BASES, metricById, basisFor } from '@/lib/safetyStats/definitions';
import {
  buildSeries, computeRates, rollingFromSeries, uChartFromSeries, addMonths,
} from '@/lib/safetyStats/aggregate';
import RateCards from './RateCards';
import MonthlyTable from './MonthlyTable';
import { RollingChart, UChartView } from './TrendCharts';
import CompareRates from './CompareRates';
import ExposureHoursPanel from './ExposureHoursPanel';
import { Pick, MonthField, Notice, fmtMonth, currentMonthKey } from './common';

export const STATS_EDITOR_ROLES = ['super_admin', 'org_admin', 'manager', 'supervisor'];
const WINDOW = 12;

// Design family (batch 2B): the module renders inside the signed-in scope
// (src/design/SignedInScope.jsx), so it uses the theme roles directly. The tabs
// keep their underline look on the roles.
const tabClass = 'gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none';

export default function SafetyStatisticsModule() {
  const { currentOrganization, role } = useHSE();
  const orgId = currentOrganization?.id;
  const canEdit = STATS_EDITOR_ROLES.includes(role);

  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [reports, setReports] = useState([]);
  const [exposure, setExposure] = useState([]);
  const [sites, setSites] = useState([]);

  const thisMonth = currentMonthKey();
  const [to, setTo] = useState(thisMonth);
  const [from, setFrom] = useState(addMonths(thisMonth, -(WINDOW - 1)));
  const [siteId, setSiteId] = useState('all');
  const [workforce, setWorkforce] = useState('combined');
  const [base, setBase] = useState(String(RATE_BASES.IOGP_1M));
  const [trendMetricId, setTrendMetricId] = useState('trir');

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setLoadError(null);
    const [r, h, s] = await Promise.all([
      safetyStatsService.getReports(orgId),
      safetyStatsService.getExposureHours(orgId),
      safetyStatsService.getSites(orgId),
    ]);
    const missing = isSchemaMissing(r.error) || isSchemaMissing(h.error);
    setSchemaMissing(missing);
    const other = [r.error, h.error, s.error].find((e) => e && !isSchemaMissing(e));
    if (other) setLoadError(other.message || 'Could not load safety statistics data.');
    setReports(r.error ? [] : r.data);
    setExposure(h.error ? [] : h.data);
    setSites(s.data || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const occupationalBase = Number(base);
  const series = useMemo(
    () => buildSeries({ reports, exposure, from, to, siteId, workforce }),
    [reports, exposure, from, to, siteId, workforce],
  );
  const rates = useMemo(() => computeRates(series, METRICS, { base: occupationalBase }), [series, occupationalBase]);

  const trendMetric = metricById(trendMetricId);
  const rollingSeries = useMemo(
    () => buildSeries({ reports, exposure, from: addMonths(from, -(WINDOW - 1)), to, siteId, workforce }),
    [reports, exposure, from, to, siteId, workforce],
  );
  const rolling = useMemo(
    () => rollingFromSeries(rollingSeries, trendMetric, { base: occupationalBase, windowMonths: WINDOW }),
    [rollingSeries, trendMetric, occupationalBase],
  );
  const uchart = useMemo(() => uChartFromSeries(series, trendMetric, { base: occupationalBase }), [series, trendMetric, occupationalBase]);
  const trendBaseLabel = (basisFor(trendMetric, occupationalBase) || {}).baseLabel || '';

  const siteOptions = [
    { value: 'all', label: 'All sites' },
    ...sites.map((s) => ({ value: s.id, label: s.is_active === false ? `${s.name} (inactive)` : s.name })),
    { value: 'unattributed', label: 'No site recorded' },
  ];
  const siteName = (id) => (siteOptions.find((o) => o.value === id) || {}).label || 'Unknown site';

  const header = (
    <div className="flex flex-col border-b border-pl-border bg-pl-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="hidden sm:block bg-pl-sunken p-2 rounded-lg">
            <Gauge className="h-6 w-6 text-pl-muted" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-pl-display text-2xl font-semibold text-pl-text">Safety Statistics</h2>
            <p className="text-xs text-pl-muted">TRIR, DART, LTIF, FAR, severity and process safety event rates from your classified reports and hours worked</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
        </Button>
      </div>
      <div className="px-4 overflow-x-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="overview" className={tabClass}><LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Rates</TabsTrigger>
            <TabsTrigger value="trends" className={tabClass}><TrendingUp className="h-4 w-4" aria-hidden="true" /> Trends</TabsTrigger>
            <TabsTrigger value="compare" className={tabClass}><GitCompare className="h-4 w-4" aria-hidden="true" /> Compare</TabsTrigger>
            <TabsTrigger value="hours" className={tabClass}><Clock className="h-4 w-4" aria-hidden="true" /> Exposure hours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  const filters = (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-pl-border bg-pl-surface p-4 shadow-pl-sm">
      <MonthField label="From" value={from} max={to} onChange={setFrom} />
      <MonthField label="To" value={to} min={from} onChange={setTo} />
      <Pick label="Site" value={siteId} onChange={setSiteId} options={siteOptions} className="min-w-[180px]" />
      <Pick label="Workforce" value={workforce} onChange={setWorkforce} options={WORKFORCES.map((w) => ({ value: w.id, label: w.label }))} className="min-w-[200px]" />
      <Pick
        label="Base for TRIR, DART, severity and PSE"
        value={base}
        onChange={setBase}
        options={OCCUPATIONAL_BASES.map((b) => ({ value: String(b.value), label: b.label }))}
        className="min-w-[240px]"
      />
    </div>
  );

  const unclassifiedTotal = series.all.unclassified;
  const coverage = (
    <div className="space-y-3">
      {exposure.length === 0 && !schemaMissing && (
        <Notice tone="warn" title="No exposure hours yet">
          Rates need hours worked. {canEdit ? 'Add them on the Exposure hours tab.' : 'A supervisor, manager or admin can add them on the Exposure hours tab.'}
          {' '}Report counts below are still shown.
        </Notice>
      )}
      {series.monthsWithoutHours.length > 0 && exposure.length > 0 && (
        <Notice tone="warn" title={`${series.monthsWithoutHours.length} of ${series.months.length} months have no hours`}>
          {series.monthsWithoutHours.map(fmtMonth).join(', ')}. These months have no rate, and their reports are left out of every rate below.
        </Notice>
      )}
      {unclassifiedTotal > 0 && (
        <Notice tone="warn" title={`${unclassifiedTotal} ${unclassifiedTotal === 1 ? 'report is' : 'reports are'} not classified yet`}>
          An unclassified report is counted here and in no rate. Classify reports in the Supervisor View (View Details, Safety statistics classification).
        </Notice>
      )}
      {series.warnings.map((w) => (
        <Notice key={`${w.type}-${w.month}-${w.siteId}`} tone="warn">
          {w.type === 'combined-and-split'
            ? `${fmtMonth(w.month)}, ${siteName(w.siteId || 'unattributed')}: a combined hours figure and separate employee or contractor figures both exist. The combined figure is used.`
            : `${fmtMonth(w.month)}, ${siteName(w.siteId || 'unattributed')}: only a combined hours figure exists, so the ${w.workforce} view has no hours for it.`}
        </Notice>
      ))}
    </div>
  );

  let body;
  if (!orgId) {
    body = <Notice>Select an organization to see its safety statistics.</Notice>;
  } else if (loading) {
    body = <div className="py-16 text-center text-pl-muted">Loading safety statistics...</div>;
  } else if (schemaMissing) {
    body = (
      <Notice tone="warn" title="Safety statistics are not switched on yet">
        The database update that stores exposure hours and report classifications (HS1) has not been applied to this environment.
        Ask your Petrolord administrator to apply it. Nothing is lost in the meantime: reports keep being recorded.
      </Notice>
    );
  } else if (loadError) {
    body = <Notice tone="warn" title="Could not load">{loadError}</Notice>;
  } else if (tab === 'overview') {
    body = (
      <div className="space-y-4">
        {filters}
        {coverage}
        <div className="text-xs text-pl-muted">
          {fmtMonth(from)} to {fmtMonth(to)} · {siteName(siteId)} · {(WORKFORCES.find((w) => w.id === workforce) || {}).label}
          {' '}· {series.all.reports} reports, {series.all.classified} classified · {Math.round(series.hours).toLocaleString()} hours in {series.monthsWithHours} month(s)
        </div>
        <RateCards rates={rates} />
        <p className="text-[11px] text-pl-muted">
          Each rate is events times its base over hours worked, summed over the months that have hours. The interval is the Garwood exact 95% interval for a Poisson count: with few events it is wide, and that width is real.
          LTIF is always per 1,000,000 hours and FAR per 100,000,000.
        </p>
        <MonthlyTable series={series} />
      </div>
    );
  } else if (tab === 'trends') {
    body = (
      <div className="space-y-4">
        {filters}
        <Pick
          label="Rate"
          value={trendMetricId}
          onChange={setTrendMetricId}
          options={METRICS.map((m) => ({ value: m.id, label: `${m.short}: ${m.name}` }))}
          className="max-w-sm"
        />
        {exposure.length === 0 ? coverage : (
          <>
            <RollingChart rolling={rolling} metric={trendMetric} baseLabel={trendBaseLabel} from={from} />
            <UChartView chart={uchart} metric={trendMetric} baseLabel={trendBaseLabel} />
          </>
        )}
      </div>
    );
  } else if (tab === 'compare') {
    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-pl-border bg-pl-surface p-4 shadow-pl-sm">
          <Pick label="Workforce" value={workforce} onChange={setWorkforce} options={WORKFORCES.map((w) => ({ value: w.id, label: w.label }))} className="min-w-[200px]" />
          <Pick
            label="Base"
            value={base}
            onChange={setBase}
            options={OCCUPATIONAL_BASES.map((b) => ({ value: String(b.value), label: b.label }))}
            className="min-w-[240px]"
          />
        </div>
        {exposure.length === 0 ? coverage : (
          <CompareRates
            reports={reports}
            exposure={exposure}
            workforce={workforce}
            base={occupationalBase}
            siteOptions={siteOptions}
            siteName={siteName}
            defaultA={{ from, to, siteId }}
            defaultB={{ from: addMonths(from, -WINDOW), to: addMonths(to, -WINDOW), siteId }}
          />
        )}
      </div>
    );
  } else {
    body = <ExposureHoursPanel orgId={orgId} rows={exposure} sites={sites} canEdit={canEdit} onChanged={load} />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-pl-bg text-pl-text flex-col">
      {header}
      <div className="flex-1 overflow-auto p-4 sm:p-6 max-w-[1600px] w-full mx-auto">{body}</div>
    </div>
  );
}

