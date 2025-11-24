
import React from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  onSelectKey: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurry Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>
      
      {/* Glass Card */}
      <div className="relative bg-neutral-900/60 border border-white/10 rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
        <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20">
          <Key className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-white mb-3">Authentication</h2>
        <p className="text-neutral-300 mb-8 leading-relaxed">
          To generate high-quality brand assets with Gemini 3 Pro, please connect your Google Cloud API key.
        </p>
        
        <button
          onClick={onSelectKey}
          className="w-full bg-white text-black font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl mb-6"
        >
          Select API Key
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-center text-white/50 text-sm hover:text-white transition-colors"
        >
          <span>Learn about billing</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default ApiKeyModal;
