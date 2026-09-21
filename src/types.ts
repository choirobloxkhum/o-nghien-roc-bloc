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
  trollAvatarUrl?: string;
  password?: string;
  hasDynamicPassword?: boolean;
  passwordHint?: string;
  hint1?: string;
  hint1Url?: string;
  hint2?: string;
  hint2Url?: string;
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
