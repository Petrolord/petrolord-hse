import { Ear, Layers, Volume2, Shield, FlaskConical, Thermometer, ClipboardList, BookOpen } from 'lucide-react';
import {
  NOISE_CRITERIA, EU_NOISE_VALUES, NIOSH_NRR_DERATING, NIOSH_HEAT_FIGURE_RANGE_W,
} from '@/lib/engines/exposure';
import {
  EXPOSURE_SOURCES, NOISE_PRESET_IDS, PROTECTOR_METHODS, WBGT_FORMS, HEAT_EQUATION_NOTE,
} from '@/lib/hygiene/evaluate';

// Built from the engine's own criteria and source strings (criterion levels,
// exchange rates, thresholds, limits, derating factors, action values and the
// source of each), so this article cannot describe a different calculation
// from the one the Occupational Hygiene module runs.

const pct = (f) => `${Math.round(f * 100)}%`;

const criterionItem = (id) => {
  const c = NOISE_CRITERIA[id];
  const parts = [
    `Criterion ${c.criterionLevelDbA} dBA, exchange rate ${c.exchangeRateDb} dB, threshold ${c.thresholdDbA} dBA (levels below it add nothing), limit ${c.limitDosePct}% dose.`,
    `TWA = ${c.twaCoefficientDb} log10(dose/100) + ${c.criterionLevelDbA}.`,
  ];
  if (c.ceilingDbA) parts.push(`Ceiling ${c.ceilingDbA} dBA whatever the dose.`);
  parts.push(`Source: ${c.source}.`);
  return { title: c.label, description: parts.join(' ') };
};

const protectorText = {
  OSHA_APPENDIX_B: 'Exposure minus (NRR minus 7) for A-weighted data, exposure minus NRR for C-weighted data. Applied to the OSHA TWA integrated from 80 dB, the hearing conservation test.',
  OSHA_FIELD_50: 'Exposure minus (NRR minus 7) x 50%, A-weighted only. Used when deciding whether engineering controls are needed, so it is applied to the OSHA PEL TWA.',
  OSHA_DUAL: 'Earplugs and earmuffs together: take the higher of the two NRRs, then apply the Appendix B rule and add 5 dB.',
  NIOSH_TYPE: `The labelled NRR is first derated by protector type (earmuff ${pct(NIOSH_NRR_DERATING.earmuff)}, formable earplug ${pct(NIOSH_NRR_DERATING.formableEarplug)}, other earplug ${pct(NIOSH_NRR_DERATING.otherEarplug)}), then the Appendix B rule is applied. Applied to the NIOSH TWA.`,
};

export const occupationalHygieneGuide = {
  id: 'occupational-hygiene',
  title: 'Occupational Hygiene Guide',
  icon: Ear,
  description: 'Noise dose and TWA, chemical TWA, STEL and mixtures, and heat stress, each against the published criterion it names.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      icon: Layers,
      content: [
        { type: 'paragraph', text: 'Occupational Hygiene turns what a hygienist measured into exposures against published criteria. Open it from the sidebar (HSSE Pillars, Occupational Hygiene). Supervisors, managers, health officers and admins see it and can save records.' },
        { type: 'paragraph', text: 'Each tab is a calculator first: results update as you type, before anything is saved. Save a measurement to keep it; the Records tab lists saved noise, chemical and heat records and recomputes every result from the stored measurements.' },
        { type: 'alert', variant: 'info', title: 'Refusals are named', text: 'When an entry cannot be computed (a period table over 24 hours, a heat hour that is not 60 minutes, a limit without its source), the screen says which field was refused and why. Nothing is ever shown as zero in its place.' },
      ],
    },
    {
      id: 'noise',
      title: 'Noise: Dose and TWA by Criterion',
      icon: Volume2,
      content: [
        { type: 'paragraph', text: 'Enter the periods of the day, each a steady A-weighted level and how long it lasted, in hours or minutes. The same periods are then judged against each criterion side by side.' },
        { type: 'paragraph', text: `Dose = 100 x the sum of (time at a level / reference time for that level), where the reference time is 8 / 2^((level minus criterion) / exchange rate) hours. Source: ${EXPOSURE_SOURCES.OSHA_APPENDIX_A}.` },
        { type: 'step-list', items: NOISE_PRESET_IDS.map(criterionItem) },
        { type: 'paragraph', text: 'The OSHA action level is 50% on the same 90 dB, 5 dB dose scale with every level from 80 dB counted, which is the same as an 85 dBA TWA.' },
        { type: 'paragraph', text: `Extended shifts: enter the shift length and the module shows the OSHA action level for that shift, 16.61 log10(50 / (12.5 x hours)) + 90 (${EXPOSURE_SOURCES.OSHA_OTM_NOISE}). The dose above already counts every hour worked, and the PEL is not reduced for a long shift.` },
        { type: 'paragraph', text: `EU and UK: LEX,8h = 10 log10 of the sum of (time / 8 h) x 10^(level / 10), with each period's level taken as its LAeq. Lower action value ${EU_NOISE_VALUES.lowerActionLexDbA} dB(A), upper action value ${EU_NOISE_VALUES.upperActionLexDbA} dB(A), exposure limit value ${EU_NOISE_VALUES.limitLexDbA} dB(A), judged after hearing protection. Exposure points: 100 points is 85 dB(A) over 8 hours. Sources: ${EU_NOISE_VALUES.source}; ${EXPOSURE_SOURCES.HSE_POINTS}.` },
        { type: 'alert', variant: 'warning', title: 'Printed constants', text: 'OSHA prints 16.61 and NIOSH prints 10.0 in the TWA formula. Both are roundings, and the module uses the printed figure so its answers match the published tables. The cost is small: a steady 100 dBA for 8 hours reads 100.05 dBA on the NIOSH scale.' },
        { type: 'list', items: [
          'A level above 130 dBA is past the top of OSHA Table G-16a; it is still counted and a warning says the formula is extrapolated there.',
          'A level above 115 dBA is flagged: it is the highest level OSHA Table G-16 permits and the NIOSH ceiling.',
          'A level exactly at a threshold counts.',
        ] },
      ],
    },
    {
      id: 'protectors',
      title: 'Hearing Protector Estimates',
      icon: Shield,
      content: [
        { type: 'paragraph', text: 'Pick a named method, enter the labelled NRR and, for C-weighted data, the C-weighted level measured for the worker. The estimate shows the exposure it started from, the attenuation credited and the level estimated under the protector.' },
        { type: 'step-list', items: PROTECTOR_METHODS.map((m) => ({ title: m.label, description: protectorText[m.id] })) },
        { type: 'paragraph', text: `Sources: ${EXPOSURE_SOURCES.OSHA_APPENDIX_B}; ${EXPOSURE_SOURCES.OSHA_OTM_NOISE}, Appendix E; ${EXPOSURE_SOURCES.NIOSH_NOISE}.` },
        { type: 'alert', variant: 'info', title: 'A protector never adds noise', text: 'If a method would credit less than zero (an NRR under 7 on A-weighted data), the credit is set to zero and a warning says so. An estimate is not a fit test.' },
      ],
    },
    {
      id: 'chemical',
      title: 'Chemical: TWA, STEL, Mixtures and Long Shifts',
      icon: FlaskConical,
      content: [
        { type: 'paragraph', text: 'Enter each agent with its units, and the limit you are judging it against with where that limit comes from (a regulation, a table or a company standard). No licensed limit table is built in: the limits are yours.' },
        { type: 'list', items: [
          `8-hour TWA = the sum of (concentration x hours) / 8. The divisor is always 8: time not sampled counts as zero, and a longer shift is summed whole. Both cases are flagged. Source: ${EXPOSURE_SOURCES.OSHA_1000_D1}.`,
          'STEL = the sum of (concentration x minutes) / 15 over one 15-minute window. More than 15 minutes is refused; less counts the rest as zero and says so.',
          `Mixture index = the sum of (8-hour TWA / TWA limit) over agents you tick as having additive effects. Above 1 exceeds; exactly 1 passes. Agents without a TWA limit are listed and left out. Source: ${EXPOSURE_SOURCES.OSHA_1000_D2}.`,
          `Brief and Scala: for an unusual schedule the limit is reduced by (8 / h) x (24 minus h) / 16 for an h-hour day, or (40 / h) x (168 minus h) / 128 for an h-hour week. The smaller factor governs, and it never raises a limit. Source: ${EXPOSURE_SOURCES.BRIEF_SCALA}.`,
        ] },
        { type: 'alert', variant: 'warning', title: 'Two conventions, shown side by side', text: 'The reduced Brief and Scala limit is compared with the average concentration over the shift worked. The 8-hour TWA divides by 8 whatever the shift. The module shows both and never combines them.' },
      ],
    },
    {
      id: 'heat',
      title: 'Heat Stress: WBGT and the NIOSH Limits',
      icon: Thermometer,
      content: [
        { type: 'paragraph', text: 'Enter one hour of work and rest: WBGT readings per period and the metabolic rate of each activity in watts. Both tables must total 60 minutes, because the NIOSH limits are 1-hour time-weighted averages.' },
        { type: 'list', items: WBGT_FORMS.map((f) => f.label) },
        { type: 'paragraph', text: `Acclimatized workers are judged against the REL, workers who are not acclimatized against the RAL. Both are shown at the hour's metabolic rate. The NIOSH figures plot ${NIOSH_HEAT_FIGURE_RANGE_W[0]} to ${NIOSH_HEAT_FIGURE_RANGE_W[1]} W; outside that range the equation is extrapolated and a warning says so. Source: ${EXPOSURE_SOURCES.NIOSH_HEAT}.` },
        { type: 'alert', variant: 'warning', title: 'About these limits', text: HEAT_EQUATION_NOTE },
        { type: 'paragraph', text: 'No clothing adjustment is applied. The clothing you record is kept with the assessment for the file.' },
      ],
    },
    {
      id: 'records',
      title: 'Records',
      icon: ClipboardList,
      content: [
        { type: 'list', items: [
          'Every saved noise sample, chemical sample and heat assessment, newest first, filterable by type and site.',
          'The result shown is recomputed from the stored measurements each time, against the criterion the record was judged by.',
          'Agents saved together as a mixture are one record. Open a record to see every figure or to edit it.',
          'Supervisors, managers, health officers and admins can save, edit and delete. The database records who created and last changed each record.',
        ] },
      ],
    },
    {
      id: 'sources',
      title: 'Sources',
      icon: BookOpen,
      content: [
        { type: 'list', items: Object.values(EXPOSURE_SOURCES) },
        { type: 'paragraph', text: 'Not included: ACGIH TLVs (licensed), ISO 9612 uncertainty budgets and ISO 7243 clothing adjustments (paywalled standards), spectral hearing protector methods (they need octave-band data) and chemical ceiling limits.' },
      ],
    },
  ],
};
