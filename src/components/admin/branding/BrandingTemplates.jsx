import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { superAdminBrandingService } from '@/services/superAdminBrandingService';
import { useToast } from "@/components/ui/use-toast";
import { Save, FolderOpen } from 'lucide-react';

export default function BrandingTemplates({ onApply, currentSettings }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await superAdminBrandingService.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await superAdminBrandingService.createTemplate({
        name: newTemplateName,
        branding_config: currentSettings
      });
      toast({ title: "Template Saved", description: "Branding configuration saved as template." });
      setSaveOpen(false);
      loadTemplates();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApply = (template) => {
    onApply(template.branding_config);
    setLoadOpen(false);
    toast({ title: "Template Loaded", description: `Applied template: ${template.name}` });
  };

  return (
    <>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-[#3a3a5a] text-gray-300">
            <Save className="mr-2 h-4 w-4" /> Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <DialogHeader>
            <DialogTitle>Save Branding Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input 
                value={newTemplateName} 
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="bg-[#111827] border-[#3a3a5a] text-white"
              />
            </div>
            <Button onClick={handleSaveTemplate} className="w-full petrolord-button">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-[#3a3a5a] text-gray-300">
            <FolderOpen className="mr-2 h-4 w-4" /> Load Template
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center">No templates found.</p>
            ) : (
              <div className="grid gap-2">
                {templates.map(t => (
                  <Button 
                    key={t.id} 
                    variant="ghost" 
                    className="justify-start hover:bg-[#252541]"
                    onClick={() => handleApply(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}