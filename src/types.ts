export interface RPCharacter {
  id: string;
  name: string;
  avatarUrl: string;
  roleTag: string; // e.g. "Tổng Tài Lạnh Lùng", "Ma Vương Bóng Tối", "Trùm Trường Roblox", "Học Bá Siêu Giàu"
  tags: string[];
  tagline: string;
  robuxDonations: number;
  gender?: string;
  age?: string;
  personality: string;
  plotTitle: string;
  plotSummary: string;
  fullPlot: string;
  sampleDialogue: string[];
  gamePlaceUrl?: string;
  playUrl?: string;
  plotUrl?: string;
  voiceUrl?: string;
  createdAt: number;
  isNew?: boolean;
  cornerTag?: string;
  realAvatarUrl?: string;
  hellAvatarUrl?: string;
  hellPlotSummary?: string;
  hellTags?: string[];
  trollAvatarUrl?: string;
  password?: string;
  hasDynamicPassword?: boolean;
  passwordHint?: string;
  hint1?: string;
  hint1Url?: string;
  hint2?: string;
  hint2Url?: string;
  isLinkLocked?: boolean;
  linkLockReason?: string;
  hasWarningPlayButton?: boolean;
  warningPlayMessage?: string;
}

export interface PlayScenarioModalData {
  character: RPCharacter;
}

export interface Artwork {
  id: string;
  imageUrl: string;
  characterId: string;
  characterName: string;
  characterAvatarUrl?: string;
  authorName: string;
  title?: string;
  message?: string;
  createdAt: number;
  likesCount?: number;
}

export interface RPCommand {
  id: string;
  title: string;
  category: 'html' | 'text' | 'prompt' | 'nsfw';
  commandText: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  authorName?: string;
  isNsfw?: boolean;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type ConfessionCategory = 'feeling' | 'idea' | 'feedback' | 'memory' | 'other';

export interface ConfessionReply {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: number;
  likesCount?: number;
  isAdmin?: boolean;
}

export interface Confession {
  id: string;
  authorName: string;
  authorAvatar?: string;
  characterId?: string; // e.g. "char-21-hayton-donovan" or "all"
  characterName?: string; // e.g. "Hayton Donovan"
  characterAvatar?: string;
  category: ConfessionCategory;
  content: string;
  imageUrl?: string;
  createdAt: number;
  likesCount: number;
  repliesCount: number;
  pinned?: boolean;
  isAdmin?: boolean;
  replies?: ConfessionReply[];
}
