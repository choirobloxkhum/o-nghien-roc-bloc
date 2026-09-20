import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  User,
  Heart,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ImageIcon,
  FolderOpen,
  RefreshCw,
  Link as LinkIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RPCharacter, Artwork } from '../types';
import { MONG_CHE_CHARACTER } from '../data/rpCharacters';
import { submitArtwork, uploadArtworkFile } from '../services/artworksApi';
import { playUiClick, playVictoryChime } from '../utils/audio';

interface ArtworkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: RPCharacter[];
  initialSelectedCharId?: string;
  isHellMode?: boolean;
  soundEnabled?: boolean;
  onArtworkSubmitted: (newArtwork: Artwork) => void;
  onSecretLetterTriggered?: () => void;
}

export const ArtworkSubmissionModal: React.FC<ArtworkSubmissionModalProps> = ({
  isOpen,
  onClose,
  characters,
  initialSelectedCharId,
  isHellMode = false,
  soundEnabled = true,
  onArtworkSubmitted,
  onSecretLetterTriggered,
}) => {
  // Ensure Mộng chè is always at the top of the selectable list
  const availableCharacters: RPCharacter[] = [
    MONG_CHE_CHARACTER,
    ...characters.filter((c) => c.id !== MONG_CHE_CHARACTER.id),
  ];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [useUrlMode, setUseUrlMode] = useState(false);

  const [selectedCharId, setSelectedCharId] = useState(
    initialSelectedCharId || availableCharacters[0]?.id || ''
  );
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const selectedChar =
    availableCharacters.find((c) => c.id === selectedCharId) || availableCharacters[0];

  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF)!');
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh tối đa là 15MB!');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    // Generate local preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick(soundEnabled);
    setErrorMessage(null);

    const trimmedAuthor = authorName.trim();
    if (!trimmedAuthor) {
      setErrorMessage('Vui lòng nhập Tên tác giả / Họa sĩ (biệt danh của bạn)!');
      return;
    }

    if (!selectedCharId) {
      setErrorMessage('Vui lòng chọn anh chồng được vẽ trong tranh!');
      return;
    }

    let finalImageUrl = '';

    if (useUrlMode) {
      finalImageUrl = imageUrl.trim();
      if (!finalImageUrl) {
        setErrorMessage('Vui lòng nhập đường dẫn liên kết hình ảnh!');
        return;
      }
    } else {
      if (!selectedFile && !previewDataUrl) {
        setErrorMessage('Vui lòng chọn tệp ảnh từ máy tính hoặc điện thoại của bạn!');
        return;
      }
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    setUploadStatusText('Đang khởi tạo tải ảnh lên...');

    try {
      if (!useUrlMode && selectedFile) {
        setUploadStatusText('Đang tải ảnh trực tiếp từ thiết bị...');
        const uploadRes = await uploadArtworkFile(selectedFile, (progress) => {
          setUploadProgress(progress);
        });

        if (!uploadRes.success || !uploadRes.url) {
          throw new Error(uploadRes.message || 'Không thể tải tệp ảnh lên');
        }

        finalImageUrl = uploadRes.url;
      } else if (!useUrlMode && previewDataUrl) {
        finalImageUrl = previewDataUrl;
      }

      setUploadStatusText('Đang lưu tác phẩm vào phòng tranh...');
      setUploadProgress(90);

      const result = await submitArtwork({
        imageUrl: finalImageUrl,
        characterId: selectedCharId,
        characterName: selectedChar?.name || 'Chồng Roblox',
        characterAvatarUrl: selectedChar?.avatarUrl || '',
        authorName: trimmedAuthor,
        title: title.trim(),
        message: message.trim(),
      });

      if (result.success && result.artwork) {
        setUploadProgress(100);
        playVictoryChime(soundEnabled);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });

        const isDedicatedToMongChe = selectedCharId === MONG_CHE_CHARACTER.id;

        onArtworkSubmitted(result.artwork);
        // Reset form
        handleClearSelectedFile();
        setImageUrl('');
        setAuthorName('');
        setTitle('');
        setMessage('');
        onClose();

        // If artwork is dedicated to Mộng chè, reveal the secret letter!
        if (isDedicatedToMongChe && onSecretLetterTriggered) {
          setTimeout(() => {
            onSecretLetterTriggered();
          }, 350);
        }
      } else {
        setErrorMessage(result.message || 'Không thể đăng tranh. Vui lòng thử lại!');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Đã xảy ra lỗi khi đăng tranh. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) {
              playUiClick(soundEnabled);
              onClose();
            }
          }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl border-2 z-10 my-auto max-h-[92vh] overflow-y-auto ${
            isHellMode
              ? 'bg-[#15021a] border-red-700/80 text-purple-100 shadow-[0_0_50px_rgba(220,38,38,0.5)]'
              : 'bg-white border-sky-300 text-slate-800 shadow-[0_10px_40px_rgba(3,105,161,0.3)]'
          }`}
        >
          {/* Header Glow Accent */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r ${
              isHellMode
                ? 'from-red-600 via-purple-600 to-amber-500'
                : 'from-amber-400 via-sky-400 to-indigo-500'
            }`}
          />

          {/* Close Button */}
          <button
            onClick={() => {
              if (!isSubmitting) {
                playUiClick(soundEnabled);
                onClose();
              }
            }}
            disabled={isSubmitting}
            className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full transition-all cursor-pointer ${
              isHellMode
                ? 'bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Đóng"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-5 pr-8">
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 sm:p-2.5 shadow-md shrink-0 ${
                isHellMode
                  ? 'bg-gradient-to-br from-red-600 to-purple-800 text-white'
                  : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
              }`}
            >
              <Upload className="w-full h-full stroke-[2.5]" />
            </div>
            <div>
              <h3
                className={`text-base sm:text-xl font-black tracking-tight flex items-center gap-1 sm:gap-1.5 ${
                  isHellMode ? 'text-red-200' : 'text-sky-950'
                }`}
              >
                <span>Đăng Tranh Vào Phòng Tranh</span>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </h3>
              <p
                className={`text-[11px] sm:text-xs font-semibold ${
                  isHellMode ? 'text-purple-300/80' : 'text-slate-500'
                }`}
              >
                Tải ảnh trực tiếp từ máy tính/điện thoại (PNG, JPG, WEBP) 🎨
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* 1. Direct Device File Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className={`text-xs sm:text-sm font-black flex items-center gap-1 sm:gap-1.5 ${
                    isHellMode ? 'text-purple-200' : 'text-slate-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span>Hình ảnh tranh vẽ (từ thiết bị)</span>
                </label>

                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playUiClick(soundEnabled);
                    setUseUrlMode(!useUrlMode);
                  }}
                  className="text-[10px] sm:text-[11px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{useUrlMode ? 'Chọn tệp từ máy' : 'Dán link ảnh'}</span>
                </button>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                onChange={handleInputChange}
                className="hidden"
              />

              {!useUrlMode ? (
                <div>
                  {!previewDataUrl ? (
                    /* Dropzone / Upload Box */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => {
                        playUiClick(soundEnabled);
                        fileInputRef.current?.click();
                      }}
                      className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 group ${
                        isDragging
                          ? 'border-amber-400 bg-amber-50/20 scale-[0.99]'
                          : isHellMode
                          ? 'border-purple-800/80 bg-purple-950/30 hover:border-red-500 hover:bg-purple-950/50'
                          : 'border-sky-300 bg-sky-50/50 hover:border-sky-500 hover:bg-sky-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isHellMode
                            ? 'bg-red-950/70 text-red-300 border border-red-800'
                            : 'bg-white text-sky-600 shadow-sm border border-sky-200'
                        }`}
                      >
                        <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <div>
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            isHellMode ? 'text-purple-200' : 'text-slate-800'
                          }`}
                        >
                          Nhấn để chọn ảnh từ máy hoặc kéo thả vào đây
                        </p>
                        <p
                          className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${
                            isHellMode ? 'text-purple-400' : 'text-slate-400'
                          }`}
                        >
                          Hỗ trợ PNG, JPG, WEBP, GIF (Tối đa 15MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Selected Image Live Preview Box */
                    <div
                      className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 flex items-center gap-2.5 sm:gap-3 overflow-hidden ${
                        isHellMode
                          ? 'bg-purple-950/40 border-purple-800/70 text-purple-100'
                          : 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border bg-black/20 shrink-0 relative flex items-center justify-center shadow-inner">
                        <img
                          src={previewDataUrl}
                          alt="Preview"
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1 text-emerald-600 text-[11px] sm:text-xs font-black mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Đã sẵn sàng tải lên</span>
                        </div>
                        <p className="font-bold text-xs sm:text-sm truncate">
                          {selectedFile ? selectedFile.name : 'Hình ảnh đã chọn'}
                        </p>
                        {selectedFile && (
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            playUiClick(soundEnabled);
                            fileInputRef.current?.click();
                          }}
                          className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-sky-500 hover:text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Đổi ảnh khác</span>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          playUiClick(soundEnabled);
                          handleClearSelectedFile();
                        }}
                        className="p-1 rounded-full hover:bg-black/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback Direct URL Input */
                <div>
                  <input
                    id="input-artwork-url"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="https://..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold outline-none border-2 transition-all ${
                      isHellMode
                        ? 'bg-purple-950/40 border-purple-900/60 focus:border-red-500 text-purple-100 placeholder-purple-400/40'
                        : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* 2. Character Selector Dropdown */}
            <div>
              <label
                htmlFor="select-artwork-character"
                className={`block text-xs sm:text-sm font-black mb-1.5 ${
                  isHellMode ? 'text-purple-200' : 'text-slate-700'
                }`}
              >
                Dành tặng ai trong thế giới Roblox RP:
              </label>

              <div className="relative">
                <select
                  id="select-artwork-character"
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold outline-none border-2 transition-all cursor-pointer ${
                    selectedCharId === MONG_CHE_CHARACTER.id
                      ? 'bg-gradient-to-r from-pink-50 to-amber-50 dark:bg-[#250428] border-pink-400 dark:border-pink-500 text-pink-700 dark:text-pink-200'
                      : isHellMode
                      ? 'bg-[#1e0524] border-purple-900/60 focus:border-red-500 text-purple-100'
                      : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800'
                  }`}
                >
                  {availableCharacters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.id === MONG_CHE_CHARACTER.id
                        ? `👑 ✨ ${char.name} (Ngọc Hoàng) ✨`
                        : `${char.name} ${char.roleTag ? `(${char.roleTag})` : ''}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Selected Character Banner */}
              {selectedChar && (
                <div className="mt-2">
                  {selectedChar.id === MONG_CHE_CHARACTER.id ? (
                    <div className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 border-2 border-pink-400/80 dark:border-pink-500/70 flex items-center gap-3 shadow-md backdrop-blur-sm">
                      {/* Avatar with Rainbow Halo */}
                      <div className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11">
                        <div
                          className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-rose-500 animate-spin opacity-85 blur-2xs"
                          style={{ animationDuration: '3.5s' }}
                        />
                        <img
                          src={selectedChar.avatarUrl}
                          alt={selectedChar.name}
                          className="relative w-full h-full rounded-full object-cover border-2 border-white shadow-sm select-none pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -top-1 -right-1 text-xs">👑</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs sm:text-sm text-pink-600 dark:text-pink-300 truncate">
                            {selectedChar.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-pink-500 text-white shadow-2xs">
                            ĐẶC BIỆT
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-pink-700/90 dark:text-pink-200/90 italic font-medium leading-tight mt-0.5">
                          💌 Gửi tranh tặng Mộng chè sẽ kích hoạt lá thư bí mật & nụ hôn ngọt ngào! ✨
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-purple-300">
                      <img
                        src={selectedChar.avatarUrl}
                        alt={selectedChar.name}
                        className="w-5 h-5 rounded-full object-cover border border-amber-300 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold">{selectedChar.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Author Name Input */}
            <div>
              <label
                htmlFor="input-artwork-author"
                className={`text-xs sm:text-sm font-black flex items-center gap-1.5 mb-1.5 ${
                  isHellMode ? 'text-purple-200' : 'text-slate-700'
                }`}
              >
                <User className="w-4 h-4 text-sky-500" />
                <span>Tên tác giả / Họa sĩ (biệt danh của bạn)</span>
              </label>

              <input
                id="input-artwork-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Bé Kem Mộng Mơ, Họa Sĩ Cung Đình,..."
                maxLength={60}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold outline-none border-2 transition-all ${
                  isHellMode
                    ? 'bg-purple-950/40 border-purple-900/60 focus:border-red-500 text-purple-100 placeholder-purple-400/40'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800 placeholder-slate-400'
                }`}
                required
              />
            </div>

            {/* 4. Optional Title Input */}
            <div>
              <label
                htmlFor="input-artwork-title"
                className={`text-xs sm:text-sm font-black flex items-center gap-1.5 mb-1.5 ${
                  isHellMode ? 'text-purple-200' : 'text-slate-700'
                }`}
              >
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Tiêu đề bức tranh (tùy chọn)</span>
              </label>

              <input
                id="input-artwork-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Nét bút họa chàng dưới ánh trăng..."
                maxLength={100}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold outline-none border-2 transition-all ${
                  isHellMode
                    ? 'bg-purple-950/40 border-purple-900/60 focus:border-red-500 text-purple-100 placeholder-purple-400/40'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* 5. Optional Message Input (Lời nhắn) */}
            <div>
              <label
                htmlFor="input-artwork-message"
                className={`text-xs sm:text-sm font-black flex items-center gap-1.5 mb-1.5 ${
                  isHellMode ? 'text-purple-200' : 'text-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-sky-500" />
                <span>Lời nhắn (tùy chọn)</span>
              </label>

              <textarea
                id="input-artwork-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="VD: Gửi anh chồng iu, mong nét vẽ này sẽ luôn khiến anh mỉm cười... ❤️"
                maxLength={250}
                rows={2}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold outline-none border-2 transition-all resize-none ${
                  isHellMode
                    ? 'bg-purple-950/40 border-purple-900/60 focus:border-red-500 text-purple-100 placeholder-purple-400/40'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Strict Anti-AI Notice Seal */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] font-semibold ${
                isHellMode
                  ? 'bg-red-950/40 border-red-800/60 text-red-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Tác phẩm được bảo vệ nguyên bản, không suy giảm chất lượng và không qua mô hình AI.</span>
            </div>

            {/* Real-time Upload Progress Bar */}
            {isSubmitting && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-sky-600 flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <span>{uploadStatusText || 'Đang xử lý tải ảnh lên...'}</span>
                  </span>
                  <span className="text-slate-500">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-sky-500 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    playUiClick(soundEnabled);
                    onClose();
                  }
                }}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  isHellMode
                    ? 'bg-purple-950/50 hover:bg-purple-900/60 border-purple-800 text-purple-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 to-purple-700 hover:from-red-500 hover:to-purple-600 shadow-red-950/50'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-sky-600 hover:from-amber-600 hover:to-sky-700 shadow-orange-500/30'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải tranh...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng tranh</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
