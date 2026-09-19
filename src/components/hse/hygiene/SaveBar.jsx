import React, { useState } from 'react';
import { Save, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { describeSaveError } from '@/services/hygieneService';

/**
 * Save and New for one hygiene form. `blocker` is the reason saving is not
 * possible right now (a refusal, a missing label, no permission); when set,
 * the button is disabled and the reason is shown beside it.
 */
export default function SaveBar({ isEdit, blocker, onSave, onNew, savedTitle }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await onSave();
    setSaving(false);
    if (err) {
      setError(describeSaveError(err));
      return;
    }
    toast({ title: isEdit ? 'Record updated' : 'Record saved', description: savedTitle });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={save} disabled={!!blocker || saving} className="bg-[#FFC107] text-black hover:bg-[#FFC107]/90">
        <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save record'}
      </Button>
      <Button variant="outline" onClick={onNew} className="bg-transparent border-[#3a3a5a] text-gray-300">
        <FilePlus2 className="h-4 w-4 mr-2" /> New
      </Button>
      {isEdit && <span className="text-xs text-sky-300">Editing a saved record</span>}
      {blocker && <span className="text-xs text-gray-400">{blocker}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
