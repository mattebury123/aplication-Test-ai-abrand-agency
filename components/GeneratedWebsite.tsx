
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Menu, ShoppingBag, Star, CheckCircle, Instagram, Twitter, Facebook, Loader2, Code, Layout, PaintBucket, Sparkles } from 'lucide-react';
import { BrandConcept } from '../types';

interface GeneratedWebsiteProps {
  concept: BrandConcept;
  onClose: () => void;
}

const GeneratedWebsite: React.FC<GeneratedWebsiteProps> = ({ concept, onClose }) => {
  const [isBuilding, setIsBuilding] = useState(true);
  const [buildStep, setBuildStep] = useState(0);

  const primaryColor = concept.colorPalette?.[0]?.hex || '#000000';
  const secondaryColor = concept.colorPalette?.[1]?.hex || '#ffffff';
  const accentColor = concept.colorPalette?.[2]?.hex || primaryColor;
  
  const fontHead = (concept.typography || '').toLowerCase().includes('serif') ? 'font-serif' : 'font-sans';
  const fontBody = 'font-sans';

  // Use the website mockup as the primary hero if available, otherwise fallback to moodboard
  const heroImage = concept.mockups?.website || concept.moodBoardUrl;

  useEffect(() => {
    // Simulate build process
    const steps = [
        { time: 0, fn: () => setBuildStep(1) }, // Analyzing
        { time: 800, fn: () => setBuildStep(2) }, // Structuring
        { time: 1800, fn: () => setBuildStep(3) }, // Styling
        { time: 2800, fn: () => setIsBuilding(false) } // Done
    ];

    const timeouts = steps.map(s => setTimeout(s.fn, s.time));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const renderBuildScreen = () => (
    <div className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col items-center justify-center text-white">
        <div className="w-full max-w-md px-6 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-rose-500/20 animate-pulse"></div>
                {buildStep === 1 && <Code className="w-8 h-8 text-pink-400 animate-bounce" />}
                {buildStep === 2 && <Layout className="w-8 h-8 text-blue-400 animate-pulse" />}
                {buildStep === 3 && <PaintBucket className="w-8 h-8 text-emerald-400 animate-pulse" />}
            </div>
            
            <h2 className="text-2xl font-bold font-serif mb-2">
                {buildStep === 1 && "Analyzing Design Assets..."}
                {buildStep === 2 && "Constructing DOM Structure..."}
                {buildStep === 3 && "Applying Brand Styles..."}
            </h2>
            
            <div className="w-full h-1 bg-neutral-800 rounded-full mt-8 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000 ease-linear"
                    style={{ width: buildStep === 1 ? '30%' : buildStep === 2 ? '60%' : '95%' }}
                ></div>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-neutral-500 font-mono">
                <span className={buildStep >= 1 ? "text-pink-400" : ""}>Parse</span>
                <span className={buildStep >= 2 ? "text-blue-400" : ""}>Layout</span>
                <span className={buildStep >= 3 ? "text-emerald-400" : ""}>Style</span>
                <span>Launch</span>
            </div>
        </div>
    </div>
  );

  if (isBuilding) {
      return renderBuildScreen();
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white text-black overflow-y-auto animate-in fade-in zoom-in-95 duration-700">
      
      {/* Top Navigation Bar (Simulated) */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between transition-all duration-500 animate-in slide-in-from-top-4">
        <div className="flex items-center gap-2">
            {concept.logoUrl && !concept.logoUrl.startsWith('error') ? (
                <img src={concept.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
                <span className={`text-xl font-bold ${fontHead}`} style={{ color: primaryColor }}>{concept.name}</span>
            )}
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#" className="hover:text-black transition-colors">Shop</a>
            <a href="#" className="hover:text-black transition-colors">About</a>
            <a href="#" className="hover:text-black transition-colors">Stories</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><ShoppingBag className="w-5 h-5" /></button>
            <button 
                onClick={onClose}
                className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
                <span>Close Demo</span>
                <X className="w-4 h-4" />
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-100">
        {heroImage && (
            <div className="absolute inset-0">
                <img src={heroImage} className="w-full h-full object-cover opacity-100 scale-105 animate-in fade-in duration-1000" alt="Hero Background" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
        )}
        
        <div className="relative z-10 text-center max-w-5xl px-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
            <h1 
                className={`text-5xl md:text-8xl font-bold text-white mb-8 leading-[1.1] drop-shadow-2xl ${fontHead}`}
            >
                {concept.taglines?.[0] || "Experience the difference."}
            </h1>
            <p className={`text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg leading-relaxed ${fontBody}`}>
                {concept.summary}
            </p>
            <button 
                className="px-10 py-5 rounded-full text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto border border-white/20 backdrop-blur-sm"
                style={{ backgroundColor: accentColor, color: '#fff' }} 
            >
                <span>Explore Collection</span>
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Intro / Mission Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">
                <Sparkles className="w-3 h-3" /> Our Philosophy
            </span>
            <h2 className={`text-3xl md:text-5xl font-bold mb-8 leading-tight ${fontHead}`} style={{ color: primaryColor }}>
                {concept.missionVision?.mission}
            </h2>
            <div className="w-24 h-1 bg-neutral-200 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Mockup Showcase (Products) */}
      <section className="py-24 px-6 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12 border-b border-neutral-200 pb-6">
                  <h2 className={`text-4xl font-bold ${fontHead}`}>Curated for You</h2>
                  <a href="#" className="text-sm font-bold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity" style={{ color: primaryColor }}>View All Products</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { img: concept.mockups?.packaging, title: "Signature Package", price: "$49.00" },
                      { img: concept.mockups?.merchandise, title: "Essential Merch", price: "$35.00" },
                      { img: concept.mockups?.menu, title: "The Experience", price: "Book Now" }
                  ].map((item, i) => (
                      <div key={i} className="group cursor-pointer">
                          <div className="aspect-[4/5] bg-neutral-200 rounded-2xl overflow-hidden mb-5 relative shadow-sm group-hover:shadow-xl transition-all duration-300">
                              {item.img && !item.img.startsWith('error') ? (
                                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-100">
                                    <Layout className="w-10 h-10 opacity-20" />
                                  </div>
                              )}
                              <div className="absolute bottom-4 right-4 bg-white rounded-full p-4 shadow-lg translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                                  <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
                              </div>
                          </div>
                          <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                          <p className="text-neutral-500 font-medium">{item.price}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Brand Voice / Features */}
      <section className="py-32 px-6 text-white relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
          {/* Abstract pattern background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 right-0 w-64 h-64 bg-black rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div className="order-2 lg:order-1">
                  <h2 className={`text-5xl font-bold mb-8 leading-tight ${fontHead}`}>Why Choose Us?</h2>
                  <p className="text-white/80 text-xl mb-10 leading-relaxed font-light">
                      {concept.missionVision?.vision}
                  </p>
                  <ul className="space-y-6">
                      {(concept.brandVoice?.dos || []).slice(0, 4).map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                              <div className="p-1 bg-white/20 rounded-full mt-1">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-white/90 text-lg">{item}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              <div className="relative order-1 lg:order-2">
                   <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-700">
                       {concept.mockups?.social ? (
                           <img src={concept.mockups.social} className="w-full h-full object-cover" alt="Lifestyle" />
                       ) : (
                           <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                <Instagram className="w-16 h-16 opacity-30" />
                           </div>
                       )}
                   </div>
                   {/* Floating Badge */}
                   <div className="absolute -bottom-10 -left-10 bg-white text-black p-8 rounded-3xl shadow-2xl max-w-xs -rotate-3 hover:rotate-0 transition-transform duration-500">
                       <div className="flex gap-1 text-yellow-400 mb-3">
                           <Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/><Star className="w-5 h-5 fill-current"/>
                       </div>
                       <p className={`font-bold italic text-lg leading-snug ${fontHead}`}>
                           "{concept.taglines?.[1] || 'Simply the best.'}"
                       </p>
                   </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
              <div className="col-span-1 md:col-span-2">
                  <h2 className={`text-3xl font-bold mb-6 ${fontHead}`}>{concept.name}</h2>
                  <p className="text-neutral-400 max-w-sm mb-8 leading-relaxed">
                      {concept.summary}
                  </p>
                  <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"><Instagram className="w-5 h-5"/></div>
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"><Twitter className="w-5 h-5"/></div>
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer"><Facebook className="w-5 h-5"/></div>
                  </div>
              </div>
              
              <div>
                  <h3 className="font-bold mb-6 text-white text-lg">Shop</h3>
                  <ul className="space-y-4 text-neutral-400">
                      <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
                  </ul>
              </div>
              
              <div>
                  <h3 className="font-bold mb-6 text-white text-lg">Company</h3>
                  <ul className="space-y-4 text-neutral-400">
                      <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
              </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center text-neutral-500 text-xs">
              <p>© {new Date().getFullYear()} {concept.name}. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default GeneratedWebsite;
