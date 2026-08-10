// src/components/hse/admin/SitesAdmin.jsx
// PETROLORD SITES ADMIN v1 (2026-05-09)
//
// CRUD page for organization_sites. Lists sites in a table; supports add/edit/delete
// via dialogs. Wired through orgAdminService which writes audit log entries.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// PETROLORD SITES ADMIN v2 (2026-05-09): show QR per site
import { Plus, MapPin, Edit2, Trash2, Star, ChevronLeft, QrCode, Copy, RefreshCw } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { QRCodeCanvas } from 'qrcode.react';
import { orgAdminService } from '@/services/orgAdminService';

// Must stay in sync with the organization_sites_site_type_check constraint
// (migration 20260810210000).
const SITE_TYPES = [
  { value: 'rig',       label: 'Rig' },
  { value: 'plant',     label: 'Plant / Refinery' },
  { value: 'facility',  label: 'Facility' },
  { value: 'office',    label: 'Office' },
  { value: 'depot',     label: 'Depot' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'field',     label: 'Field / Outdoor' },
  { value: 'other',     label: 'Other' },
];

const emptyForm = {
  name: '',
  description: '',
  address: '',
  site_type: '',
  contact_person: '',
  contact_email: '',
  is_primary: false
};

export default function SitesAdmin() {
  const { currentOrganization, setActiveModule } = useHSE();
  const { toast } = useToast();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showQrFor, setShowQrFor] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [qrBusy, setQrBusy] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const buildQrUrl = (token) => {
    if (!token) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin + '/observe/' + token;
  };

  // Open a minimal window with a poster layout and print it, instead of
  // window.print() which printed the whole dark app chrome.
  const printPoster = (site) => {
    const canvas = document.getElementById('site-qr-canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Safety Observation QR: ${site.name}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 40px; color: #0f172a; text-align: center; }
        .brand { background: #facc15; padding: 14px; font-weight: bold; font-size: 22px; border-radius: 8px; }
        h1 { font-size: 30px; margin: 28px 0 6px; }
        .site { font-size: 22px; color: #334155; margin-bottom: 24px; }
        img { width: 340px; height: 340px; }
        .steps { text-align: left; display: inline-block; font-size: 17px; line-height: 1.7; margin-top: 24px; }
        .foot { margin-top: 28px; font-size: 13px; color: #64748b; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="brand">Petrolord HSE</div>
      <h1>See something unsafe? Report it.</h1>
      <div class="site">${site.name}</div>
      <img src="${dataUrl}" alt="QR code" />
      <div class="steps">
        1. Scan the code with your phone camera<br/>
        2. Describe what you saw. Add a photo or voice note<br/>
        3. Submit. No login or app needed
      </div>
      <div class="foot">Reports go directly to the site safety team. You can report anonymously.</div>
      <script>window.onload = function(){ window.print(); }<\/script>
      </body></html>`);
    w.document.close();
  };

  const handleRegenerate = async (site) => {
    setQrBusy(true);
    const { data, error } = await orgAdminService.regenerateQrToken(site.id);
    setQrBusy(false);
    setConfirmRegenerate(false);
    if (error) {
      toast({ title: 'Could not regenerate code', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'New QR code issued', description: 'Previously printed posters for this site no longer work.' });
    setShowQrFor(data);
    await refresh();
  };

  const handleToggleQr = async (site) => {
    setQrBusy(true);
    const { data, error } = await orgAdminService.setQrEnabled(site.id, !site.qr_enabled);
    setQrBusy(false);
    if (error) {
      toast({ title: 'Could not update QR status', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: data.qr_enabled ? 'QR submissions enabled' : 'QR submissions disabled' });
    setShowQrFor(data);
    await refresh();
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* ignore */ }
  };

  const refresh = async () => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    const { data } = await orgAdminService.listSites(currentOrganization.id);
    setSites(data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [currentOrganization?.id]);

  const openCreate = () => {
    setEditingSite(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (site) => {
    setEditingSite(site);
    setForm({
      name: site.name || '',
      description: site.description || '',
      address: site.address || '',
      site_type: site.site_type || '',
      contact_person: site.contact_person || '',
      contact_email: site.contact_email || '',
      is_primary: !!site.is_primary
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Site name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = editingSite
      ? await orgAdminService.updateSite(editingSite.id, form)
      : await orgAdminService.createSite(currentOrganization.id, form);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }
    toast({ title: editingSite ? 'Site updated' : 'Site created' });
    setDialogOpen(false);
    await refresh();
  };

  const handleDelete = async (siteId) => {
    const { error } = await orgAdminService.deleteSite(siteId);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Site removed' });
    setConfirmDeleteId(null);
    await refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <button
          onClick={() => setActiveModule({ id: 'admin-setup-hub', label: 'Setup Hub' })}
          className="flex items-center hover:text-white"
        >
          <ChevronLeft className="w-3 h-3" /> Setup Hub
        </button>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Sites
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Physical locations where work happens. Add rigs, plants, offices, depots.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Site
        </Button>
      </div>

      <div className="bg-[#1f1f35] border border-[#2d2d4a] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading sites...</div>
        ) : sites.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-white font-medium mb-1">No sites yet</div>
            <div className="text-slate-400 text-sm mb-4">
              Add your first site so quick reports can be tagged with a location.
            </div>
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add your first site
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d4a] text-slate-300">
              {sites.map((s) => (
                <tr key={s.id} className="hover:bg-[#252541]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{s.name}</span>
                      {s.is_primary && (
                        <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                      )}
                    </div>
                    {s.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{s.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-3 capitalize text-xs">
                    {SITE_TYPES.find(t => t.value === s.site_type)?.label || s.site_type || '—'}
                  </td>
                  <td className="px-6 py-3 text-xs">{s.address || '—'}</td>
                  <td className="px-6 py-3 text-xs">
                    {s.contact_person ? (
                      <>
                        <div>{s.contact_person}</div>
                        {s.contact_email && <div className="text-slate-500">{s.contact_email}</div>}
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setShowQrFor(s)} className="text-slate-300" title="Show QR code">
                      <QrCode className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="text-slate-300">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(s.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d4a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Edit Site' : 'Add Site'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingSite ? 'Update site details.' : 'Create a new site for incident reporting.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-slate-400">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Refinery Block A"
                className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Site Type</Label>
              <Select value={form.site_type} onValueChange={(v) => setForm({ ...form, site_type: v })}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2d2d4a] text-white">
                  {SITE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Address / Location</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street, city, country"
                className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Contact Person</Label>
                <Input
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Contact Email</Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 pt-2">
              <input
                type="checkbox"
                checked={form.is_primary}
                onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                className="accent-blue-500"
              />
              Mark as primary site
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? 'Saving...' : (editingSite ? 'Save changes' : 'Add site')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR display dialog */}
      <Dialog open={!!showQrFor} onOpenChange={() => { setShowQrFor(null); setConfirmRegenerate(false); }}>
        <DialogContent className="bg-white border-slate-300 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">QR code for {showQrFor?.name}</DialogTitle>
            <DialogDescription className="text-slate-600">
              Print or display this code at the site. Anyone who scans it can submit a safety observation without logging in.
            </DialogDescription>
          </DialogHeader>
          {showQrFor && (
            <div className="py-4 flex flex-col items-center gap-4">
              {showQrFor.qr_enabled === false && (
                <div className="w-full text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">
                  QR submissions are currently disabled for this site. Anyone scanning the code sees a "disabled" message.
                </div>
              )}
              <div className={`border border-slate-200 rounded-lg p-3 bg-white ${showQrFor.qr_enabled === false ? 'opacity-40' : ''}`}>
                <QRCodeCanvas
                  id="site-qr-canvas"
                  value={buildQrUrl(showQrFor.qr_token)}
                  size={300}
                  marginSize={2}
                  level="M"
                />
              </div>
              <div className="w-full">
                <div className="text-xs text-slate-500 mb-1">Public URL</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-100 px-2 py-1.5 rounded text-xs text-slate-700 break-all">
                    {buildQrUrl(showQrFor.qr_token)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(buildQrUrl(showQrFor.qr_token))}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    {copiedUrl ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              {confirmRegenerate ? (
                <div className="w-full text-xs bg-amber-50 border border-amber-300 rounded p-3">
                  <div className="text-amber-800 mb-2">
                    Issue a new code? Every previously printed poster for this site will stop working.
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setConfirmRegenerate(false)}>Cancel</Button>
                    <Button size="sm" disabled={qrBusy} onClick={() => handleRegenerate(showQrFor)} className="bg-amber-600 hover:bg-amber-700 text-white">
                      {qrBusy ? 'Working...' : 'Yes, issue new code'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm" disabled={qrBusy} onClick={() => setConfirmRegenerate(true)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={qrBusy}
                    onClick={() => handleToggleQr(showQrFor)}
                    className={showQrFor.qr_enabled === false ? 'text-green-700' : 'text-red-600'}
                  >
                    {showQrFor.qr_enabled === false ? 'Enable submissions' : 'Disable submissions'}
                  </Button>
                </div>
              )}

              <div className="w-full text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-2">
                Tip: print the QR on a laminated card and post it at the site entrance, near the safety briefing board.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQrFor(null)}>Close</Button>
            <Button
              onClick={() => printPoster(showQrFor)}
              disabled={showQrFor?.qr_enabled === false}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Print poster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d4a] text-white">
          <DialogHeader>
            <DialogTitle>Delete this site?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone. Existing reports referencing this site will keep their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button onClick={() => handleDelete(confirmDeleteId)} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
