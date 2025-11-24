
export interface Color {
  name: string;
  hex: string;
  usage: string;
}

export interface BrandVoice {
  tone: string;
  dos: string[];
  donts: string[];
}

export interface MissionVision {
  mission: string;
  vision: string;
}

export interface MockupAssets {
  signage?: string;
  merchandise?: string;
  stationery?: string;
  menu?: string;
  social?: string;
  website?: string;
  packaging?: string;
  uniform?: string;
  interior?: string;
}

export interface SocialPost {
  platform: string; // e.g. "Instagram", "LinkedIn"
  caption: string;
  imagePrompt: string; // The prompt used to generate the image
}

export interface AssetVersion {
  id: string;
  url: string;
  timestamp: number;
}

export interface BrandConcept {
  id: string; // 'concept-1', 'concept-2', etc.
  name: string; // e.g., "The Minimalist", "The Bold"
  summary: string; // Short description of this direction
  logoConcept: string;
  typography: string;
  colorPalette: Color[];
  moodBoard: string;
  brandVoice: BrandVoice;
  missionVision: MissionVision;
  taglines: string[];
  socialStrategy: string; // Brief social strategy specific to this concept
  
  // New: Specific Social Campaign Posts
  campaigns?: SocialPost[]; 

  // Assets (populated asynchronously)
  logoUrl?: string;
  logoHistory?: AssetVersion[]; // HISTORY
  
  moodBoardUrl?: string;
  moodBoardHistory?: AssetVersion[]; // HISTORY

  mockups?: MockupAssets;
  // Note: For simplicity in this complex update, mockups/campaigns use simpler history or just regenerate in place, 
  // but we will apply history primarily to the main hero assets (Logo/Moodboard) first.
  
  campaignAssets?: Record<number, string>; // Index based mapping for campaign images
}

export interface Project {
  id: string;
  companyName: string;
  websiteUrl?: string;
  description: string;
  businessType: string;
  brandStyle: string;
  createdAt: number;
  status: 'generating_text' | 'generating_images' | 'complete' | 'error';
  progress?: number; // 0 to 100 percentage
  concepts: BrandConcept[];
}

export type ImageSize = '1K' | '2K' | '4K';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
