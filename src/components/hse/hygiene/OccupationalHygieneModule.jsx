import React, { useCallback, useEffect, useState } from 'react';
import { Ear, Volume2, FlaskConical, Thermometer, ClipboardList, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useHSE } from '@/context/HSEContext';
import { hygieneService, isSchemaMissing } from '@/services/hygieneService';
import {
  blankNoiseForm, blankChemicalForm, blankHeatForm, noiseFormFromRow, chemicalFormFromRows, heatFormFromRow,
} from '@/lib/hygiene/forms';
import { Notice } from './hygieneUi';
import NoiseTab from './NoiseTab';
import ChemicalTab from './ChemicalTab';
import HeatTab from './HeatTab';
import RecordsTab from './RecordsTab';

/** Who sees the module (LeftNav) and who may save (the database decides too). */
export const HYGIENE_ROLES = ['super_admin', 'org_admin', 'manager', 'supervisor', 'health_officer'];

// Design family (batch 2B): the module renders inside the signed-in scope
// (src/design/SignedInScope.jsx), so it uses the theme roles directly. The tabs
// keep their underline look on the roles.
const tabClass = 'gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none';

export default function OccupationalHygieneModule() {
  const { currentOrganization, role } = useHSE();
  const orgId = currentOrganization?.id;
  const canEdit = HYGIENE_ROLES.includes(role);

  const [tab, setTab] = useState('noise');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [records, setRecords] = useState({ noise: [], chemical: [], heat: [] });
  const [sites, setSites] = useState([]);

  const [noiseForm, setNoiseForm] = useState(blankNoiseForm);
  const [chemicalForm, setChemicalForm] = useState(blankChemicalForm);
  const [heatForm, setHeatForm] = useState(blankHeatForm);

  const load = useCallback(async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    setLoadError(null);
    const [n, c, h, s] = await Promise.all([
      hygieneService.listNoise(orgId),
      hygieneService.listChemical(orgId),
      hygieneService.listHeat(orgId),
      hygieneService.getSites(orgId),
    ]);
    const missing = [n, c, h].some((r) => isSchemaMissing(r.error));
    setSchemaMissing(missing);
    const other = [n.error, c.error, h.error, s.error].find((e) => e && !isSchemaMissing(e));
    if (other) setLoadError(other.message || 'Could not load hygiene records.');
    setRecords({ noise: n.error ? [] : n.data, chemical: c.error ? [] : c.data, heat: h.error ? [] : h.data });
    setSites(s.data || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  // after a save the form keeps the saved row, so a second save updates it
  const onSaved = (kind, data) => {
    if (kind === 'noise' && data) setNoiseForm(noiseFormFromRow(data));
    if (kind === 'heat' && data) setHeatForm(heatFormFromRow(data));
    if (kind === 'chemical' && data && data.length) setChemicalForm(chemicalFormFromRows(data));
    load();
  };

  const onOpen = (kind, rows) => {
    if (kind === 'noise') setNoiseForm(noiseFormFromRow(rows[0]));
    if (kind === 'chemical') setChemicalForm(chemicalFormFromRows(rows));
    if (kind === 'heat') setHeatForm(heatFormFromRow(rows[0]));
    setTab(kind);
  };

  let saveBlockReason = null;
  if (!orgId) saveBlockReason = 'Select an organization to save.';
  else if (schemaMissing) saveBlockReason = 'Saving is not switched on in this environment yet.';

  const common = { orgId, sites, canSave: canEdit, saveBlockReason, onSaved };

  const header = (
    <div className="flex flex-col border-b border-pl-border bg-pl-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="hidden sm:block bg-pl-sunken p-2 rounded-lg">
            <Ear className="h-6 w-6 text-pl-muted" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-pl-display text-2xl font-semibold text-pl-text">Occupational Hygiene</h2>
            <p className="text-xs text-pl-muted">Noise dose and TWA, chemical TWA, STEL and mixtures, and heat stress against published criteria</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> Refresh
        </Button>
      </div>
      <div className="px-4 overflow-x-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="noise" className={tabClass}><Volume2 className="h-4 w-4" aria-hidden="true" /> Noise</TabsTrigger>
            <TabsTrigger value="chemical" className={tabClass}><FlaskConical className="h-4 w-4" aria-hidden="true" /> Chemical</TabsTrigger>
            <TabsTrigger value="heat" className={tabClass}><Thermometer className="h-4 w-4" aria-hidden="true" /> Heat</TabsTrigger>
            <TabsTrigger value="records" className={tabClass}><ClipboardList className="h-4 w-4" aria-hidden="true" /> Records</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );

  let body;
  if (tab === 'noise') body = <NoiseTab {...common} form={noiseForm} setForm={setNoiseForm} />;
  else if (tab === 'chemical') body = <ChemicalTab {...common} form={chemicalForm} setForm={setChemicalForm} />;
  else if (tab === 'heat') body = <HeatTab {...common} form={heatForm} setForm={setHeatForm} />;
  else if (loading) body = <div className="py-16 text-center text-pl-muted">Loading hygiene records...</div>;
  else if (schemaMissing) body = null;
  else if (loadError) body = <Notice tone="warn" title="Could not load">{loadError}</Notice>;
  else body = <RecordsTab orgId={orgId} records={records} sites={sites} canEdit={canEdit} onOpen={onOpen} onChanged={load} />;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-pl-bg text-pl-text flex-col">
      {header}
      <div className="flex-1 overflow-auto p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
        {schemaMissing && (
          <Notice tone="warn" title="Hygiene records are not switched on yet">
            The database update that stores noise, chemical and heat records (HS2) has not been applied to this environment.
            The calculators on each tab work now; saving and the Records list appear once your Petrolord administrator applies it.
          </Notice>
        )}
        {!canEdit && tab !== 'records' && (
          <Notice>You can use the calculators here. Only a supervisor, manager, health officer or admin can save records.</Notice>
        )}
        {body}
      </div>
    </div>
  );
}
