
import React, { useState, useEffect } from 'react';
import { Project, BrandConcept, AssetVersion } from '../types';
import { 
  Palette, Type, Image as ImageIcon, 
  Mic2, Flag, MessageSquare, 
  Share2, Layout, Loader2, Download, ChevronLeft, AlertCircle,
  Maximize2, X, Box, Smartphone, Plus, ArrowRight, ArrowLeft, Grid, Check,
  RefreshCw, History, ExternalLink
} from 'lucide-react';
import GeneratedWebsite from './GeneratedWebsite';

interface BrandStrategyViewProps {
  project: Project;
  onBack: () => void;
  onGenerateStepAsset: (conceptId: string, stepId: string) => void;
  onSelectVersion: (conceptId: string, stepId: string, url: string) => void;
  onAddConcept: () => void;
}

const STEPS = [
  { id: 'logo', title: 'The Mark', icon: ImageIcon, color: 'text-pink-400' },
  { id: 'typography', title: 'Typography', icon: Type, color: 'text-blue-400' },
  { id: 'color', title: 'Palette', icon: Palette, color: 'text-teal-400' },
  { id: 'moodboard', title: 'The Vibe', icon: Layout, color: 'text-emerald-400' },
  { id: 'mockups', title: 'In Context', icon: Box, color: 'text-orange-400' },
  { id: 'social', title: 'Social Launch', icon: Smartphone, color: 'text-purple-400' },
  { id: 'strategy', title: 'Strategy', icon: Flag, color: 'text-yellow-400' },
];

const BrandStrategyView: React.FC<BrandStrategyViewProps> = ({ project, onBack, onAddConcept, onGenerateStepAsset, onSelectVersion }) => {
  const [activeConceptIndex, setActiveConceptIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [showWebsiteDemo, setShowWebsiteDemo] = useState(false);
  
  if (!project.concepts || project.concepts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white relative z-10">
        <p className="mb-4 text-neutral-400">No concepts found for this project.</p>
        <button onClick={onBack} className="text-white hover:underline">Back to Dashboard</button>
      </div>
    );
  }
  
  const safeIndex = Math.min(activeConceptIndex, project.concepts.length - 1);
  const activeConcept = project.concepts[safeIndex];
  if (!activeConcept) return null;

  // --- AUTOMATIC GENERATION TRIGGER ON STEP ENTRY ---
  const currentStep = STEPS[currentStepIndex];

  useEffect(() => {
    // Check if current step needs generation and hasn't started yet
    const checkAndGenerate = () => {
        if (currentStep.id === 'logo') {
            if (!activeConcept.logoUrl) {
                onGenerateStepAsset(activeConcept.id, 'logo');
            }
        }
        else if (currentStep.id === 'moodboard') {
            if (!activeConcept.moodBoardUrl) {
                onGenerateStepAsset(activeConcept.id, 'moodboard');
            }
        }
        else if (currentStep.id === 'mockups') {
             // Safe check
             if (!activeConcept.mockups || Object.keys(activeConcept.mockups).length === 0) {
                onGenerateStepAsset(activeConcept.id, 'mockups');
             }
        }
        else if (currentStep.id === 'social') {
             // Safe check
             if (!activeConcept.campaignAssets || Object.keys(activeConcept.campaignAssets).length === 0) {
                onGenerateStepAsset(activeConcept.id, 'social');
             }
        }
    };
    
    checkAndGenerate();
  }, [currentStepIndex, activeConcept.id]); // Run when step changes or concept changes


  // --- GATING LOGIC: Can we proceed? ---
  const canProceed = () => {
      // 1. Logo Step: Must have a logo URL that isn't empty or error
      if (currentStep.id === 'logo') {
          return activeConcept.logoUrl && !activeConcept.logoUrl.startsWith('error') && activeConcept.logoUrl !== '';
      }
      // 2. Moodboard Step: Must have moodboard URL
      if (currentStep.id === 'moodboard') {
           return activeConcept.moodBoardUrl && !activeConcept.moodBoardUrl.startsWith('error') && activeConcept.moodBoardUrl !== '';
      }
      // Other steps (Typography, Color, Strategy) are text-based and "instant", so always proceed.
      // Mockups/Social take a long time, maybe we don't block navigation for them, but let's stick to the pattern
      // "Wait for load". 
      if (currentStep.id === 'mockups') {
          // If mockups are undefined or empty, block. 
           return activeConcept.mockups && Object.keys(activeConcept.mockups).length > 0;
      }
      return true;
  };
  
  const isNextDisabled = !canProceed();


  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Prevent clicking ahead if current step isn't ready, 
    // UNLESS we are going backwards
    if (index > currentStepIndex && isNextDisabled) return;
    
    setDirection(index > currentStepIndex ? 1 : -1);
    setCurrentStepIndex(index);
  };

  return (
    <div className="min-h-screen flex flex-col pb-6 relative z-10 overflow-hidden">
      
      {/* Website Demo Modal */}
      {showWebsiteDemo && (
          <GeneratedWebsite concept={activeConcept} onClose={() => setShowWebsiteDemo(false)} />
      )}

      {/* --- HEADER --- */}
      <header className="px-4 md:px-8 py-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
           {/* Back Button Bubble */}
            <button 
                onClick={onBack}
                className="w-12 h-12 flex items-center justify-center bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-full shadow-lg hover:scale-105 hover:bg-white/10 text-white transition-all shrink-0 ring-1 ring-white/5 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <div className="hidden md:block">
                <h2 className="text-white font-bold text-lg leading-none">{project.companyName}</h2>
                <span className="text-xs text-white/40 uppercase tracking-widest">{activeConcept.name || "Concept"}</span>
            </div>
        </div>

        {/* Concept Switcher Slider */}
        <div className="flex items-center gap-3">
             <div className="relative grid bg-neutral-900/60 backdrop-blur-md rounded-full p-1.5 border border-white/10 shadow-inner"
                  style={{ gridTemplateColumns: `repeat(${project.concepts.length}, minmax(0, 1fr))` }}>
                
                <div 
                    className="absolute top-1.5 bottom-1.5 bg-white/10 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/5 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ 
                        width: `calc((100% - 12px) / ${project.concepts.length})`,
                        left: '6px',
                        transform: `translateX(calc(100% * ${safeIndex}))` 
                    }}
                ></div>

                {project.concepts.map((concept, idx) => (
                  <button
                    key={concept.id}
                    onClick={() => {
                        setActiveConceptIndex(idx);
                        setCurrentStepIndex(0); // Reset to start
                    }}
                    className={`relative z-10 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 text-center truncate tracking-wide min-w-[80px] ${
                      safeIndex === idx ? 'text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {String(concept.name || `Option ${idx + 1}`)}
                  </button>
                ))}
            </div>

            <button 
                onClick={onAddConcept}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-inner"
            >
                {project.status === 'generating_text' ? <Loader2 className="w-4 h-4 animate-spin text-pink-500" /> : <Plus className="w-4 h-4" />}
            </button>
        </div>
      </header>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative w-full max-w-7xl mx-auto">
        
        {/* Progress Stepper (Top) */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto max-w-full pb-2 no-scrollbar">
            {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                const Icon = step.icon;
                
                return (
                    <button
                        key={step.id}
                        onClick={() => handleStepClick(idx)}
                        disabled={idx > currentStepIndex && isNextDisabled} // Disable clicking forward if blocked
                        className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                            isActive 
                                ? 'bg-white/10 border-pink-500/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                                : isCompleted
                                    ? 'bg-neutral-900/40 border-white/10 text-white/60 hover:bg-white/5'
                                    : 'bg-transparent border-transparent text-white/20'
                        } ${idx > currentStepIndex && isNextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:text-white/40'}`}
                    >
                        <Icon className={`w-4 h-4 ${isActive ? step.color : ''}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? 'block' : 'hidden md:block'}`}>{step.title}</span>
                    </button>
                )
            })}
        </div>

        {/* Content Container with Transition */}
        <div className="w-full h-full min-h-[500px] relative">
            <div 
                key={`${currentStepIndex}-${activeConcept.id}`} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-forwards w-full"
            >
                <StepContent 
                    stepId={currentStep.id} 
                    concept={activeConcept} 
                    onRegenerate={() => onGenerateStepAsset(activeConcept.id, currentStep.id)}
                    onSelectVersion={(url) => onSelectVersion(activeConcept.id, currentStep.id, url)}
                    onLaunchWebsite={() => setShowWebsiteDemo(true)}
                />
            </div>
        </div>

      </main>

      {/* --- FOOTER CONTROLS --- */}
      <footer className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
          <button 
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 transition-all ${
                currentStepIndex === 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'bg-neutral-900/60 hover:bg-white/10 hover:border-white/20 backdrop-blur-md text-white'
            }`}
          >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-medium">Previous</span>
          </button>

          <div className="text-white/20 text-xs font-mono tracking-widest">
            STEP {currentStepIndex + 1} / {STEPS.length}
          </div>

          <button 
            onClick={handleNext}
            disabled={currentStepIndex === STEPS.length - 1 || isNextDisabled}
            className={`group flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 transition-all ${
                currentStepIndex === STEPS.length - 1 || isNextDisabled
                ? 'opacity-30 cursor-not-allowed bg-neutral-900/50'
                : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-pink-500/25 hover:scale-105 border-transparent'
            }`}
          >
              <span className="font-bold">
                  {isNextDisabled ? 'Generating...' : 'Next Step'}
              </span>
              {!isNextDisabled && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              {isNextDisabled && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>
      </footer>

    </div>
  );
};

// --- ASSET GENERATOR WRAPPER (Handles History & Regenerate) ---

interface AssetGeneratorProps {
    url?: string;
    history?: AssetVersion[];
    label: string;
    onRegenerate: () => void;
    onSelectVersion: (url: string) => void;
    aspect?: 'square' | 'video';
    className?: string;
}

const AssetGenerator: React.FC<AssetGeneratorProps> = ({ 
    url, history, label, onRegenerate, onSelectVersion, aspect = 'square', className 
}) => {
    
    // Filter out empty or failed ones for the list.
    const validHistory = (history || []).filter(h => h.url && !h.url.startsWith('error') && h.url !== '');

    const isGenerating = url === '';

    return (
        <div className={`flex flex-col gap-4 w-full h-full ${className}`}>
             {/* Main Image Stage */}
             <div className={`w-full relative bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group ${aspect === 'square' ? 'h-[400px] md:h-[500px]' : 'aspect-video'}`}>
                 <GeneratedImageDisplay url={url} label={label} altText={label} aspect={aspect} />
                 
                 {/* Floating Regenerate Button */}
                 <button
                    onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                    disabled={isGenerating}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full text-white/70 hover:text-white hover:bg-pink-500 hover:border-pink-500 transition-all shadow-lg z-20"
                    title="Regenerate Image"
                 >
                    <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                 </button>
             </div>

             {/* History Strip */}
             {validHistory.length > 0 && (
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar h-16">
                     <span className="text-[10px] uppercase text-white/30 font-bold tracking-widest mr-2 shrink-0 flex items-center gap-1">
                         <History className="w-3 h-3"/> Versions
                     </span>
                     {validHistory.map((ver, idx) => (
                         <button
                            key={ver.id || idx}
                            onClick={() => onSelectVersion(ver.url)}
                            className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${ver.url === url ? 'border-pink-500 scale-105' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'}`}
                         >
                             <img src={ver.url} alt="Version" className="w-full h-full object-cover" />
                         </button>
                     ))}
                 </div>
             )}
        </div>
    );
};


// --- STEP CONTENT RENDERER ---

const StepContent: React.FC<{ 
    stepId: string, 
    concept: BrandConcept,
    onRegenerate: () => void,
    onSelectVersion: (url: string) => void,
    onLaunchWebsite: () => void
}> = ({ stepId, concept, onRegenerate, onSelectVersion, onLaunchWebsite }) => {
    
    // Helper for Typeface check
    const isSerifHeadline = () => {
        const text = (String(concept.typography) || '').toLowerCase();
        return text.includes('serif') && !text.includes('sans-serif');
    };
    const headlineClass = isSerifHeadline() ? 'font-serif' : 'font-sans';
    const primaryColor = concept.colorPalette?.[0]?.hex || '#ffffff';

    switch (stepId) {
        case 'logo':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-widest mb-2">
                            The Identity
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 leading-[1.1]">
                            {concept.companyName || "Brand Name"}
                        </h1>
                        <p className="text-xl text-white/70 font-light leading-relaxed max-w-lg">
                            {concept.summary}
                        </p>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Logo Concept</h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                {concept.logoConcept}
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 w-full">
                        <AssetGenerator 
                            url={concept.logoUrl} 
                            history={concept.logoHistory}
                            label="Logo" 
                            onRegenerate={onRegenerate} 
                            onSelectVersion={onSelectVersion}
                        />
                    </div>
                </div>
            );

        case 'typography':
            return (
                <div className="flex flex-col h-full justify-center max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-serif font-bold text-white mb-4">Typography System</h2>
                        <p className="text-white/60 max-w-2xl mx-auto">{concept.typography}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Headline Specimen */}
                        <div 
                            className="relative rounded-[2.5rem] p-10 overflow-hidden min-h-[300px] flex flex-col justify-between border border-white/5 shadow-2xl transition-transform hover:scale-[1.01]"
                            style={{ background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}10)` }}
                        >
                            <div className={`absolute -right-8 -bottom-16 text-[15rem] leading-none opacity-10 ${headlineClass} pointer-events-none text-white select-none`}>Aa</div>
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/90 mb-2 backdrop-blur-md w-fit">Headline</span>
                            <div className={`${headlineClass} text-5xl md:text-6xl text-white font-bold leading-tight z-10`}>
                                The Quick Brown Fox Jumps.
                            </div>
                        </div>

                        {/* Body Specimen */}
                        <div className="relative bg-white/5 rounded-[2.5rem] p-10 overflow-hidden min-h-[300px] flex flex-col justify-between border border-white/5 shadow-2xl backdrop-blur-sm">
                            <div className="absolute -right-4 -top-8 text-[12rem] leading-none opacity-5 font-sans pointer-events-none text-white select-none">Aa</div>
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2 w-fit">Body Copy</span>
                            <div className="font-sans text-lg text-white/80 leading-relaxed z-10">
                                Typography plays a crucial role in brand recognition. It establishes hierarchy, improves readability, and sets the overall tone of communication across all touchpoints.
                            </div>
                             <div className="mt-8 pt-6 border-t border-white/10 font-mono text-xs text-white/30 tracking-[0.2em] leading-loose break-all">
                                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                                abcdefghijklmnopqrstuvwxyz<br/>
                                0123456789
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'color':
            return (
                 <div className="flex flex-col h-full justify-center max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif font-bold text-white mb-4">Color Palette</h2>
                        <p className="text-white/60">A curated spectrum to define the brand's atmosphere.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(concept.colorPalette || []).map((color, idx) => (
                            <div key={idx} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2">
                                <div 
                                    className="absolute inset-0" 
                                    style={{ backgroundColor: color.hex }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">{color.name}</h3>
                                    <p className="font-mono text-white/60 text-sm mb-4">{color.hex}</p>
                                    <p className="text-white/80 text-sm leading-snug opacity-0 group-hover:opacity-100 transition-opacity delay-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                        {color.usage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'moodboard':
             return (
                 <div className="w-full h-full flex flex-col">
                     <div className="flex items-end justify-between mb-6 px-2">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-white">The Aesthetic</h2>
                            <p className="text-white/60 mt-2 max-w-xl">{concept.moodBoard}</p>
                        </div>
                     </div>
                     <div className="flex-1">
                        <AssetGenerator
                            url={concept.moodBoardUrl}
                            history={concept.moodBoardHistory}
                            label="Mood Board"
                            onRegenerate={onRegenerate}
                            onSelectVersion={onSelectVersion}
                            aspect="video"
                            className="h-full"
                        />
                     </div>
                 </div>
            );

        case 'mockups':
            const mockups = concept.mockups || {};
            const mockupKeys = Object.keys(mockups);
            
            return (
                <div className="w-full h-full overflow-y-auto custom-scrollbar pb-10">
                     <div className="text-center mb-10">
                        <h2 className="text-4xl font-serif font-bold text-white mb-4">Brand Applications</h2>
                        <p className="text-white/60">Seeing the identity come to life in the real world.</p>
                    </div>
                    
                    {mockupKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-white/30 animate-spin mx-auto mb-3"/>
                                <p className="text-white/50">Generating context images...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {/* Website Item with Launch capability - Moved to first position */}
                            <MockupItem 
                                label="Website" 
                                url={mockups.website} 
                                aspect="video" 
                                onLaunch={onLaunchWebsite} // Pass the handler
                            />
                            
                            <MockupItem label="Signage" url={mockups.signage} aspect="video" />
                            <MockupItem label="Merchandise" url={mockups.merchandise} aspect="square" />
                            <MockupItem label="Stationery" url={mockups.stationery} aspect="video" />
                            <MockupItem label="Menu" url={mockups.menu} aspect="portrait" />
                            <MockupItem label="Packaging" url={mockups.packaging} aspect="square" />
                            <MockupItem label="Social Story" url={mockups.social} aspect="portrait" />
                            
                            <MockupItem label="Apparel" url={mockups.uniform} aspect="portrait" />
                            <MockupItem label="Interior" url={mockups.interior} aspect="video" />
                        </div>
                    )}
                </div>
            );

        case 'social':
            const campaigns = concept.campaigns || [];
            const assets = concept.campaignAssets || {};
            return (
                <div className="h-full flex flex-col">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-serif font-bold text-white mb-4">Social Launch</h2>
                        <p className="text-white/60">{concept.socialStrategy}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {campaigns.map((post, idx) => (
                            <div key={idx} className="bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-xl">
                                <div className="aspect-square bg-black/20 relative">
                                    <GeneratedImageDisplay url={assets[idx]} label={`Post ${idx+1}`} altText="Social Post" aspect="square" />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                        {post.platform}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <p className="text-white/90 text-sm leading-relaxed mb-4 italic">
                                        "{post.caption}"
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-white/5">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Image Prompt</p>
                                        <p className="text-[10px] text-white/40 line-clamp-2 mt-1">{post.imagePrompt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {campaigns.length === 0 && (
                            <div className="col-span-3 flex items-center justify-center h-64 border border-dashed border-white/10 rounded-3xl bg-white/5">
                                <p className="text-white/50">Generating campaign strategy...</p>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'strategy':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto h-full items-center">
                    <div className="space-y-8">
                         <div className="p-8 bg-neutral-900/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400"><Flag className="w-5 h-5"/></div>
                                <h3 className="text-xl font-serif font-bold text-white">Mission & Vision</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Mission</h4>
                                    <p className="text-white text-lg font-serif italic leading-relaxed">"{concept.missionVision?.mission}"</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Vision</h4>
                                    <p className="text-white text-lg font-serif italic leading-relaxed">"{concept.missionVision?.vision}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-neutral-900/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400"><MessageSquare className="w-5 h-5"/></div>
                                <h3 className="text-xl font-serif font-bold text-white">Taglines</h3>
                            </div>
                            <ul className="space-y-3">
                                {(concept.taglines || []).map((tag, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                        "{tag}"
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="p-8 bg-neutral-900/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-xl h-full">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Mic2 className="w-5 h-5"/></div>
                            <h3 className="text-xl font-serif font-bold text-white">Brand Voice: {concept.brandVoice?.tone}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Do This
                                </h4>
                                <ul className="space-y-3">
                                    {(concept.brandVoice?.dos || []).map((item, i) => (
                                        <li key={i} className="text-sm text-white/70 leading-relaxed border-l-2 border-emerald-500/20 pl-3">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                                    <X className="w-4 h-4" /> Avoid This
                                </h4>
                                <ul className="space-y-3">
                                    {(concept.brandVoice?.donts || []).map((item, i) => (
                                        <li key={i} className="text-sm text-white/70 leading-relaxed border-l-2 border-red-500/20 pl-3">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        
        default:
            return null;
    }
};


// --- Reusable Components (Keep existing Image Display Logic) ---

const MockupItem: React.FC<{ label: string; url?: string; aspect?: 'square' | 'video' | 'portrait'; onLaunch?: () => void }> = ({ label, url, aspect = 'square', onLaunch }) => {
  let aspectClass = 'aspect-square';
  if (aspect === 'video') aspectClass = 'aspect-video';
  if (aspect === 'portrait') aspectClass = 'aspect-[9/16]';

  return (
    <div className="break-inside-avoid mb-6">
      <div className={`w-full rounded-[2rem] overflow-hidden ${aspectClass} bg-black/20 border border-white/5 relative shadow-lg group`}>
        <GeneratedImageDisplay url={url} label={label} altText={label} aspect={aspect} />
        
        {/* LAUNCH WEBSITE BUTTON (Only visible if onLaunch is provided and image exists) */}
        {onLaunch && url && !url.startsWith('error') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onLaunch(); }}
                    className="pointer-events-auto bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
                 >
                    <span>Launch Website</span>
                    <ExternalLink className="w-4 h-4" />
                 </button>
            </div>
        )}
      </div>
      <p className="text-xs font-bold text-white/40 mt-3 ml-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

const GeneratedImageDisplay: React.FC<{ url?: string; label: string; altText: string; aspect?: 'square' | 'video' | 'portrait' }> = ({ url, label, altText, aspect = 'square' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let aspectClass = 'aspect-square';
  if (aspect === 'video') aspectClass = 'aspect-video';
  if (aspect === 'portrait') aspectClass = 'aspect-[9/16]';

  if (url === 'error_failed') {
    return (
        <div className={`w-full h-full bg-red-500/5 flex flex-col items-center justify-center ${aspectClass}`}>
          <AlertCircle className="w-8 h-8 text-red-400 mb-2 opacity-50" />
          <span className="text-[10px] text-red-300 font-bold uppercase tracking-widest">Generation Failed</span>
        </div>
    );
  }

  // Handle Loading State (empty string or explicitly null)
  if (url === '' || !url) {
    return (
      <div className={`w-full h-full bg-neutral-900/50 flex flex-col items-center justify-center ${aspectClass}`}>
        <Loader2 className="w-6 h-6 text-white/20 animate-spin mb-3" />
        <span className="text-[10px] text-white/20 animate-pulse font-bold uppercase tracking-widest">Generating...</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group w-full h-full overflow-hidden">
        <img 
          src={url} 
          alt={altText} 
          className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105`} 
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <a 
              href={url} 
              download={`${label.toLowerCase().replace(/\s/g, '-')}.png`}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
              title="Download"
          >
              <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 animate-in fade-in duration-300" onClick={() => setIsExpanded(false)}>
           <button 
             className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
             onClick={() => setIsExpanded(false)}
           >
             <X className="w-6 h-6" />
           </button>
           <img 
             src={url} 
             alt={altText} 
             className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10" 
             onClick={(e) => e.stopPropagation()}
           />
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-neutral-900/80 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-sm font-medium">
                {label}
           </div>
        </div>
      )}
    </>
  );
};

export default BrandStrategyView;
