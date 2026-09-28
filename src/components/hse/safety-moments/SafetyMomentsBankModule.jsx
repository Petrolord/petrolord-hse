import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { safetyMomentService } from '@/services/safetyMomentService';
import { useHSE } from '@/context/HSEContext';
import SafetyMomentFilters from './SafetyMomentFilters';
import SafetyMomentLibrary from './SafetyMomentLibrary';
import SafetyMomentDashboard from './SafetyMomentDashboard';
import SafetyMomentDetails from './SafetyMomentDetails';
import NewSafetyMomentModal from './modals/NewSafetyMomentModal';
import { LayoutDashboard, Library, Bookmark, Plus, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { safetyMomentsData } from '@/data/safetyMomentsData';

// Design family (batch 2C): Safety Moments renders inside the signed-in scope
// (src/design/rollout/w2c.js), so it uses the theme roles directly. The tabs
// keep their underline look on the roles.
const tabTriggerClass = 'gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none';

export default function SafetyMomentsBankModule() {
  const { currentUser, currentOrganization } = useHSE(); // assuming role check here
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('library');
  const [filters, setFilters] = useState({ search: '', category: 'all', duration: 'all' });
  const [categories, setCategories] = useState([]);
  const [moments, setMoments] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      try {
        const cats = await safetyMomentService.fetchCategories();
        setCategories(cats || []);
        if (currentUser) {
           const saved = await safetyMomentService.fetchSavedMomentIds(currentUser.id);
           setSavedIds(saved || []);
        }
      } catch (e) {
        console.error("Error initializing safety bank", e);
      }
    };
    init();
  }, [currentUser]);

  // Fetch Moments on filter/tab change
  const loadMoments = async () => {
    setLoading(true);
    try {
      const data = await safetyMomentService.fetchMoments(filters);
      // If tab is 'saved', filter locally for now (or could adjust service)
      if (activeTab === 'saved') {
         setMoments(data.filter(m => savedIds.includes(m.id)));
      } else {
         setMoments(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMoments();
  }, [filters, activeTab, savedIds.length]);

  const handleToggleSave = async (momentId) => {
    if (!currentUser) return;
    try {
      const isNowSaved = await safetyMomentService.toggleSave(momentId, currentUser.id);
      setSavedIds(prev => isNowSaved ? [...prev, momentId] : prev.filter(id => id !== momentId));
    } catch(e) {
      console.error(e);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await safetyMomentService.seedMoments(safetyMomentsData);
      toast({
        title: "Library Updated",
        description: `Successfully added ${result.count} rich safety moments to the library.`,
        variant: "success"
      });
      loadMoments();
    } catch (e) {
      console.error(e);
      toast({ title: "Seed Failed", description: "Could not populate library.", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="border-b border-pl-border bg-pl-surface">
        <div className="p-4 sm:p-6 pb-0 sm:pb-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <div className="min-w-0">
              <h1 className="font-pl-display text-2xl font-semibold text-pl-text">Safety Moments Bank</h1>
              <p className="text-pl-muted text-sm mt-1">Access curated safety topics for your team briefings.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Only show Seed button if library is empty or for admin/testing */}
              <Button 
                onClick={handleSeed}
                disabled={seeding}
                variant="outline"
              >
                <Database className="mr-2 h-4 w-4" aria-hidden="true" /> {seeding ? "Populating..." : "Restock Library"}
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Create Moment
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger value="library" className={tabTriggerClass}>
                <Library className="h-4 w-4" aria-hidden="true" /> Library
              </TabsTrigger>
              <TabsTrigger value="dashboard" className={tabTriggerClass}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Overview
              </TabsTrigger>
              <TabsTrigger value="saved" className={tabTriggerClass}>
                <Bookmark className="h-4 w-4" aria-hidden="true" /> Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'dashboard' ? (
          <div className="overflow-y-auto h-full">
             <SafetyMomentDashboard moments={moments} />
          </div>
        ) : (
          <>
            <SafetyMomentFilters 
              filters={filters} 
              setFilters={setFilters} 
              categories={categories} 
            />
            <div className="flex-1 overflow-y-auto">
              <SafetyMomentLibrary 
                moments={moments} 
                loading={loading} 
                onSelect={setSelectedMoment}
                savedIds={savedIds}
              />
            </div>
          </>
        )}
      </div>

      <SafetyMomentDetails 
        moment={selectedMoment}
        isOpen={!!selectedMoment}
        onClose={() => setSelectedMoment(null)}
        isSaved={selectedMoment ? savedIds.includes(selectedMoment.id) : false}
        onToggleSave={handleToggleSave}
      />

      <NewSafetyMomentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadMoments}
        categories={categories}
      />
    </div>
  );
}