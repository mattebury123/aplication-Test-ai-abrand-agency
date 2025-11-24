
import React, { useState, useEffect } from 'react';
import BrandInput from './components/BrandInput';
import BrandStrategyView from './components/BrandStrategyView';
import ApiKeyModal from './components/ApiKeyModal';
import DeveloperTree from './components/DeveloperTree';
import { checkApiKey, requestApiKey, generateBrandConcepts, generateBrandImage } from './services/geminiService';
import { Project, BrandConcept, MockupAssets, AssetVersion } from './types';
import { Plus, Folder, Trash2, AlertTriangle, X, Check, ChevronLeft, Code } from 'lucide-react';
import { get, set } from 'idb-keyval';

// --- Configuration Constants ---

const MOCKUP_TYPES: { key: keyof MockupAssets; promptSuffix: string; ratio: '1:1' | '16:9' | '9:16' }[] = [
  { key: 'website', promptSuffix: "Laptop screen showing website landing page design, ui/ux, digital interface", ratio: '16:9' },
  { key: 'signage', promptSuffix: "Modern 3D storefront signage, high end architectural photography, photorealistic", ratio: '16:9' },
  { key: 'merchandise', promptSuffix: "Branded merchandise collection including tote bag and coffee mug, studio lighting", ratio: '1:1' },
  { key: 'stationery', promptSuffix: "Premium stationery set, business cards, letterhead, and envelope, overhead view, elegant", ratio: '16:9' },
  { key: 'menu', promptSuffix: "Restaurant menu or service list on clipboard or table, close up, depth of field", ratio: '9:16' },
  { key: 'packaging', promptSuffix: "Product packaging design, box or bag, minimalist studio setting", ratio: '1:1' },
  { key: 'social', promptSuffix: "Instagram story social media promotional design, modern typography, phone screen format", ratio: '9:16' },
  { key: 'uniform', promptSuffix: "Staff uniform or apparel design, t-shirt or apron, professional model", ratio: '9:16' },
  { key: 'interior', promptSuffix: "Interior design of the physical space, shop or office environment, atmospheric lighting", ratio: '16:9' },
];

// --- Delete Confirmation Modal ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-neutral-900/80 border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-white text-center mb-2">Delete Project?</h3>
        <p className="text-white/50 text-center mb-8 text-sm leading-relaxed">
          Are you sure you want to delete this brand identity? This action cannot be undone.
        </p>
        
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Developer Mode State
  const [showDevTree, setShowDevTree] = useState<boolean>(false);
  
  // State for delete modal
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const currentProject = projects.find(p => p.id === activeProjectId) || null;

  // --- STORAGE LOGIC ---
  useEffect(() => {
    const initStorage = async () => {
      // 1. Check for legacy LocalStorage data (migration)
      const legacy = localStorage.getItem('lumina_projects');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("Migrating legacy projects to IndexedDB...", parsed.length);
            setProjects(parsed);
            await set('lumina_projects', parsed);
            localStorage.removeItem('lumina_projects'); // Cleanup legacy
            return;
          }
        } catch (e) {
          console.error("Failed to migrate legacy projects", e);
        }
      }

      // 2. Load from IndexedDB
      try {
        const saved = await get('lumina_projects');
        if (saved && Array.isArray(saved)) {
          setProjects(saved);
        }
      } catch (e) {
        console.error("Failed to load projects from IndexedDB", e);
      }
    };

    initStorage();
  }, []);

  // Save to IndexedDB whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      set('lumina_projects', projects).catch(e => console.error("IDB Save Failed", e));
    } else {
        // If array is empty, we might want to verify if we should clear DB, 
        // but generally safer to leave it unless explicit delete all.
        // For now, let's sync empty array if projects was initialized.
        // We can check if we have initialized by a ref, but simple check:
        // If we are deleting the last project, we should probably update DB.
        // Let's rely on delete handler for that.
    }
  }, [projects]);

  const verifyKey = async () => {
    try {
      const exists = await checkApiKey();
      setHasKey(exists);
    } catch (e) {
      setHasKey(false);
    } finally {
      setCheckingKey(false);
    }
  };

  useEffect(() => {
    verifyKey();
  }, []);

  const handleKeySelection = async () => {
    await requestApiKey();
    setHasKey(true);
  };

  // Handler for opening the delete modal
  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setProjectToDelete(id);
  };

  // Handler for confirming deletion
  const confirmDelete = async () => {
    if (projectToDelete) {
      const updatedProjects = projects.filter(p => p.id !== projectToDelete);
      setProjects(updatedProjects);
      await set('lumina_projects', updatedProjects); // Sync immediately
      
      if (activeProjectId === projectToDelete) setActiveProjectId(null);
      setProjectToDelete(null);
    }
  };

  const updateProjectConcepts = (projectId: string, conceptId: string, updates: Partial<BrandConcept>) => {
    setProjects(prevProjects => {
      const newProjects = prevProjects.map(p => {
        if (p.id !== projectId) return p;
        if (!p.concepts || !Array.isArray(p.concepts)) return p;

        const newConcepts = p.concepts.map(c => {
          if (c.id !== conceptId) return c;
          
          // Deep merge for mockups
          if (updates.mockups) {
            return {
              ...c,
              ...updates,
              mockups: { ...(c.mockups || {}), ...updates.mockups }
            };
          }

          // Deep merge for campaign assets
          if (updates.campaignAssets) {
            return {
              ...c,
              ...updates,
              campaignAssets: { ...(c.campaignAssets || {}), ...updates.campaignAssets }
            };
          }

          return { ...c, ...updates };
        });
        
        return { 
          ...p, 
          concepts: newConcepts,
        } as Project;
      });
      return newProjects;
    });
  };

  // --- ON-DEMAND GENERATION LOGIC WITH HISTORY ---

  const handleGenerateStepAsset = async (projectId: string, conceptId: string, stepId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const concept = project.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    // Helper to add history
    const addToHistory = (currentUrl: string | undefined, newUrl: string, historyArray: AssetVersion[] | undefined): AssetVersion[] => {
      const history = historyArray ? [...historyArray] : [];
      const newVersion: AssetVersion = {
        id: Date.now().toString(),
        url: newUrl,
        timestamp: Date.now()
      };
      // Limit to last 5 versions
      return [newVersion, ...history].slice(0, 5); 
    };

    try {
        if (stepId === 'logo') {
            updateProjectConcepts(projectId, conceptId, { logoUrl: '' }); // '' indicates loading

            const logoUrl = await generateBrandImage(
                `Minimalist vector logo for ${project.companyName} (${project.businessType}). Concept: ${concept.logoConcept}. Style: ${project.brandStyle}. Solid background, high quality, professional design.`,
                '1K', '1:1'
            );
            
            const newHistory = addToHistory(concept.logoUrl, logoUrl, concept.logoHistory);
            updateProjectConcepts(projectId, conceptId, { logoUrl, logoHistory: newHistory });
        } 
        else if (stepId === 'moodboard') {
            updateProjectConcepts(projectId, conceptId, { moodBoardUrl: '' });

            const moodBoardPrompt = `Professional moodboard layout for ${project.companyName}. Theme: ${concept.moodBoard}. Style: ${project.brandStyle}. Include visual textures, color swatches matching palette, and lifestyle imagery. High resolution, 4k.`;
            const logoRef = (concept.logoUrl && !concept.logoUrl.startsWith('error')) ? concept.logoUrl : undefined;

            const moodBoardUrl = await generateBrandImage(moodBoardPrompt, '1K', '16:9', logoRef);
            
            const newHistory = addToHistory(concept.moodBoardUrl, moodBoardUrl, concept.moodBoardHistory);
            updateProjectConcepts(projectId, conceptId, { moodBoardUrl, moodBoardHistory: newHistory });
        }
        else if (stepId === 'mockups') {
             const basePrompt = `Brand application for ${project.companyName} (${project.businessType}). Style: ${project.brandStyle}. Theme: ${concept.summary}.`;
             const logoRef = (concept.logoUrl && !concept.logoUrl.startsWith('error')) ? concept.logoUrl : undefined;
             
             const loadingMockups: any = {};
             MOCKUP_TYPES.forEach(t => loadingMockups[t.key] = ''); 
             updateProjectConcepts(projectId, conceptId, { mockups: { ...(concept.mockups || {}), ...loadingMockups } });

             for (const type of MOCKUP_TYPES) {
                 try {
                    const url = await generateBrandImage(`${basePrompt} ${type.promptSuffix}`, '1K', type.ratio, logoRef);
                    
                    // We need to use setProjects updater to get the fresh state to avoid race conditions in the loop
                    // But our updateProjectConcepts is already using functional update.
                    // However, we are in a loop. We should fetch fresh reference or rely on the functional update.
                    // The functional update inside updateProjectConcepts handles previous state correctly.
                    
                    // Wait for state to settle slightly? No, functional update is fine.
                    // But we need to make sure we don't overwrite previous loop iterations if React batches updates.
                    // Actually, since we await generateBrandImage, the state update happens sequentially.
                    
                    // Small optimization: get fresh mockups object from state before update?
                    // No, updateProjectConcepts does a deep merge: mockups: { ...(c.mockups || {}), ...updates.mockups }
                    // So subsequent updates in the loop preserve previous keys.
                    
                    updateProjectConcepts(projectId, conceptId, { mockups: { [type.key]: url } });
                    
                    // Save to DB incrementally in case of crash
                    try {
                        // We can't easily save just this field to DB without full project state.
                        // Rely on the useEffect[projects] to save.
                    } catch(e) {}

                 } catch(e) {
                    console.error(`Failed to generate mockup ${type.key}`, e);
                    updateProjectConcepts(projectId, conceptId, { mockups: { [type.key]: 'error_failed' } });
                 }
             }
        }
        else if (stepId === 'social') {
            const campaigns = concept.campaigns || [];
            const logoRef = (concept.logoUrl && !concept.logoUrl.startsWith('error')) ? concept.logoUrl : undefined;
            
            const loadingAssets: any = {};
            campaigns.forEach((_, i) => loadingAssets[i] = '');
            updateProjectConcepts(projectId, conceptId, { campaignAssets: { ...(concept.campaignAssets || {}), ...loadingAssets } });

            for (let i = 0; i < campaigns.length; i++) {
                const post = campaigns[i];
                if (!post) continue;
                try {
                    const url = await generateBrandImage(`Social media image for ${project.companyName}. Platform: ${post.platform}. ${post.imagePrompt}`, '1K', '1:1', logoRef);
                    updateProjectConcepts(projectId, conceptId, { campaignAssets: { [i]: url } });
                } catch(e) {
                    updateProjectConcepts(projectId, conceptId, { campaignAssets: { [i]: 'error_failed' } });
                }
            }
        }

    } catch (e) {
        console.error("Failed to generate asset", e);
        if (stepId === 'logo') updateProjectConcepts(projectId, conceptId, { logoUrl: 'error_failed' });
        if (stepId === 'moodboard') updateProjectConcepts(projectId, conceptId, { moodBoardUrl: 'error_failed' });
    }
  };

  const handleSelectVersion = (projectId: string, conceptId: string, stepId: string, versionUrl: string) => {
      if (stepId === 'logo') {
          updateProjectConcepts(projectId, conceptId, { logoUrl: versionUrl });
      }
      else if (stepId === 'moodboard') {
          updateProjectConcepts(projectId, conceptId, { moodBoardUrl: versionUrl });
      }
  };


  const handleAddConcept = async () => {
    if (!activeProjectId) return;
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;

    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, status: 'generating_text' } : p));

    try {
        const newConcepts = await generateBrandConcepts(
            project.companyName, 
            project.description, 
            project.businessType, 
            project.brandStyle, 
            project.websiteUrl
        );
        
        if (newConcepts.length > 0) {
            const newConcept = newConcepts[0];
            newConcept.id = `concept-${Date.now()}-${project.concepts.length}`;
            
            const updatedProject: Project = {
                ...project,
                concepts: [...project.concepts, newConcept],
                status: 'generating_images',
            };
            
            setProjects(prev => prev.map(p => p.id === activeProjectId ? updatedProject : p));
        }
    } catch (e) {
        console.error("Failed to add concept", e);
        setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, status: project.status } : p));
        alert("Could not generate a new concept. Please try again.");
    }
  };

  const handleBrandSubmit = async (name: string, desc: string, type: string, style: string, website: string) => {
    setLoading(true);
    const newId = Date.now().toString();
    const newProject: Project = {
      id: newId,
      companyName: name,
      description: desc,
      businessType: type,
      brandStyle: style,
      websiteUrl: website,
      createdAt: Date.now(),
      status: 'generating_text',
      progress: 0,
      concepts: []
    };

    try {
      const concepts = await generateBrandConcepts(name, desc, type, style, website);
      const projectWithConcepts: Project = {
        ...newProject,
        status: 'generating_images', 
        progress: 10,
        concepts: concepts
      };

      setProjects(prev => [projectWithConcepts, ...prev]);
      setActiveProjectId(newId);
      setIsCreating(false);
      setLoading(false); 

    } catch (error: any) {
      console.error("Generation failed:", error);
      setLoading(false);
      
      if (
        String(error).includes("403") || 
        String(error).includes("PERMISSION_DENIED")
      ) {
        setHasKey(false); 
      } else {
        alert("Failed to generate brand strategy. Please try again.");
      }
    }
  };

  if (checkingKey) return <div className="min-h-screen bg-black flex items-center justify-center text-white/30">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans">
        
        {/* --- LIQUID BACKGROUND LAYER --- */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/20 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
            <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-fuchsia-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        </div>

        {/* Modal Layer */}
        {!hasKey && (
            <div className="relative z-50">
                <ApiKeyModal onSelectKey={handleKeySelection} />
            </div>
        )}
        
        <DeleteConfirmModal 
            isOpen={!!projectToDelete} 
            onClose={() => setProjectToDelete(null)} 
            onConfirm={confirmDelete} 
        />
        
        {showDevTree && (
            <DeveloperTree onClose={() => setShowDevTree(false)} />
        )}

        {/* --- MAIN CONTENT --- */}
        <div className={`relative z-10 transition-opacity duration-500 ${!hasKey ? 'opacity-20 pointer-events-none blur-sm' : 'opacity-100'}`}>
            
            {currentProject ? (
                <BrandStrategyView 
                  project={currentProject} 
                  onBack={() => setActiveProjectId(null)} 
                  onGenerateStepAsset={(conceptId, stepId) => handleGenerateStepAsset(currentProject.id, conceptId, stepId)}
                  onSelectVersion={(conceptId, stepId, url) => handleSelectVersion(currentProject.id, conceptId, stepId, url)}
                  onAddConcept={handleAddConcept}
                />
            ) : (
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                        <div>
                            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Projects</h1>
                            <p className="text-white/40">Manage your brand identities.</p>
                        </div>
                        
                        {!isCreating && (
                            <div className="flex items-center gap-3">
                                {/* Developer Tree Button */}
                                <button 
                                    onClick={() => setShowDevTree(true)}
                                    className="w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all hover:scale-105 shadow-lg"
                                    title="Developer Architecture View"
                                >
                                    <Code className="w-5 h-5" />
                                </button>
                                
                                <button 
                                    onClick={() => setIsCreating(true)}
                                    className="group flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-bold shadow-lg shadow-white/10 hover:shadow-xl hover:scale-105 transition-all duration-300"
                                >
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    <span>Create New</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    {isCreating ? (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <button 
                                onClick={() => setIsCreating(false)}
                                className="mb-6 flex items-center text-white/50 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5 w-fit"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Cancel
                            </button>
                            <BrandInput onSubmit={handleBrandSubmit} isLoading={loading} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.length === 0 ? (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-gradient-to-tr from-white/5 to-white/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                                        <Folder className="w-8 h-8 text-white/30" />
                                    </div>
                                    <h3 className="text-2xl font-serif text-white mb-2">No projects yet</h3>
                                    <p className="text-white/40 mb-8 max-w-sm">
                                        Start your first brand identity project to see the magic happen.
                                    </p>
                                    <button 
                                        onClick={() => setIsCreating(true)}
                                        className="text-pink-300 hover:text-pink-200 font-medium hover:underline underline-offset-4"
                                    >
                                        Start a new project
                                    </button>
                                </div>
                            ) : (
                                projects.map(project => (
                                    <div 
                                        key={project.id}
                                        onClick={() => setActiveProjectId(project.id)}
                                        className="group relative bg-neutral-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-[2rem] p-8 cursor-pointer transition-all duration-300 hover:bg-neutral-900/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/10 ring-1 ring-white/5 overflow-visible"
                                    >
                                        <button
                                            onClick={(e) => requestDelete(e, project.id)}
                                            className="absolute -top-3 -right-3 z-[60] bg-neutral-900 border border-white/10 p-2.5 rounded-full text-white/40 hover:text-red-400 hover:border-red-500/50 shadow-xl transition-all duration-200 hover:scale-110"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-4 h-4 pointer-events-none" />
                                        </button>

                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/5 flex items-center justify-center text-white font-serif font-bold text-xl mb-6 shadow-inner">
                                            {project.companyName ? project.companyName.substring(0,2).toUpperCase() : '??'}
                                        </div>
                                        
                                        <h3 className="text-2xl font-bold text-white mb-2 truncate pr-2">{project.companyName}</h3>
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-8">{project.businessType}</p>
                                        
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex flex-col w-full mr-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Status</span>
                                                    <span className={`text-[10px] font-bold ${project.status === 'complete' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {project.status === 'complete' ? 'Ready' : `In Progress`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-1">Date</span>
                                                <span className="text-xs text-white/60 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default App;
