
import React from 'react';
import { X, Server, Database, Cpu, Code, FileJson, ArrowRight, GitBranch, Layers, Image as ImageIcon, Zap, Shield, AlertTriangle } from 'lucide-react';

interface DeveloperTreeProps {
  onClose: () => void;
}

const TechCard: React.FC<{ title: string; icon: React.ElementType; color: string; children: React.ReactNode }> = ({ title, icon: Icon, color, children }) => (
    <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-20 ${color} opacity-[0.03] rounded-bl-full group-hover:opacity-[0.06] transition-opacity`}></div>
        <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            <h4 className="font-bold text-white text-sm">{title}</h4>
        </div>
        <div className="text-xs text-white/60 font-mono leading-relaxed relative z-10">
            {children}
        </div>
    </div>
);

const FlowNode: React.FC<{ label: string; sub?: string; active?: boolean }> = ({ label, sub, active }) => (
    <div className={`border ${active ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-neutral-900'} rounded-lg p-3 text-center min-w-[140px]`}>
        <div className={`text-xs font-bold ${active ? 'text-emerald-300' : 'text-white'}`}>{label}</div>
        {sub && <div className="text-[10px] text-white/40 font-mono mt-1">{sub}</div>}
    </div>
);

const Arrow: React.FC = () => (
    <div className="text-white/20">
        <ArrowRight className="w-4 h-4" />
    </div>
);

const DeveloperTree: React.FC<DeveloperTreeProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto font-mono">
      <div className="min-h-screen p-8 md:p-12">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-12 max-w-7xl mx-auto">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Cpu className="w-3 h-3" /> System Architecture v2.0
                </div>
                <h2 className="text-3xl text-white font-bold font-sans">Technical Deep Dive</h2>
                <p className="text-white/40 mt-2 text-sm">Application Logic, Data Topology, and Generative Pipelines.</p>
            </div>
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition-all"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* 1. THE STACK */}
            <section>
                <h3 className="text-white/80 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4" /> The Stack
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <TechCard title="Client" icon={Code} color="text-blue-400">
                        React 19 (RC)<br/>
                        Tailwind CSS<br/>
                        Lucide React<br/>
                        SPA Architecture
                    </TechCard>
                    <TechCard title="Intelligence" icon={Zap} color="text-yellow-400">
                        Google GenAI SDK<br/>
                        Gemini 2.5 Flash (Text)<br/>
                        Gemini 3 Pro (Vision)<br/>
                        Imagen 3 (Fallback)
                    </TechCard>
                    <TechCard title="Persistence" icon={Database} color="text-emerald-400">
                        IndexedDB (idb-keyval)<br/>
                        Async Storage<br/>
                        Blob/Base64 Caching<br/>
                        NoSQL Document Store
                    </TechCard>
                     <TechCard title="Security" icon={Shield} color="text-red-400">
                        Client-side Keys<br/>
                        Env Variable Injection<br/>
                        Quota Management<br/>
                        Input Sanitization
                    </TechCard>
                </div>
            </section>

            {/* 2. PROMPT ENGINEERING */}
             <section>
                <h3 className="text-white/80 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <FileJson className="w-4 h-4" /> Prompt Engineering & Schemas
                </h3>
                <div className="bg-neutral-900/60 border border-white/10 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/10">
                        <div className="text-xs font-bold text-pink-400 mb-2">Strategy Generation (Text)</div>
                        <div className="bg-black rounded-lg p-4 text-[10px] text-neutral-400 overflow-x-auto whitespace-pre">
{`const prompt = \`
  Act as a world-class AI Brand Agency.
  Develop a comprehensive brand identity package for:
  Company: \${companyName}
  Type: \${businessType}
  Style: \${brandStyle}
  
  Task: Create exactly 1 DISTINCT brand concept.
  Output JSON format matching schema:
  - logoConcept (visual description)
  - colorPalette (hex codes)
  - moodBoard (texture description)
  - campaigns (social strategy)
\`;`}
                        </div>
                        <div className="mt-2 text-[10px] text-white/30">
                            Model: <span className="text-white">gemini-2.5-flash</span> • Temp: <span className="text-white">0.7</span>
                        </div>
                    </div>

                     <div className="p-6">
                        <div className="text-xs font-bold text-purple-400 mb-2">Visual Synthesis (Image)</div>
                        <div className="bg-black rounded-lg p-4 text-[10px] text-neutral-400 overflow-x-auto whitespace-pre">
{`// 1. Logo Generation
const prompt = \`Minimalist vector logo for \${name}. 
Concept: \${logoDesc}. Style: \${style}. 
Solid background, high quality.\`;

// 2. Reference Injection
const referenceImage = logoBase64; // Injected into context

// 3. Moodboard / Mockups
const contextPrompt = \`Professional photography... 
Theme: \${theme}. Style: \${style}.\`;
// Logo is passed as visual anchor to maintain brand consistency`}
                        </div>
                        <div className="mt-2 text-[10px] text-white/30">
                            Model: <span className="text-white">gemini-3-pro-image-preview</span> • Fallback: <span className="text-white">2.5-flash-image</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. EXECUTION PIPELINE */}
             <section>
                <h3 className="text-white/80 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> Execution Pipeline
                </h3>
                
                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 overflow-x-auto">
                            <FlowNode label="User Input" sub="Form Data" />
                            <Arrow />
                            <FlowNode label="Gemini 2.5 Flash" sub="Text Generation" active />
                            <Arrow />
                            <FlowNode label="JSON Parser" sub="Regex Cleanup" />
                            <Arrow />
                            <FlowNode label="Project Object" sub="IndexedDB Save" />
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 overflow-x-auto">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">The Visual Anchor</span>
                                <div className="flex items-center gap-4">
                                     <FlowNode label="Logo Description" sub="From Step 1" />
                                     <Arrow />
                                     <FlowNode label="Gemini 3 Pro" sub="Image Generation" active />
                                     <Arrow />
                                     <FlowNode label="Base64 Blob" sub="Memory Store" />
                                </div>
                            </div>
                        </div>
                    </div>

                     {/* Step 3 */}
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4 overflow-x-auto">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Contextual Expansion (Waterfall)</span>
                                <div className="flex items-center gap-4">
                                     <FlowNode label="Logo Reference" sub="Base64 Input" active />
                                     <Arrow />
                                     <div className="flex flex-col gap-2">
                                         <div className="border border-white/10 bg-neutral-900 rounded px-3 py-1 text-[10px] text-white">Moodboard (16:9)</div>
                                         <div className="border border-white/10 bg-neutral-900 rounded px-3 py-1 text-[10px] text-white">Mockups (x9)</div>
                                         <div className="border border-white/10 bg-neutral-900 rounded px-3 py-1 text-[10px] text-white">Social (1:1)</div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* 4. ERROR HANDLING */}
            <section>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-sm font-bold text-red-300 mb-1">Resiliency Layers</h4>
                        <ul className="text-xs text-red-200/60 space-y-1 list-disc pl-4 font-sans">
                            <li><strong>JSON Repair:</strong> Custom Regex strips markdown, comments, and trailing commas from AI responses.</li>
                            <li><strong>Model Fallback:</strong> If Gemini 3 Pro hits rate limit (429), system automatically retries with Gemini 2.5 Flash Image.</li>
                            <li><strong>Storage Protection:</strong> idb-keyval prevents LocalStorage 5MB quota crashes.</li>
                            <li><strong>Safe Rendering:</strong> Defensive optional chaining on all nested data properties.</li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
};

export default DeveloperTree;
