// src/components/hse/admin/DepartmentsAdmin.jsx
// PETROLORD DEPARTMENTS ADMIN v1 (2026-05-09)
//
// CRUD page for departments. Mirrors SitesAdmin structure for consistency.
// Soft-delete (is_active=false) preserves historical data.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Edit2, Trash2, ChevronLeft } from 'lucide-react';
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
import { orgAdminService } from '@/services/orgAdminService';

const emptyForm = {
  name: '',
  description: '',
  cost_center: ''
};

export default function DepartmentsAdmin() {
  const { currentOrganization, setActiveModule } = useHSE();
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refresh = async () => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    const { data } = await orgAdminService.listDepartments(currentOrganization.id);
    setDepartments(data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [currentOrganization?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name || '',
      description: dept.description || '',
      cost_center: dept.cost_center || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Department name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = editing
      ? await orgAdminService.updateDepartment(editing.id, form)
      : await orgAdminService.createDepartment(currentOrganization.id, form);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }
    toast({ title: editing ? 'Department updated' : 'Department created' });
    setDialogOpen(false);
    await refresh();
  };

  const handleDelete = async (id) => {
    const { error } = await orgAdminService.deleteDepartment(id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Department removed' });
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
            <Building2 className="w-6 h-6 text-purple-400" />
            Departments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Functional units within your organization (HSE, Operations, Maintenance, etc.).
          </p>
        </div>
        <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> Add Department
        </Button>
      </div>

      <div className="bg-[#1f1f35] border border-[#2d2d4a] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-white font-medium mb-1">No departments yet</div>
            <div className="text-slate-400 text-sm mb-4">
              Define your departmental structure so reports can be assigned to the right team.
            </div>
            <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add your first department
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Cost Center</th>
                <th className="px-6 py-3 text-left">Manager</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d4a] text-slate-300">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-[#252541]">
                  <td className="px-6 py-3">
                    <div className="text-white font-medium">{d.name}</div>
                    {d.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{d.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-xs">{d.cost_center || '—'}</td>
                  <td className="px-6 py-3 text-xs">{d.manager_name || '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(d)} className="text-slate-300">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(d.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d4a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editing ? 'Update department details.' : 'Create a new department.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-slate-400">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. HSE"
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
            <div>
              <Label className="text-xs text-slate-400">Cost Center</Label>
              <Input
                value={form.cost_center}
                onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                placeholder="optional"
                className="bg-[#252541] border-[#3a3a5a] text-white mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? 'Saving...' : (editing ? 'Save changes' : 'Add department')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="bg-[#1a1a2e] border-[#2d2d4a] text-white">
          <DialogHeader>
            <DialogTitle>Remove this department?</DialogTitle>
            <DialogDescription className="text-slate-400">
              The department will be deactivated. Existing reports referencing it remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button onClick={() => handleDelete(confirmDeleteId)} className="bg-red-600 hover:bg-red-700">
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
