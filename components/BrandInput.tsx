
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Beaker, Check, Filter, Info } from 'lucide-react';

interface BrandInputProps {
  onSubmit: (name: string, desc: string, type: string, style: string, website: string) => void;
  isLoading: boolean;
}

const BUSINESS_TYPES = [
  {
    group: "Technology & Digital",
    options: ["SaaS / Software", "AI & Machine Learning", "Fintech", "Cybersecurity", "Mobile App", "Web3 / Crypto", "IT Services", "Telecommunications"]
  },
  {
    group: "Retail & Commerce",
    options: ["E-commerce Store", "Fashion & Apparel", "Beauty & Cosmetics", "Home & Decor", "Jewelry & Accessories", "Electronics", "Kids & Baby", "Luxury Goods", "Pet Products"]
  },
  {
    group: "Food, Beverage & Hospitality",
    options: ["Restaurant / Cafe", "Coffee Shop", "Bar / Nightclub", "Hotel / Resort", "CPG (Packaged Food)", "Alcohol / Spirits", "Health Food / Supplements", "Catering", "Bakery"]
  },
  {
    group: "Professional Services",
    options: ["Legal Firm", "Medical / Dental", "Consulting", "Real Estate Agency", "Financial Services", "Insurance", "Accounting", "Recruiting"]
  },
  {
    group: "Creative & Media",
    options: ["Design Agency", "Photography", "Film / Production", "Marketing / PR", "Influencer / Personal Brand", "Music / Audio", "Publishing"]
  },
  {
    group: "Lifestyle & Wellness",
    options: ["Gym / Fitness", "Spa / Wellness", "Mental Health", "Travel Agency", "Lifestyle Blog", "Coaching"]
  },
  {
    group: "Industrial & Trades",
    options: ["Construction", "Manufacturing", "Automotive", "Logistics / Transport", "Energy / Solar", "Agriculture", "Plumbing / HVAC"]
  },
  {
    group: "Education & Non-Profit",
    options: ["EdTech", "School / University", "Online Course", "Non-Profit / Charity", "Community Organization", "Religious Organization"]
  }
];

// Expanded Style Categories
const STYLE_CATEGORIES: Record<string, string[]> = {
  "Modern": ["Minimalist", "Modern", "Ultra-Modern", "Scandinavian", "Clean", "Flat", "Geometric", "Airy"],
  "Luxury": ["Luxury", "Elegant", "Sophisticated", "High-End", "Glamorous", "Opulent", "Regal", "Chic"],
  "Bold": ["Playful", "Vibrant", "Bold", "Aggressive", "Psychedelic", "Pop-Art", "Neon", "Electric"],
  "Vintage": ["Retro", "Vintage", "Nostalgic", "Art Deco", "Mid-Century", "Grunge", "Rustic", "Weathered", "Classic"],
  "Tech": ["Futuristic", "Tech", "Cyberpunk", "Sci-Fi", "Glitch", "Digital", "Holographic", "Tech-Noir"],
  "Natural": ["Organic", "Natural", "Earthy", "Botanical", "Eco-Friendly", "Raw", "Bohemian", "Handcrafted"],
  "Professional": ["Corporate", "Professional", "Trustworthy", "Traditional", "Conservative", "Institutional"],
  "Dark": ["Dark", "Mysterious", "Gothic", "Noir", "Industrial", "Brutalist", "Edgy", "Urban"],
  "Soft": ["Soft", "Feminine", "Pastel", "Romantic", "Whimsical", "Delicate"]
};

// Flattened list for "All" view, deduped
const ALL_STYLES = Array.from(new Set(Object.values(STYLE_CATEGORIES).flat()));

const BrandInput: React.FC<BrandInputProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(BUSINESS_TYPES[0].options[0]);
  const [styles, setStyles] = useState<string[]>(["Minimalist", "Modern"]);
  const [desc, setDesc] = useState('');
  const [website, setWebsite] = useState('');
  
  // Category Filtering State
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && desc && styles.length > 0) {
      onSubmit(name, desc, type, styles.join(", "), website);
    }
  };

  const toggleStyle = (style: string) => {
    if (styles.includes(style)) {
      setStyles(styles.filter(s => s !== style));
    } else {
      if (styles.length < 3) {
        setStyles([...styles, style]);
      }
    }
  };

  const fillTemplate = () => {
    setName("Tite Knot Craft Coffee");
    setType("Coffee Shop");
    setStyles(["Organic", "Industrial", "Handcrafted"]);
    setDesc("specialty coffee, fresh baked goods, and great company");
    setWebsite("https://titeknot.com");
  };

  // Determine which styles to display based on active category
  const displayedStyles = activeCategory === "All" 
    ? ALL_STYLES 
    : STYLE_CATEGORIES[activeCategory] || [];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 relative z-10">
      
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-500/20 backdrop-blur-md border border-white/10 mb-6 shadow-xl shadow-pink-500/10">
          <Sparkles className="w-8 h-8 text-pink-300" />
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 serif mb-4 tracking-tight">
          Lumina AI Agency
        </h1>
        <p className="text-neutral-300/80 text-xl font-light">
          Crafting visual identities from the ether.
        </p>
      </div>

      {/* Main Glass Card Form */}
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-neutral-900/40 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
      >
        
        {/* Template Button */}
        <button 
          type="button"
          onClick={fillTemplate}
          className="absolute top-6 right-8 flex items-center space-x-2 text-xs font-medium text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
        >
          <Beaker className="w-3 h-3" />
          <span>Auto-Fill Template</span>
        </button>

        <div className="space-y-8">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70 ml-2">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none transition-all hover:bg-black/30"
                placeholder="e.g., Nebula Dynamics"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70 ml-2">Business Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none transition-all hover:bg-black/30 cursor-pointer"
                  disabled={isLoading}
                >
                  {BUSINESS_TYPES.map((group) => (
                    <optgroup key={group.group} label={group.group} className="bg-neutral-900 text-neutral-400">
                      {group.options.map((opt) => (
                        <option key={opt} value={opt} className="text-white">{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-white/40">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Website URL */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/70 ml-2 flex items-center">
              Website URL <span className="text-white/30 font-normal ml-1 mr-2">(Optional)</span>
              {/* Info Tooltip */}
              <div className="relative group">
                <Info className="w-3.5 h-3.5 text-white/30 cursor-help hover:text-white/60 transition-colors" />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 p-4 bg-neutral-900/95 border border-white/10 rounded-xl text-xs text-neutral-300 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 backdrop-blur-md translate-x-2 group-hover:translate-x-0">
                  <p className="leading-relaxed">
                    Lumina analyzes your landing page to extract core value propositions, copy tone, and brand context to ensure the identity aligns with your mission.
                  </p>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-neutral-900/95 border-l border-b border-white/10 rotate-45"></div>
                </div>
              </div>
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none transition-all hover:bg-black/30"
              placeholder="https://yourcompany.com"
              disabled={isLoading}
            />
          </div>

          {/* Styles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-2">
              <label className="text-sm font-medium text-white/70">
                Aesthetic <span className="text-white/30 font-normal ml-1">(Select up to 3)</span>
              </label>
              {/* Filter Tabs */}
              <div className="flex space-x-2 overflow-x-auto pb-1 max-w-[60%] no-scrollbar mask-gradient-right">
                <button
                   type="button"
                   onClick={() => setActiveCategory("All")}
                   className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full transition-colors whitespace-nowrap ${activeCategory === "All" ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"}`}
                >
                  All
                </button>
                {Object.keys(STYLE_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full transition-colors whitespace-nowrap ${activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-white/40 hover:text-white"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/10 p-4 rounded-[1.5rem] border border-white/5 min-h-[160px]">
               <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {displayedStyles.map((s) => {
                  const isSelected = styles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      disabled={isLoading || (!isSelected && styles.length >= 3)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 scale-105 border-transparent z-10'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                      } ${!isSelected && styles.length >= 3 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <span>{s}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              
              {/* Helper text if list is filtered */}
              {activeCategory !== "All" && (
                <div className="mt-3 text-center">
                    <button 
                        type="button"
                        onClick={() => setActiveCategory("All")}
                        className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest flex items-center justify-center mx-auto"
                    >
                        <Filter className="w-3 h-3 mr-1" />
                        Show All Styles
                    </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/70 ml-2">Brand Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none transition-all resize-none hover:bg-black/30"
              placeholder="What makes your brand unique?"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !name || !desc || styles.length === 0}
            className={`w-full group relative flex items-center justify-center space-x-2 py-5 rounded-full font-bold text-lg transition-all duration-300 overflow-hidden ${
              isLoading || !name || !desc || styles.length === 0
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : 'bg-white text-black hover:scale-[1.01] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
            }`}
          >
            {isLoading && (
               <div className="absolute inset-0 bg-neutral-200">
                  <div className="h-full bg-gradient-to-r from-pink-300 to-pink-200 animate-expand"></div>
               </div>
            )}
            <span className="relative z-10">{isLoading ? 'Analyze & Generate...' : 'Generate Brand Identity'}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandInput;
