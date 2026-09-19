// HS2 Occupational Hygiene: the layer between entered periods and the H2
// exposure engine (src/lib/engines/exposure.js, vendored unchanged from
// petrolord-engines). Every figure on screen comes out of an engine call made
// here. This file only decides WHICH engine calls a record needs and passes
// the engine's own results, warnings and refusals through untouched.
//
// A refusal is the engine's { error, field } object. Callers render it by
// name; nothing here turns a refusal into a zero.

import {
  NOISE_CRITERIA,
  EU_NOISE_VALUES,
  EXPOSURE_SOURCES,
  noiseDose,
  lexEightHourDbA,
  oshaActionLevelForShiftDbA,
  hearingProtectorEstimate,
  chemicalTwa8h,
  chemicalStel15Min,
  mixtureExposureIndex,
  briefScalaAdjustedLimit,
  wbgtIndoorC,
  wbgtOutdoorC,
  nioshHeatAssessment,
  nioshRecommendedAlertLimitC,
  nioshRecommendedExposureLimitC,
} from '@/lib/engines/exposure';

export { NOISE_CRITERIA, EU_NOISE_VALUES, EXPOSURE_SOURCES };

export const isRefusal = (r) => !!r && typeof r.error === 'string';

/** The three dose criteria shown side by side, in this order. */
export const NOISE_PRESET_IDS = ['OSHA_PEL', 'OSHA_ACTION_LEVEL', 'NIOSH_REL'];

/* ------------------------------------------------------------------ */
/* Noise                                                               */
/* ------------------------------------------------------------------ */

export const PROTECTOR_METHODS = [
  { id: 'OSHA_APPENDIX_B', label: 'OSHA Appendix B (NRR minus 7 on dBA)', exposureCriterion: 'OSHA_ACTION_LEVEL' },
  { id: 'OSHA_FIELD_50', label: 'OSHA field derating, 50% (engineering controls decision)', exposureCriterion: 'OSHA_PEL' },
  { id: 'OSHA_DUAL', label: 'OSHA dual protection (higher NRR plus 5 dB)', exposureCriterion: 'OSHA_ACTION_LEVEL' },
  { id: 'NIOSH_TYPE', label: 'NIOSH derating by protector type', exposureCriterion: 'NIOSH_REL' },
];

export const PROTECTOR_TYPES = [
  { id: 'earmuff', label: 'Earmuff (NIOSH credits 75% of NRR)' },
  { id: 'formableEarplug', label: 'Formable earplug (50%)' },
  { id: 'otherEarplug', label: 'Other earplug (30%)' },
];

/**
 * Which A-weighted TWA a protector method is applied to. Appendix B and the
 * dual rule are the hearing conservation adequacy test, so they take the TWA
 * integrated from 80 dB (1910.95(d)(2)(i)); the OTM 50% derating is the
 * engineering controls decision against the PEL, so it takes the PEL TWA
 * (90 dB threshold); the NIOSH derating takes the NIOSH TWA.
 */
const protectorBasis = (method) => (PROTECTOR_METHODS.find((m) => m.id === method) || {}).exposureCriterion;

/**
 * periods: [{ levelDbA, durationH }] (numbers, already parsed).
 * shiftHours: optional, for the OSHA extended-shift action level.
 * protector: optional { method, nrrDb, weighting, protectorType, cWeightedDb }.
 */
export const evaluateNoise = ({ periods, shiftHours = null, protector = null }) => {
  const criteria = NOISE_PRESET_IDS.map((id) => ({
    id,
    criterion: NOISE_CRITERIA[id],
    result: noiseDose(periods, id),
  }));

  // LEX,8h treats each period's level as its LAeq: a steady level held for
  // the period is its own equivalent level.
  const lex = Array.isArray(periods)
    ? lexEightHourDbA(periods.map((p) => ({ laeqDbA: p?.levelDbA, durationH: p?.durationH })))
    : lexEightHourDbA(periods);

  const shiftActionLevel = shiftHours === null || shiftHours === undefined
    ? null
    : oshaActionLevelForShiftDbA(shiftHours);

  let protectorResult = null;
  if (protector && protector.method) {
    const basisId = protectorBasis(protector.method);
    const weighting = protector.weighting || 'A';
    const basis = criteria.find((c) => c.id === basisId);
    let exposureDb;
    let exposureLabel;
    if (weighting === 'C') {
      exposureDb = protector.cWeightedDb;
      exposureLabel = 'the C-weighted level you entered';
    } else {
      exposureDb = isRefusal(basis?.result) ? undefined : basis?.result?.twaDbA;
      exposureLabel = `the ${basis?.criterion?.label || basisId} TWA`;
    }
    if (weighting === 'A' && (exposureDb === null || exposureDb === undefined)) {
      protectorResult = {
        skipped: true,
        reason: isRefusal(basis?.result)
          ? 'the dose was refused, so there is no TWA to attenuate'
          : `no period reaches the threshold of ${basis?.criterion?.label || basisId}, so there is no TWA to attenuate`,
      };
    } else {
      protectorResult = {
        exposureLabel,
        exposureDb,
        result: hearingProtectorEstimate({
          exposureDb,
          weighting,
          nrrDb: protector.nrrDb,
          method: protector.method,
          protectorType: protector.protectorType || undefined,
        }),
      };
    }
  }

  return { criteria, lex, shiftActionLevel, protector: protectorResult };
};

/* ------------------------------------------------------------------ */
/* Chemical                                                            */
/* ------------------------------------------------------------------ */

/**
 * One agent. agent: { periods: [{ concentration, durationH }],
 * stelPeriods: [{ concentration, durationMin }] | null, twaLimit, stelLimit }.
 * schedule: { shiftHours, weeklyHours } (either may be null).
 *
 * Brief and Scala: the engine reduces the LIMIT. It is compared with the
 * average concentration over the shift actually worked, sum(C x T) / shift
 * hours (unsampled time counting as zero, the same convention as the 8-hour
 * TWA). The 1910.1000(d)(1) TWA divides by 8 whatever the shift; the two are
 * different conventions and are reported side by side, never combined.
 */
export const evaluateChemicalAgent = (agent, schedule = {}) => {
  const twa = chemicalTwa8h(agent.periods);
  const stel = agent.stelPeriods && agent.stelPeriods.length ? chemicalStel15Min(agent.stelPeriods) : null;
  const twaLimit = agent.twaLimit ?? null;
  const stelLimit = agent.stelLimit ?? null;

  const twaExceeds = !isRefusal(twa) && twaLimit !== null ? twa.twa8h > twaLimit : null;
  const stelExceeds = stel && !isRefusal(stel) && stelLimit !== null ? stel.stel15Min > stelLimit : null;

  let briefScala = null;
  const { shiftHours = null, weeklyHours = null } = schedule;
  if (twaLimit !== null && (shiftHours !== null || weeklyHours !== null)) {
    const args = { limit: twaLimit };
    if (shiftHours !== null) args.shiftHours = shiftHours;
    if (weeklyHours !== null) args.weeklyHours = weeklyHours;
    const adjusted = briefScalaAdjustedLimit(args);
    let shiftAverage = null;
    if (!isRefusal(adjusted) && !isRefusal(twa) && shiftHours !== null && shiftHours > 0) {
      // sum(C x T) is the engine's twa8h x 8
      shiftAverage = (twa.twa8h * 8) / shiftHours;
    }
    briefScala = {
      result: adjusted,
      shiftAverage,
      exceeds: shiftAverage !== null ? shiftAverage > adjusted.adjustedLimit : null,
    };
  }

  return { twa, stel, twaLimit, stelLimit, twaExceeds, stelExceeds, briefScala };
};

/**
 * The 1910.1000(d)(2) mixture index over agents the user has judged
 * additive: C is each agent's 8-hour TWA, L its TWA limit, in the agent's own
 * units. Agents without a TWA limit, or whose TWA was refused, cannot enter
 * the sum; they are listed so the screen can say so.
 */
export const evaluateMixture = (agents, evaluations) => {
  const components = [];
  const excluded = [];
  agents.forEach((a, i) => {
    const ev = evaluations[i];
    if (!ev || isRefusal(ev.twa)) excluded.push({ index: i, name: a.agentName, reason: 'its 8-hour TWA was refused' });
    else if (ev.twaLimit === null) excluded.push({ index: i, name: a.agentName, reason: 'it has no TWA limit' });
    else components.push({ index: i, name: a.agentName, concentration: ev.twa.twa8h, limit: ev.twaLimit });
  });
  if (components.length < 2) return { result: null, components, excluded };
  return {
    result: mixtureExposureIndex(components.map(({ concentration, limit }) => ({ concentration, limit }))),
    components,
    excluded,
  };
};

/**
 * The caveat FINDINGS-exposure.md requires wherever a heat limit is shown:
 * the equations and WBGT weights are transcription-checked only, and the
 * NIOSH worked example reads its figures off the plotted curves (the
 * niosh-heat-example errata in the vendored golden).
 */
export const HEAT_EQUATION_NOTE = 'The RAL and REL here are the published NIOSH 2016-106 equations (section 8.1): RAL = 59.9 - 14.1 log10 M and '
  + 'REL = 56.7 - 11.5 log10 M, with M the 1-hour time-weighted metabolic rate in watts and the limit in degrees C WBGT. They were checked '
  + 'against the document by transcription only: no printed value reproduces them independently. NIOSH\'s own worked example (section 1.1.3) '
  + 'reads its figures off the plotted curves and gets 27.8 C (REL) and 25 C (RAL) at 348.9 W, where the equations give 27.5 C and 24.1 C.';

/* ------------------------------------------------------------------ */
/* Heat                                                                */
/* ------------------------------------------------------------------ */

export const WBGT_FORMS = [
  { id: 'indoor', label: 'Indoors or no solar load (0.7 Tnwb + 0.3 Tg)' },
  { id: 'outdoor', label: 'Outdoors with solar load (0.7 Tnwb + 0.2 Tg + 0.1 Ta)' },
  { id: 'measured', label: 'WBGT read directly from a meter' },
];

/**
 * form: 'indoor' | 'outdoor' | 'measured'.
 * wbgtPeriods: [{ durationMin, naturalWetBulbC, globeC, dryBulbC? } | { durationMin, wbgtC }].
 * metabolicPeriods: [{ durationMin, metabolicRateW }].
 * Each WBGT period is computed by the engine; a refusal names the period.
 */
export const evaluateHeat = ({ form, wbgtPeriods, metabolicPeriods, acclimatized }) => {
  const periodWbgt = (wbgtPeriods || []).map((p, i) => {
    let r;
    if (form === 'measured') r = { wbgtC: p.wbgtC, form: 'measured', source: 'WBGT meter reading' };
    else if (form === 'outdoor') r = wbgtOutdoorC(p);
    else r = wbgtIndoorC(p);
    if (isRefusal(r)) return { ...r, field: `wbgtPeriods[${i}].${r.field}` };
    return { ...r, durationMin: p.durationMin };
  });
  const firstRefusal = periodWbgt.find(isRefusal);
  const assessment = firstRefusal || nioshHeatAssessment({
    wbgtPeriods: periodWbgt.map((p) => ({ wbgtC: p.wbgtC, durationMin: p.durationMin })),
    metabolicPeriods,
    acclimatized,
  });
  let ral = null;
  let rel = null;
  if (!isRefusal(assessment)) {
    ral = nioshRecommendedAlertLimitC(assessment.metabolicRateTwaW);
    rel = nioshRecommendedExposureLimitC(assessment.metabolicRateTwaW);
  }
  return { periodWbgt, assessment, ral, rel };
};
