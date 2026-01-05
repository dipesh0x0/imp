
export enum Platform {
  LinkedIn = 'LinkedIn',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Twitter = 'X (Twitter)',
  YoutubeShorts = 'YouTube Shorts',
  TikTok = 'TikTok',
  Reels = 'Instagram Reels',
  GoogleBusiness = 'Google Business Profile'
}

export enum ContentType {
  Image = 'Image',
  Video = 'Video'
}

export type ContentPillar = 'Education' | 'Entertainment' | 'Inspiration' | 'Promotion' | 'Behind the Scenes';

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface BrandPersona {
  name: string;
  ageRange: string;
  ethnicity: string;
  style: string;
  backstory: string;
  avatarUrl?: string;
  visualDescription: string;
}

export interface BrandGuardrails {
  negativeKeywords: string[];
  toneConstraints: string[];
  legalDisclaimers: string[];
}

export interface BrandMemory {
  winningPromptDNA: string[];
  flopConstraints: string[];
  industryInsights: string[];
}

export interface BrandInfo {
  name: string;
  description: string;
  industry: string;
  tone: string;
  targetAudience: string;
  platforms: Platform[];
  persona?: BrandPersona;
  guardrails?: BrandGuardrails;
  memory?: BrandMemory;
  riskLevel?: 'Low' | 'Medium' | 'High';
  brandColors?: string[];
  logoUrl?: string;
  watermarkUrl?: string;
}

export interface Competitor {
  name: string;
  strategy: string;
  visualHook: string;
  marketGap: string;
  url: string;
}

export interface BrandStrategy {
  competitors: Competitor[];
  suggestedThemes: string[];
  visualDirection: string;
  groundingSources?: GroundingSource[];
}

export interface ContentPlanItem {
  day: number;
  title: string;
  description: string; 
  contentType: ContentType;
  contentPillar: ContentPillar;
  visualHook: string;
  script?: string;
  prompt: string;
  caption: string;
  hashtags: string[];
  platform: Platform;
  status: 'pending' | 'generating' | 'completed' | 'error' | 'published' | 'rejected' | 'scheduled' | 'draft';
  assetUrl?: string;
  audioUrl?: string;
  performance?: 'win' | 'flop';
  reasoning?: string;
  clientFeedback?: string;
  geoTarget?: string;
  trendContext?: Trend;
  scheduledAt?: number;
  proxyNode?: string;
  predictionScore?: number;
  altText?: string;
  variants?: {
    platform: Platform;
    caption: string;
    hook: string;
  }[];
  audioLevels?: {
    master: number;
    vox: number;
    bgm: number;
  };
  metrics?: {
    reach: number;
    engagement: number;
    roi: string;
  };
}

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  tags: string[];
  source: 'upload' | 'ai' | 'mobile';
  createdAt: number;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
  sourceUrl: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'General';
  trendingAudio?: string;
  suggestedTemplate?: string;
  groundingSources?: GroundingSource[];
}

export interface GenerationState {
  isAnalyzing: boolean;
  isGeneratingAssets: boolean;
  progress: number;
  plan: ContentPlanItem[];
  assets: Asset[];
  trends: Trend[];
  strategy?: BrandStrategy;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  token?: string;
}
