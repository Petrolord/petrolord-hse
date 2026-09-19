import { Gauge, Layers, Calculator, Ruler, TrendingUp, Activity, GitCompare, ClipboardCheck, Clock } from 'lucide-react';
import {
  METRICS, INJURY_CLASSES, RATE_BASES,
  basisFor, intervalMethod, compareMethod, rollingBasis, uChartMethod,
} from '@/lib/safetyStats/definitions';

// Built from the engine's own basis strings (base labels, formulas,
// standards, methods), so this article cannot describe a different
// calculation from the one the Safety Statistics module runs.

// The engine's strings are written for developers; name its variables in
// words (the formula itself is unchanged).
const words = (t) => String(t)
  .replace(/exposureHours/g, 'hours worked')
  .replace(/daysLost/g, 'days away')
  .replace(/the caller/g, 'your organization');

const rateItem = (m) => {
  const b = basisFor(m, RATE_BASES.IOGP_1M);
  const baseText = m.fixedBase
    ? `Always ${b.baseLabel}.`
    : `On the base you pick: ${basisFor(m, RATE_BASES.OSHA_200K).baseLabel} or ${b.baseLabel}.`;
  const parts = [m.counts, baseText, `Formula: ${words(b.formula)}.`];
  if (b.standard) parts.push(`Standard: ${b.standard}.`);
  if (b.note) parts.push(`Note: ${words(b.note)}.`);
  return { title: `${m.short}: ${m.name}`, description: parts.join(' ') };
};

const roll = rollingBasis();

export const safetyStatisticsGuide = {
  id: 'safety-statistics',
  title: 'Safety Statistics Guide',
  icon: Gauge,
  description: 'TRIR, DART, LTIF, FAR, severity and process safety event rates from your classified reports and the hours your people worked.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      icon: Layers,
      content: [
        { type: 'paragraph', text: 'Safety Statistics turns two things you record into the rates the industry reports: the reports your people file, once a supervisor has classified them, and the hours worked each month. Open it from the sidebar (Main, Safety Statistics). Supervisors, managers and admins see it.' },
        { type: 'paragraph', text: 'Every rate is a count of events multiplied by a base and divided by the hours worked. Pooled over several months, the counts are added up and the hours are added up before dividing.' },
        { type: 'alert', variant: 'info', title: 'Nothing is guessed', text: 'A report that has not been classified is shown as unclassified and counts in no rate. A month with no hours recorded has no rate, and any report in it is left out of the rates and listed as such. Neither is ever shown as zero.' },
      ],
    },
    {
      id: 'rates',
      title: 'The Rates and Their Bases',
      icon: Calculator,
      content: [
        { type: 'paragraph', text: 'The same three letters can mean different numbers: an OSHA TRIR is per 200,000 hours and an IOGP TRIR per 1,000,000 hours, a factor of five apart. Every rate on screen shows its base beside it.' },
        { type: 'step-list', items: METRICS.map(rateItem) },
        { type: 'paragraph', text: 'What each outcome counts towards:' },
        { type: 'list', items: INJURY_CLASSES.map((c) => `${c.label}: ${c.help}${c.recordable ? ' Recordable.' : ''}`) },
        { type: 'alert', variant: 'warning', title: 'Process safety tiers', text: 'The tier of a process safety event is your organization\'s call against API RP 754, which needs its threshold quantity tables. The module does the rate arithmetic only. PSE rates use total work hours, so they appear in the employees and contractors view.' },
      ],
    },
    {
      id: 'interval',
      title: 'The 95% Interval',
      icon: Ruler,
      content: [
        { type: 'paragraph', text: 'Injuries are rare events, so a rate from a few of them is uncertain. Each rate card shows a 95% interval: the range of underlying rates that could plausibly have produced the count you saw over the hours you worked.' },
        { type: 'paragraph', text: `Method: ${words(intervalMethod())}.` },
        { type: 'list', items: [
          'With few events the interval is wide. That width is real and it is the honest reading of a small count.',
          'With zero events the lower end is 0 and the upper end is still above 0: a clean month does not prove a zero rate.',
          'The severity rate has no interval: days away are not independent events, so the counting model behind the interval does not apply.',
        ] },
      ],
    },
    {
      id: 'trends',
      title: 'Rolling 12-Month Rate and the u-Chart',
      icon: TrendingUp,
      content: [
        { type: 'paragraph', text: `Rolling rate: ${words(roll.formula)}. Each point on the Trends tab pools the twelve months ending that month.` },
        { type: 'paragraph', text: 'Beside it, as a dashed line, is the mean of the monthly rates, shown for comparison only; a month with no hours has no rate and is left out of that mean. The two differ most when one month has few hours and an event in it: that month\'s own rate is huge and drags the mean, while the pooled rate weighs it by its hours. Report the pooled rate.' },
        { type: 'paragraph', text: `u-chart: ${uChartMethod()}. Each month is plotted with its own limits, which are wider for months with fewer hours. A month outside its limits is worth investigating; months inside them are ordinary variation. Months without hours are not charted and are listed under the chart.` },
      ],
    },
    {
      id: 'compare',
      title: 'Comparing Two Periods or Sites',
      icon: GitCompare,
      content: [
        { type: 'paragraph', text: 'The Compare tab puts two selections side by side (a period and a site each) for one rate, and tests whether the difference is more than chance.' },
        { type: 'paragraph', text: `Method: ${compareMethod()}.` },
        { type: 'list', items: [
          'The rate ratio is selection A divided by selection B. Its interval tells you the range of ratios consistent with the data.',
          'If the interval includes 1, the two rates cannot be told apart at these hours.',
          'If selection B has no events, the ratio and its upper limit are unbounded and the screen says so.',
        ] },
      ],
    },
    {
      id: 'classify',
      title: 'Classifying Reports',
      icon: ClipboardCheck,
      content: [
        { type: 'step-list', items: [
          { title: 'Open the report', description: 'In the Supervisor View, choose View Details on the report.' },
          { title: 'Pick the outcome', description: 'Under Safety statistics classification, choose the most serious outcome that applies. For a lost time case enter the calendar days away; for lost time or restricted work you can also enter restricted days.' },
          { title: 'Workforce and date', description: 'Record whether the person was an employee or a contractor, and the date it happened if it differs from the report date.' },
          { title: 'Process safety', description: 'If the event was a loss of primary containment, record its API RP 754 tier as your organization classified it.' },
          { title: 'Save', description: 'The database records who classified the report and when. Only a supervisor, manager or admin can classify.' },
        ] },
        { type: 'alert', variant: 'info', title: 'Older reports', text: 'Reports filed before Safety Statistics was switched on start unclassified. They show in the unclassified count until someone classifies them.' },
      ],
    },
    {
      id: 'hours',
      title: 'Exposure Hours',
      icon: Clock,
      content: [
        { type: 'paragraph', text: 'On the Exposure hours tab, supervisors, managers and admins enter the hours actually worked for each calendar month, per site or for the whole organization, as one combined figure or as separate employee and contractor figures.' },
        { type: 'list', items: [
          'Use payroll, timesheets or the contractor\'s monthly return. Hours must be above zero.',
          'One row per month, site and workforce. Edit a row to correct it.',
          'Enter either a combined figure or the employee and contractor split for a month and site. If both exist, the combined figure is used and the statistics flag it.',
          'The employee and contractor views need the split. A month with only a combined figure has no hours in those views.',
          'A site with hours recorded against it cannot be deleted until its hours are removed.',
        ] },
      ],
    },
    {
      id: 'reading',
      title: 'Reading the Warnings',
      icon: Activity,
      content: [
        { type: 'list', items: [
          'Unclassified: reports in the period that no one has classified yet. They are in no rate.',
          'In months without hours: events in months with no hours recorded. They are in no rate.',
          'No workforce recorded: recordable cases left out of the employee or contractor view because the workforce was not recorded.',
          'No days recorded: lost time cases whose days away were not entered. The severity rate is low by those days.',
        ] },
      ],
    },
  ],
};
