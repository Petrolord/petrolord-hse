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
        className: "bg-emerald-600 text-white border-none"
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
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      {/* Header */}
      <div className="border-b border-[#3a3a5a] bg-[#1a1a2e]">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Safety Moments Bank</h1>
              <p className="text-[#b0b0c0] text-sm mt-1">Access curated safety topics for your team briefings.</p>
            </div>
            <div className="flex gap-3">
              {/* Only show Seed button if library is empty or for admin/testing */}
              <Button 
                onClick={handleSeed}
                disabled={seeding}
                variant="outline"
                className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white"
              >
                <Database className="mr-2 h-4 w-4" /> {seeding ? "Populating..." : "Restock Library"}
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Moment
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 space-x-6 border-b-0">
              <TabsTrigger 
                value="library" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 rounded-none bg-transparent px-0 py-3 text-[#7a7a9a] hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2"
              >
                <Library className="h-4 w-4" /> Library
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 rounded-none bg-transparent px-0 py-3 text-[#7a7a9a] hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-400 rounded-none bg-transparent px-0 py-3 text-[#7a7a9a] hover:text-white border-b-2 border-transparent transition-all flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" /> Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'dashboard' ? (
          <div className="overflow-y-auto h-full">
             <SafetyMomentDashboard totalMoments={moments.length} />
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