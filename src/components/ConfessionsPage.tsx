import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Send,
  Pin,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  AtSign,
  Crown,
  X,
  Upload,
  Link as LinkIcon,
  Search,
  Filter,
} from 'lucide-react';
import { Confession, ConfessionCategory, ConfessionReply, RPCharacter } from '../types';
import {
  subscribeConfessions,
  createConfession,
  toggleLikeConfession,
  hasUserLikedConfession,
  subscribeConfessionReplies,
  addReplyToConfession,
  togglePinConfession,
  deleteConfession,
} from '../services/confessionsService';
import { INITIAL_RP_CHARACTERS } from '../data/rpCharacters';
import { useAuth } from '../context/AuthContext';
import { playUiClick } from '../utils/audio';

interface ConfessionsPageProps {
  soundEnabled?: boolean;
  reducedMotion?: boolean;
}

const CATEGORY_MAP: Record<ConfessionCategory, { label: string; icon: string; badgeClass: string }> = {
  feeling: {
    label: 'Cảm nhận',
    icon: '💬',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs',
  },
  idea: {
    label: 'Ý tưởng',
    icon: '💡',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs',
  },
  feedback: {
    label: 'Góp ý',
    icon: '💌',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs',
  },
  memory: {
    label: 'Kỷ niệm RP',
    icon: '✨',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 shadow-xs',
  },
  other: {
    label: 'Khác',
    icon: '💭',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200 shadow-xs',
  },
};

export const DEFAULT_CONFESSION_AVATAR = 'https://i.ibb.co/Lhc71KhN/fe6bf5c25ddfd8b7c6b71ef56653a338.jpg';

export const USER_SELECTABLE_AVATARS = [
  {
    id: 'default',
    url: 'https://i.ibb.co/Lhc71KhN/fe6bf5c25ddfd8b7c6b71ef56653a338.jpg',
    label: 'Mặc định',
  },
  {
    id: 'av-1',
    url: 'https://i.ibb.co/hFRJX93N/eb0e3889dff4bcc6b31e15ae1ba5e660.jpg',
    label: 'Avatar 1',
  },
  {
    id: 'av-2',
    url: 'https://i.ibb.co/M5xtfsmv/b4eea77d4aa7c3a891d2f8de0abd67b4.jpg',
    label: 'Avatar 2',
  },
  {
    id: 'av-3',
    url: 'https://i.ibb.co/jZ455sH3/33e94da33b07daf7e43cd1148bf5cbba.jpg',
    label: 'Avatar 3',
  },
  {
    id: 'av-4',
    url: 'https://i.ibb.co/8D79SfzM/01e7082ab7010561ea83a06b21906c2d.jpg',
    label: 'Avatar 4',
  },
  {
    id: 'av-5',
    url: 'https://i.ibb.co/vnTc9nz/3fdbac9a197dd51ab8c1e5c093f9e852.jpg',
    label: 'Avatar 5',
  },
];

function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin}p trước`;
  if (diffHour < 24) return `${diffHour}h trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/**
 * Compress an uploaded image file via Canvas to keep document size under Firestore limit
 */
function compressImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Không thể tải hình ảnh này'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
    reader.readAsDataURL(file);
  });
}

export const ConfessionsPage: React.FC<ConfessionsPageProps> = ({
  soundEnabled = true,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  
  // Category & Search Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Composer Form States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roblox_rp_confession_user_nickname');
      if (saved) return saved;
    }
    return currentUser?.displayName || 'Ẩn danh si tình';
  });

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('roblox_rp_confession_user_avatar');
      if (saved) return saved;
    }
    return currentUser?.photoURL || DEFAULT_CONFESSION_AVATAR;
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('all');
  const [category, setCategory] = useState<ConfessionCategory>('feeling');
  const [content, setContent] = useState('');

  // Danh sách nhân vật ở chế độ Hạ Giới - Luôn lấy avatarUrl gốc của Hạ Giới (tuyệt đối không dùng hellAvatarUrl)
  const earthCharacters = useMemo(() => {
    return INITIAL_RP_CHARACTERS;
  }, []);
  
  // Image Upload Mode: 'upload' (from device) vs 'link' (URL)
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'link'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showImageSection, setShowImageSection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded replies mapping: confessionId -> boolean
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Real-time listener for confessions
  useEffect(() => {
    const unsubscribe = subscribeConfessions((list) => {
      setConfessions(list);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenComposer = () => {
    playUiClick(soundEnabled);
    setIsComposerOpen(true);
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Handle direct file upload from device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Vui lòng chọn đúng tệp hình ảnh!');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('⚠️ File ảnh quá lớn (tối đa 15MB)!');
      return;
    }

    setIsProcessingImage(true);
    try {
      const compressedBase64 = await compressImageFile(file);
      setImageUrl(compressedBase64);
      setImagePreview(compressedBase64);
      showToast('📸 Đã tải ảnh lên thành công!');
    } catch {
      showToast('❌ Lỗi khi xử lý ảnh, vui lòng thử lại!');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    playUiClick(soundEnabled);
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = content.trim();
    if (!cleanContent) {
      showToast('⚠️ Vui lòng nhập nội dung tâm thư!');
      return;
    }

    playUiClick(soundEnabled);
    setIsSubmitting(true);

    let charObj: RPCharacter | undefined;
    if (selectedCharacterId !== 'all') {
      charObj = earthCharacters.find((c) => c.id === selectedCharacterId);
    }

    const effectiveAvatar = selectedAvatarUrl || DEFAULT_CONFESSION_AVATAR;

    try {
      await createConfession({
        authorName: authorName.trim() || 'Ẩn danh si tình',
        authorAvatar: effectiveAvatar,
        characterId: selectedCharacterId,
        characterName: charObj ? charObj.name : 'Toàn bộ Hub Chơi Roblox Khum',
        characterAvatar: charObj ? charObj.avatarUrl : 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg',
        category,
        content: cleanContent,
        imageUrl: imageUrl.trim(),
        isAdmin: Boolean(isAdmin),
        pinned: false,
      });

      setContent('');
      setImageUrl('');
      setImagePreview(null);
      setShowImageSection(false);
      setIsComposerOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('🎉 Đã gửi tâm thư thành công!');
    } catch {
      showToast('❌ Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered confessions
  const filteredConfessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return confessions.filter((item) => {
      // Filter by category
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Filter by character
      if (selectedCharacterFilter !== 'all' && item.characterId !== selectedCharacterFilter) {
        return false;
      }
      // Filter by search text
      if (q) {
        const matchContent = item.content.toLowerCase().includes(q);
        const matchAuthor = item.authorName.toLowerCase().includes(q);
        const matchChar = item.characterName?.toLowerCase().includes(q);
        if (!matchContent && !matchAuthor && !matchChar) {
          return false;
        }
      }
      return true;
    });
  }, [confessions, activeCategory, selectedCharacterFilter, searchQuery]);

  return (
    <div
      id="confessions-threads-feed"
      className="relative z-10 w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 font-dessert"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 sm:top-24 inset-x-0 mx-auto z-50 w-auto max-w-md px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-black border text-center bg-slate-900/95 text-white border-sky-400/80 shadow-[0_4px_25px_rgba(2,132,199,0.4)]"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          1. HEADER BANNER TÂM THƯ: CHỮ MÀU TRẮNG, FONT TRANG TRÍ & CHỮ NHỎ IN NGHIÊNG
          ========================================================================= */}
      <div className="relative mb-6 sm:mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-500 via-pink-500 to-amber-500 border-2 border-white shadow-[0_12px_35px_rgba(2,132,199,0.25)] overflow-hidden text-center select-none">
        {/* Floating Paper Airplanes Animation in Background */}
        <div className="absolute top-2 left-3 sm:left-6 opacity-30 animate-pulse pointer-events-none">
          <Send className="w-8 h-8 sm:w-10 sm:h-10 text-white -rotate-12" />
        </div>
        <div className="absolute top-3 right-4 sm:right-8 opacity-25 pointer-events-none animate-bounce [animation-duration:3.5s]">
          <Send className="w-9 h-9 sm:w-12 sm:h-12 text-white rotate-12" />
        </div>
        <div className="absolute -bottom-4 right-1/4 opacity-15 pointer-events-none">
          <Sparkles className="w-16 h-16 text-yellow-200" />
        </div>

        {/* Main Title: Chữ màu trắng, font trang trí (Đã xóa emoji máy bay theo yêu cầu) */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-serif italic tracking-wide leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center">
          <span>Góc Tâm Thư</span>
        </h1>

        {/* Subtitle: In nghiêng chính xác theo yêu cầu người dùng */}
        <p className="mt-2.5 text-xs sm:text-sm md:text-base font-medium italic text-white/95 max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          Góc nhỏ để các iu chia sẻ cảm nhận về các chìu ông hoặc góp ý bất kì ý tưởng nào (lỡ mộng chè thấy hay quá rồi cook thì sao?)
        </p>
      </div>

      {/* =========================================================================
          2. THREADS COMPOSER CARD (Trigger Box & Expanded Form with Dual-Mode Image & Avatar Selection)
          ========================================================================= */}
      <div
        ref={composerRef}
        className="mb-6 rounded-3xl p-4 sm:p-5 border-2 border-white bg-white/95 shadow-[0_4px_25px_rgba(2,132,199,0.12)] transition-all duration-300"
      >
        {!isComposerOpen ? (
          /* Mini Trigger Bar like Threads "Start a thread..." */
          <div
            onClick={handleOpenComposer}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-sky-400 via-rose-300 to-amber-300 p-0.5 shrink-0 shadow-sm">
              <img
                src={selectedAvatarUrl || DEFAULT_CONFESSION_AVATAR}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-100 text-slate-500 text-xs sm:text-sm font-bold border border-transparent group-hover:border-sky-300 transition-all flex items-center justify-between">
              <span>Bạn đang nghĩ gì về các chàng thơ? Chia sẻ cảm nhận, ý tưởng kịch bản RP...</span>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-xl bg-sky-500 text-white text-xs font-black shadow-xs group-hover:bg-sky-600 items-center gap-1">
                <Send className="w-3 h-3" />
                <span>Viết tâm thư</span>
              </span>
            </div>
          </div>
        ) : (
          /* Expanded Composer Form */
          <form onSubmit={handleCreateConfession} className="space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200/80">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* User Avatar Circle with click-to-change button */}
                <div className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setShowAvatarPicker(!showAvatarPicker);
                    }}
                    className="w-11 h-11 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-rose-300 to-amber-300 shadow-sm transition-transform active:scale-95 cursor-pointer hover:ring-2 hover:ring-sky-400"
                    title="Nhấp để chọn avatar đại diện"
                  >
                    <img
                      src={selectedAvatarUrl || DEFAULT_CONFESSION_AVATAR}
                      alt="Avatar của bạn"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      setShowAvatarPicker(!showAvatarPicker);
                    }}
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-sky-500 text-white shadow-xs hover:bg-sky-600 cursor-pointer"
                    title="Đổi avatar"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => {
                        setAuthorName(e.target.value);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('roblox_rp_confession_user_nickname', e.target.value);
                        }
                      }}
                      placeholder="Nhập biệt danh của bạn..."
                      maxLength={40}
                      className="text-xs sm:text-sm font-black text-slate-900 bg-transparent border-b border-slate-200 focus:border-sky-500 outline-none w-44 sm:w-64 pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        playUiClick(soundEnabled);
                        setShowAvatarPicker(!showAvatarPicker);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-black border border-sky-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {showAvatarPicker ? 'Đóng avatar' : 'Chọn avatar 🎨'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>{isAdmin ? '👑 Tác giả / Admin' : 'Không cần đăng nhập • Bạn có thể tự do chọn tên & avatar'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0 ml-2"
                title="Đóng khung soạn thảo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AVATAR PICKER DRAWER */}
            {showAvatarPicker && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-pink-50 to-amber-50 border border-sky-200 shadow-inner space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>🎨 Chọn 1 trong 5 avatar bên dưới (hoặc dùng mặc định):</span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 py-1.5 px-0.5 justify-items-center">
                  {USER_SELECTABLE_AVATARS.map((av) => {
                    const isSelected = selectedAvatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          playUiClick(soundEnabled);
                          setSelectedAvatarUrl(av.url);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('roblox_rp_confession_user_avatar', av.url);
                          }
                        }}
                        className={`group relative flex flex-col items-center gap-1 w-full max-w-[90px] sm:max-w-none p-1.5 rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2.5 ring-sky-500 bg-white shadow-md scale-105'
                            : 'hover:bg-white/70 bg-white/40 opacity-80 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden border-2 border-white shadow-xs bg-slate-100 shrink-0">
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className={`text-[10px] sm:text-[11px] font-black text-center truncate max-w-full ${isSelected ? 'text-sky-700' : 'text-slate-600'}`}>
                          {av.label}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] shadow-xs border border-white font-black">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Target Character & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Nhân vật bạn muốn gửi đến:
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-300 shrink-0 bg-slate-100 shadow-xs" title="Ảnh đại diện chế độ Hạ Giới">
                    <img
                      src={
                        selectedCharacterId !== 'all'
                          ? earthCharacters.find((c) => c.id === selectedCharacterId)?.avatarUrl || 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg'
                          : 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg'
                      }
                      alt="Ảnh nhân vật Hạ Giới"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <select
                    value={selectedCharacterId}
                    onChange={(e) => setSelectedCharacterId(e.target.value)}
                    className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-none focus:border-sky-400 text-xs shadow-xs"
                  >
                    <option value="all">👑 Toàn bộ Hub / Tất cả nhân vật</option>
                    {earthCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.roleTag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                  Danh mục tâm thư:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ConfessionCategory)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold outline-none focus:border-sky-400 text-xs shadow-xs"
                >
                  <option value="feeling">💬 Cảm nhận về nhân vật</option>
                  <option value="idea">💡 Ý tưởng kịch bản mới</option>
                  <option value="feedback">💌 Góp ý cho Hub / Mộng Chè</option>
                  <option value="memory">✨ Kỷ niệm & Trải nghiệm RP</option>
                  <option value="other">💭 Khác</option>
                </select>
              </div>
            </div>

            {/* Main Content Textarea */}
            <div className="relative">
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={3000}
                placeholder="Viết cảm nhận của bạn về chàng thơ, chia sẻ chi tiết cốt truyện bạn thích, hoặc ý tưởng kịch bản bạn mong muốn Mộng Chè viết..."
                className="w-full p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium outline-none focus:border-sky-400 focus:bg-white transition-all resize-none leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-bold">
                {content.length}/3000
              </span>
            </div>

            {/* Image Attachment Box (Dual Mode: Upload File OR Paste Link) */}
            {showImageSection && (
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-sky-900">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>Đính kèm hình ảnh</span>
                  </div>

                  {/* Mode switcher tabs: Tải từ máy vs Dán link */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-sky-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        imageUploadMode === 'upload'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-sky-700'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Tải từ máy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('link')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        imageUploadMode === 'link'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-sky-700'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Dán link ảnh</span>
                    </button>
                  </div>
                </div>

                {/* Option A: Upload Directly from Device */}
                {imageUploadMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="confession-file-upload-input"
                    />
                    <label
                      htmlFor="confession-file-upload-input"
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-xl bg-white cursor-pointer transition-all hover:bg-sky-50/50 group text-center"
                    >
                      <Upload className="w-6 h-6 text-sky-500 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black text-slate-800">
                        {isProcessingImage ? 'Đang nén và tối ưu hóa ảnh...' : 'Nhấp để chọn ảnh từ điện thoại / máy tính'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Hỗ trợ JPG, PNG, WEBP, GIF (Tự động tối ưu dung lượng)
                      </span>
                    </label>
                  </div>
                ) : (
                  /* Option B: Paste Image URL */
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-sky-200">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value.trim() ? e.target.value.trim() : null);
                      }}
                      placeholder="Dán link ảnh trực tiếp (VD: https://i.ibb.co/...)"
                      className="w-full bg-transparent text-xs text-slate-800 outline-none font-bold placeholder-slate-400"
                    />
                  </div>
                )}

                {/* Image Preview Thumbnail */}
                {imagePreview && (
                  <div className="relative inline-block mt-2 rounded-xl overflow-hidden border border-sky-200 shadow-sm max-h-48 bg-slate-100">
                    <img
                      src={imagePreview}
                      alt="Xem trước ảnh"
                      className="max-h-48 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Xóa ảnh này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  playUiClick(soundEnabled);
                  setShowImageSection(!showImageSection);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showImageSection || imageUrl
                    ? 'bg-sky-100 text-sky-700 border border-sky-300'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>{imageUrl ? 'Đã đính kèm ảnh 📸' : 'Đính kèm ảnh (File / Link)'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 border border-sky-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Đang gửi...' : 'Gửi tâm thư'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================================
          3. BỘ LỌC BÀI VIẾT: DANH MỤC (GÓP Ý, CẢM NHẬN, Ý TƯỞNG...) & TÌM KIẾM
          ========================================================================= */}
      <div className="mb-5 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tâm thư theo nội dung, biệt danh, hoặc chàng thơ..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-bold outline-none focus:border-sky-400 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Category Pills: Góp ý, Cảm nhận, Ý tưởng, Kỷ niệm, Khác (Thanh kéo cuộn ngang trên điện thoại) */}
        <div className="flex items-center gap-1.5 sm:gap-2 custom-tag-scrollbar pb-2.5 select-none touch-pan-x">
          <button
            type="button"
            onClick={() => {
              playUiClick(soundEnabled);
              setActiveCategory('all');
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
              activeCategory === 'all'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white/90 text-slate-700 border-slate-200 hover:border-sky-300'
            }`}
          >
            Tất cả ({confessions.length})
          </button>

          {(['feeling', 'idea', 'feedback', 'memory', 'other'] as ConfessionCategory[]).map((cat) => {
            const cfg = CATEGORY_MAP[cat];
            const count = confessions.filter((c) => c.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playUiClick(soundEnabled);
                  setActiveCategory(cat);
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white/90 text-slate-700 border-slate-200 hover:border-sky-300'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. CONFESSIONS FEED LIST (Threads Layout)
          ========================================================================= */}
      <div className="space-y-3.5">
        {filteredConfessions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/80 border-2 border-white shadow-sm">
            <span className="text-4xl sm:text-5xl mb-2 block animate-bounce">💌</span>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {searchQuery || activeCategory !== 'all'
                ? 'Không tìm thấy tâm thư nào phù hợp với bộ lọc!'
                : 'Chưa có bức tâm thư nào được gửi!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
              Hãy là người đầu tiên chia sẻ cảm nhận hoặc góp ý tưởng về các chàng thơ nhé!
            </p>
            <button
              type="button"
              onClick={handleOpenComposer}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-black text-xs shadow-md hover:from-sky-600 hover:to-cyan-700 transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Viết tâm thư ngay</span>
            </button>
          </div>
        ) : (
          filteredConfessions.map((item) => (
            <ThreadItemCard
              key={item.id}
              item={item}
              soundEnabled={soundEnabled}
              isAdmin={Boolean(isAdmin)}
              onShowToast={showToast}
              isExpanded={Boolean(expandedReplies[item.id])}
              onToggleReplies={() => {
                playUiClick(soundEnabled);
                setExpandedReplies((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }));
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   INDIVIDUAL THREAD ITEM CARD (THREADS SIGNATURE VERTICAL THREAD LINE)
   ========================================================================= */

interface ThreadItemCardProps {
  item: Confession;
  soundEnabled: boolean;
  isAdmin: boolean;
  onShowToast: (msg: string) => void;
  isExpanded: boolean;
  onToggleReplies: () => void;
}

const ThreadItemCard: React.FC<ThreadItemCardProps> = ({
  item,
  soundEnabled,
  isAdmin,
  onShowToast,
  isExpanded,
  onToggleReplies,
}) => {
  const [likes, setLikes] = useState(item.likesCount || 0);
  const [isLiked, setIsLiked] = useState(hasUserLikedConfession(item.id));
  const [isLiking, setIsLiking] = useState(false);

  // Replies states
  const [replies, setReplies] = useState<ConfessionReply[]>(item.replies || []);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Sync replies in real-time when expanded
  useEffect(() => {
    if (!isExpanded) return;
    const unsub = subscribeConfessionReplies(item.id, (list) => {
      setReplies(list);
    });
    return () => unsub();
  }, [isExpanded, item.id]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    playUiClick(soundEnabled);
    try {
      const res = await toggleLikeConfession(item.id, likes);
      setIsLiked(res.liked);
      setLikes(res.newCount);
    } catch {
      // ignore
    } finally {
      setIsLiking(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    playUiClick(soundEnabled);
    setIsSendingReply(true);

    const userSavedAvatar = typeof window !== 'undefined'
      ? localStorage.getItem('roblox_rp_confession_user_avatar') || DEFAULT_CONFESSION_AVATAR
      : DEFAULT_CONFESSION_AVATAR;

    try {
      await addReplyToConfession(item.id, {
        authorName: replyAuthor.trim() || 'Người ẩn danh',
        authorAvatar: userSavedAvatar,
        content: replyText.trim(),
        isAdmin,
      });
      setReplyText('');
      onShowToast('💬 Đã gửi câu trả lời!');
    } catch {
      onShowToast('❌ Gửi trả lời thất bại, vui lòng thử lại!');
    } finally {
      setIsSendingReply(false);
    }
  };

  const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.feeling;

  // Luôn đảm bảo lấy ảnh nhân vật trong chế độ Hạ Giới (tuyệt đối không dùng ảnh Địa Ngục)
  const earthChar = useMemo(() => {
    if (!item.characterId || item.characterId === 'all') return null;
    return INITIAL_RP_CHARACTERS.find((c) => c.id === item.characterId);
  }, [item.characterId]);

  const displayCharAvatar = earthChar ? earthChar.avatarUrl : item.characterAvatar;

  return (
    <article
      id={item.id}
      className={`rounded-3xl p-4 sm:p-5.5 transition-all duration-300 shadow-sm ${
        item.pinned
          ? 'bg-gradient-to-b from-amber-50/95 via-yellow-50/90 to-white/95 border-3 border-amber-400 shadow-[0_6px_30px_rgba(245,158,11,0.3)] ring-2 ring-amber-300/50'
          : 'bg-white/95 border-2 border-white hover:border-sky-200'
      }`}
    >
      {/* Pinned Header: Khung vàng nổi bật */}
      {item.pinned && (
        <div className="flex items-center justify-between mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-200/70 via-yellow-200/60 to-amber-200/70 border border-amber-400/90 text-amber-950 text-xs font-black uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
            <Pin className="w-3.5 h-3.5 fill-amber-700 text-amber-700 rotate-45" />
            <span>Thông Báo Từ Mộng Chè • Ghim Ở Đầu Trang</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" />
        </div>
      )}

      {/* THREADS SIGNATURE LAYOUT: AVATAR COLUMN + CONTENT COLUMN */}
      <div className="flex gap-3 sm:gap-3.5 items-start">
        {/* Left Column: Author Avatar + Vertical Thread Line */}
        <div className="flex flex-col items-center shrink-0 self-stretch">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-gradient-to-tr from-sky-400 via-rose-300 to-amber-300 p-0.5 shadow-sm shrink-0">
            <img
              src={item.authorAvatar || DEFAULT_CONFESSION_AVATAR}
              alt={item.authorName}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Threads Vertical Connecting Thread Line */}
          <div className="w-0.5 flex-1 bg-slate-200 my-2 rounded-full min-h-[16px]" />

          {/* Mini character badge avatar at bottom of the line (Thuần túy ảnh Hạ Giới) */}
          {(displayCharAvatar || item.characterAvatar) && (
            <div
              title={item.characterName}
              className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-xs shrink-0"
            >
              <img
                src={displayCharAvatar || item.characterAvatar}
                alt={item.characterName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Right Column: Author Info, Content, Actions */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Author Name, Badges, Character Tag, Time */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                {item.authorName}
              </span>

              {item.isAdmin && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] tracking-wider uppercase flex items-center gap-0.5 shadow-xs">
                  <Crown className="w-2.5 h-2.5 fill-slate-950" />
                  <span>Admin</span>
                </span>
              )}

              {/* Character Tag Mention */}
              {item.characterName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-black border border-slate-200">
                  <AtSign className="w-2.5 h-2.5 text-sky-500" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{item.characterName}</span>
                </span>
              )}

              {/* Category Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${catConfig.badgeClass}`}
              >
                {catConfig.icon} {catConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold shrink-0">
              <span>{formatTimeAgo(item.createdAt)}</span>
              {isAdmin && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => togglePinConfession(item.id, Boolean(item.pinned))}
                    title={item.pinned ? 'Bỏ ghim' : 'Ghim tâm thư'}
                    className="p-1 hover:text-amber-500 cursor-pointer"
                  >
                    <Pin className={`w-3.5 h-3.5 ${item.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa tâm thư này?')) {
                        deleteConfession(item.id);
                        onShowToast('🗑️ Đã xóa tâm thư');
                      }
                    }}
                    title="Xóa tâm thư"
                    className="p-1 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Body */}
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium mb-3">
            {item.content}
          </div>

          {/* Attached Image (if provided) */}
          {item.imageUrl && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200 max-h-[380px] bg-slate-50 flex items-center justify-center">
              <img
                src={item.imageUrl}
                alt="Đính kèm tâm thư"
                className="w-full max-h-[380px] object-contain rounded-2xl"
                loading="lazy"
              />
            </div>
          )}

          {/* THREADS ACTION BUTTONS: LIKE & REPLIES (SHARE BUTTON REMOVED) */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
            {/* Heart / Like Button */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-90 ${
                isLiked
                  ? 'text-rose-500 bg-rose-50'
                  : 'hover:text-rose-500 hover:bg-slate-100'
              }`}
              title={isLiked ? 'Bỏ thích' : 'Thả tim'}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                }`}
              />
              <span className="font-black text-xs">{likes}</span>
            </button>

            {/* Replies Button */}
            <button
              type="button"
              onClick={onToggleReplies}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-90 ${
                isExpanded
                  ? 'text-sky-600 bg-sky-50'
                  : 'hover:text-sky-600 hover:bg-slate-100'
              }`}
              title="Xem và trả lời thảo luận"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-black text-xs">
                {replies.length > 0 ? replies.length : item.repliesCount || 'Trả lời'}
              </span>
            </button>
          </div>

          {/* =========================================================================
              EXPANDED REPLIES THREAD SECTION (NESTED THREADS)
              ========================================================================= */}
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {/* Nested Replies List */}
              {replies.length > 0 && (
                <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-slate-200">
                  {replies.map((rep) => (
                    <div key={rep.id} className="text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-200 shrink-0">
                          <img
                            src={rep.authorAvatar || DEFAULT_CONFESSION_AVATAR}
                            alt={rep.authorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-black text-slate-800">{rep.authorName}</span>
                        {rep.isAdmin && (
                          <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                            Admin
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold">
                          • {formatTimeAgo(rep.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 ml-5.5">
                        {rep.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Form (Anonymous allowed, no login required) */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    placeholder="Biệt danh (để trống: Ẩn danh)..."
                    maxLength={30}
                    className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 w-36 sm:w-48"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">
                    Không cần đăng nhập
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Viết câu trả lời hoặc thảo luận..."
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-sky-400 focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSendingReply ? '...' : 'Gửi'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
