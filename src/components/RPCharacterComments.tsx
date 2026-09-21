import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquareHeart,
  X,
  Send,
  User,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Reply,
  CornerDownRight,
} from 'lucide-react';
import {
  CharacterComment,
  subscribeToCharacterComments,
  postCharacterComment,
  getCommentRateLimitRemaining,
} from '../services/commentsApi';

interface RPCharacterCommentsProps {
  characterId: string;
  characterName: string;
  characterAvatar?: string;
  characterRole?: string;
  isHellMode?: boolean;
  commentCount?: number;
  hasPassword?: boolean;
}

// Format relative time in Vietnamese
function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export const RPCharacterComments: React.FC<RPCharacterCommentsProps> = ({
  characterId,
  characterName,
  characterAvatar,
  characterRole,
  isHellMode = false,
  commentCount = 0,
  hasPassword = false,
}) => {
  const isLockedChar =
    hasPassword ||
    characterId === 'char-11-lucifer' ||
    characterId === 'char-16-hoang-nhat-thien';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState<CharacterComment[]>([]);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  // Replying state (reply to a comment or thread)
  const [replyingTo, setReplyingTo] = useState<{
    parentId: string;
    targetUserName: string;
  } | null>(null);

  // Collapse/expand state for threads with replies (key: parent comment ID)
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

  // Form states
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('roblox_rp_commenter_name') || '';
    }
    return '';
  });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Group comments into root comments and their replies
  const { rootComments, repliesMap, totalCount } = useMemo(() => {
    const roots: CharacterComment[] = [];
    const replies: Record<string, CharacterComment[]> = {};
    const commentIdSet = new Set(comments.map((c) => c.id));

    comments.forEach((c) => {
      // If it has parentId and the parent exists, group under parent
      if (c.parentId && commentIdSet.has(c.parentId)) {
        if (!replies[c.parentId]) {
          replies[c.parentId] = [];
        }
        replies[c.parentId].push(c);
      } else {
        roots.push(c);
      }
    });

    // Sort replies chronologically (oldest first so it reads naturally like a conversation)
    Object.values(replies).forEach((list) => {
      list.sort((a, b) => a.createdAt - b.createdAt);
    });

    return {
      rootComments: roots,
      repliesMap: replies,
      totalCount: comments.length,
    };
  }, [comments]);

  // Handle start replying to a comment or reply
  const handleStartReply = (item: CharacterComment) => {
    const parentId = item.parentId || item.id;
    setReplyingTo({
      parentId,
      targetUserName: item.userName,
    });
    // Ensure parent thread is expanded
    setCollapsedThreads((prev) => ({
      ...prev,
      [parentId]: false,
    }));
    // Auto-focus textarea smoothly
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const toggleThread = (parentId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  // Subscribe to real-time comments when modal is opened
  useEffect(() => {
    if (!isModalOpen) return;

    setIsLoading(true);
    const unsubscribe = subscribeToCharacterComments(characterId, (updated) => {
      setComments(updated);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [characterId, isModalOpen]);

  // Handle rate-limit countdown interval
  useEffect(() => {
    const currentRemaining = getCommentRateLimitRemaining();
    if (currentRemaining > 0) {
      setRateLimitSeconds(currentRemaining);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (rateLimitSeconds <= 0) return;

    countdownTimerRef.current = setTimeout(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [rateLimitSeconds]);

  // Handle submit comment or reply
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = userName.trim();
    const trimmedText = commentText.trim();

    if (!trimmedName) {
      setFeedbackMessage({ type: 'error', text: 'Vui lòng nhập Tên của bạn / Biệt danh!' });
      return;
    }
    if (!trimmedText) {
      setFeedbackMessage({
        type: 'error',
        text: replyingTo ? 'Vui lòng nhập nội dung phản hồi!' : 'Vui lòng nhập Lời nhắn cho chồng!',
      });
      return;
    }

    const currentRemaining = getCommentRateLimitRemaining();
    if (currentRemaining > 0) {
      setRateLimitSeconds(currentRemaining);
      setFeedbackMessage({
        type: 'error',
        text: `Vui lòng đợi ${currentRemaining}s trước khi gửi tiếp!`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    // Save commenter name for future convenience
    try {
      localStorage.setItem('roblox_rp_commenter_name', trimmedName);
    } catch {
      // Ignore
    }

    const wasReply = !!replyingTo;
    const targetParentId = replyingTo?.parentId || null;
    const targetReplyTo = replyingTo?.targetUserName || null;

    const res = await postCharacterComment(
      characterId,
      trimmedName,
      trimmedText,
      targetParentId,
      targetReplyTo
    );

    setIsSubmitting(false);

    if (res.success) {
      setCommentText('');
      setReplyingTo(null);
      setRateLimitSeconds(5);
      setFeedbackMessage({
        type: 'success',
        text: wasReply ? 'Đã gửi phản hồi thành công! 💬' : 'Đã gửi lời nhắn thành công! ✨',
      });

      if (targetParentId) {
        // Expand the thread where reply was added
        setCollapsedThreads((prev) => ({ ...prev, [targetParentId]: false }));
      } else {
        // Scroll to top of comment list for new root comment
        if (commentsContainerRef.current) {
          commentsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Không thể gửi bình luận. Vui lòng thử lại!',
      });
      if (res.error === 'RATE_LIMITED') {
        setRateLimitSeconds(getCommentRateLimitRemaining());
      }
    }
  };

  const displayCount = Math.max(totalCount, commentCount);
  const isValidForm = userName.trim().length > 0 && commentText.trim().length > 0;
  const isButtonDisabled = !isValidForm || isSubmitting || rateLimitSeconds > 0;

  return (
    <>
      {/* 1. COMPACT TRIGGER BUTTON (Placed below character card) */}
      <div className="w-full mt-2 pt-2 border-t border-slate-200/70 dark:border-red-900/40">
        <button
          id={`btn-comments-${characterId}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`w-full py-1.5 px-2.5 rounded-xl font-bold font-vietnamese text-[11px] sm:text-xs transition-all flex items-center justify-between cursor-pointer select-none group border shadow-2xs ${
            isHellMode
              ? 'bg-red-950/40 hover:bg-red-950/80 text-red-200 hover:text-white border-red-900/50 hover:border-red-600 active:scale-98'
              : 'bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border-slate-200/90 hover:border-sky-300 active:scale-98'
          }`}
          title={`Xem và gửi nhận xét cho ${characterName}`}
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            {isHellMode ? (
              <Flame className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform shrink-0" />
            ) : (
              <MessageSquareHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 group-hover:scale-110 transition-transform shrink-0" />
            )}
            <span className="truncate">💬 Nhận xét</span>
            <span
              className={`px-1.5 py-0.2 rounded-full font-black text-[9.5px] sm:text-[10px] shrink-0 ${
                isHellMode
                  ? 'bg-red-900/80 text-red-100 border border-red-700/50'
                  : 'bg-sky-100 text-sky-700 border border-sky-200'
              }`}
            >
              {displayCount}
            </span>
          </div>

          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              isHellMode ? 'text-red-400/80 group-hover:text-red-200' : 'text-slate-400 group-hover:text-sky-600'
            }`}
          >
            <span>Mở</span>
            <span className="text-xs">↗</span>
          </span>
        </button>
      </div>

      {/* 2. FLOATING MODAL POP-UP OVERLAY (Portaled directly to document.body) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`modal-title-${characterId}`}
              >
                {/* Backdrop with Blur & Dim */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsModalOpen(false)}
                  className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
                />

                {/* Centered Floating Modal Window */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 16 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                  className={`relative w-full max-w-lg h-[86vh] max-h-[620px] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 font-vietnamese ${
                    isHellMode
                      ? 'bg-[#120313] border-red-900/80 text-red-100 shadow-[0_0_50px_rgba(220,38,38,0.35)]'
                      : 'bg-white border-slate-200 text-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.18)]'
                  }`}
                >
                  {/* MODAL HEADER */}
                  <div
                    className={`shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-b flex items-center justify-between gap-3 ${
                      isHellMode
                        ? 'bg-gradient-to-r from-red-950/80 via-[#1c041e] to-black border-red-900/60'
                        : 'bg-gradient-to-r from-sky-50 via-white to-emerald-50/50 border-slate-100'
                    }`}
                  >
                    {/* Character avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 shrink-0 shadow-sm ${
                          isHellMode ? 'border-red-600 bg-black' : 'border-sky-300 bg-slate-100'
                        }`}
                      >
                        {characterAvatar ? (
                          <img
                            src={characterAvatar}
                            alt={characterName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-sm text-slate-400">
                            {characterName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            id={`modal-title-${characterId}`}
                            className={`font-black text-base sm:text-lg truncate ${
                              isHellMode ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {characterName}
                          </h3>
                          {characterRole && (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold truncate hidden sm:inline-block ${
                                isHellMode
                                  ? 'bg-red-900/60 text-red-200 border border-red-700/50'
                                  : 'bg-sky-100 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {characterRole}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                            isHellMode ? 'text-red-300/80' : 'text-slate-500'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Bình luận & Nhận xét công khai</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full font-black text-[10px] ${
                              isHellMode
                                ? 'bg-red-900/80 text-red-100'
                                : 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {displayCount}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Clear ❌ Close Button */}
                    <button
                      id={`btn-close-comments-${characterId}`}
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      aria-label="Đóng bảng nhận xét"
                      title="Đóng (Esc)"
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border shrink-0 ${
                        isHellMode
                          ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border-red-800/60'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border-slate-200/80'
                      }`}
                    >
                      <X className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* SCROLLABLE COMMENT LIST (MIDDLE AREA) */}
                  <div
                    ref={commentsContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-red-900"
                  >
                    {isLoading && (
                      <div className="py-6 text-center">
                        <div
                          className={`inline-block w-6 h-6 border-2 rounded-full animate-spin ${
                            isHellMode
                              ? 'border-red-500/30 border-t-red-500'
                              : 'border-sky-500/30 border-t-sky-500'
                          }`}
                        />
                        <p className="text-xs text-slate-400 mt-2 font-semibold animate-pulse">
                          Đang đồng bộ nhận xét...
                        </p>
                      </div>
                    )}

                    {!isLoading && rootComments.length === 0 && (
                      <div
                        className={`py-10 px-4 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center ${
                          isHellMode
                            ? 'bg-red-950/20 border-red-900/40 text-red-300/80'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
                            isHellMode ? 'bg-red-900/30 text-red-400' : 'bg-sky-100 text-sky-500'
                          }`}
                        >
                          <MessageSquareHeart className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-sm">Chưa có nhận xét nào cho chồng này.</p>
                        <p
                          className={`text-xs mt-1 font-semibold ${
                            isHellMode ? 'text-red-400' : 'text-sky-600'
                          }`}
                        >
                          Hãy là người đầu tiên để lại lời nhắn yêu thương! 💕
                        </p>
                      </div>
                    )}

                    {rootComments.slice(0, visibleCommentsCount).map((item) => {
                      const replies = repliesMap[item.id] || [];
                      const isCollapsed = !!collapsedThreads[item.id];

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border text-xs transition-all gpu-accelerated content-auto ${
                            isHellMode
                              ? 'bg-red-950/30 border-red-900/50 hover:border-red-700/70 text-red-100'
                              : 'bg-slate-50 hover:bg-white border-slate-200/80 hover:border-sky-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          {/* Header: Author Name (Bold) + Timestamp */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Roblox Avatar Initial Chip */}
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs uppercase shrink-0 shadow-2xs ${
                                  isHellMode
                                    ? 'bg-gradient-to-br from-red-600 to-rose-900 text-white'
                                    : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
                                }`}
                              >
                                {item.userName ? item.userName.charAt(0) : 'R'}
                              </div>
                              <span
                                className={`font-black text-xs sm:text-sm truncate ${
                                  isHellMode ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {item.userName}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] sm:text-xs font-medium flex items-center gap-1 shrink-0 ${
                                isHellMode ? 'text-red-400/70' : 'text-slate-400'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          {/* Comment Content */}
                          <p
                            className={`leading-relaxed break-words whitespace-pre-wrap pl-7 sm:pl-8 text-xs sm:text-[13px] font-medium font-vietnamese ${
                              isHellMode ? 'text-red-100/90' : 'text-slate-700'
                            }`}
                          >
                            {item.commentText}
                          </p>

                          {/* Action Row: Reply button & Collapse/Expand replies button */}
                          <div className="flex items-center justify-between gap-2 pl-7 sm:pl-8 mt-2 pt-1 border-t border-slate-200/40 dark:border-red-900/30">
                            <button
                              type="button"
                              onClick={() => handleStartReply(item)}
                              className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
                                isHellMode
                                  ? 'text-red-400 hover:text-red-200 hover:bg-red-900/40'
                                  : 'text-sky-600 hover:text-sky-800 hover:bg-sky-100/70'
                              }`}
                              title={`Phản hồi nhận xét của ${item.userName}`}
                            >
                              <Reply className="w-3 h-3" />
                              <span>Phản hồi</span>
                            </button>

                            {replies.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleThread(item.id)}
                                className={`inline-flex items-center gap-1 font-bold text-[10.5px] px-2 py-0.5 rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
                                  isHellMode
                                    ? 'text-red-300/80 hover:text-red-100 hover:bg-red-950/60'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                                }`}
                              >
                                <CornerDownRight className="w-3 h-3 stroke-[2.5]" />
                                <span>
                                  {isCollapsed
                                    ? `Xem ${replies.length} phản hồi`
                                    : `Ẩn ${replies.length} phản hồi`}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Nested Replies Thread */}
                          {!isCollapsed && replies.length > 0 && (
                            <div className="mt-2.5 ml-4 sm:ml-6 pl-2.5 sm:pl-3.5 border-l-2 space-y-2 border-sky-200/80 dark:border-red-900/50">
                              {replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                                    isHellMode
                                      ? 'bg-[#18041a]/95 border-red-900/40 text-red-100'
                                      : 'bg-white border-slate-200/70 text-slate-800 shadow-2xs'
                                  }`}
                                >
                                  {/* Reply header */}
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[9.5px] uppercase shrink-0 shadow-2xs ${
                                          isHellMode
                                            ? 'bg-gradient-to-br from-red-600 to-rose-900 text-white'
                                            : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
                                        }`}
                                      >
                                        {reply.userName ? reply.userName.charAt(0) : 'R'}
                                      </div>
                                      <span
                                        className={`font-black text-xs truncate ${
                                          isHellMode ? 'text-white' : 'text-slate-900'
                                        }`}
                                      >
                                        {reply.userName}
                                      </span>
                                    </div>

                                    <span
                                      className={`text-[9.5px] sm:text-[10px] font-medium flex items-center gap-1 shrink-0 ${
                                        isHellMode ? 'text-red-400/70' : 'text-slate-400'
                                      }`}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatRelativeTime(reply.createdAt)}
                                    </span>
                                  </div>

                                  {/* Reply content with @mention */}
                                  <p className="leading-relaxed break-words whitespace-pre-wrap pl-6 text-xs font-medium font-vietnamese">
                                    {reply.replyToUserName && (
                                      <span
                                        className={`font-bold mr-1.5 ${
                                          isHellMode ? 'text-amber-400' : 'text-sky-600'
                                        }`}
                                      >
                                        @{reply.replyToUserName}
                                      </span>
                                    )}
                                    {reply.commentText}
                                  </p>

                                  {/* Sub-reply action */}
                                  <div className="flex justify-end pl-6 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleStartReply(reply)}
                                      className={`inline-flex items-center gap-1 font-bold text-[10.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer select-none active:scale-95 ${
                                        isHellMode
                                          ? 'text-red-400/90 hover:text-red-200 hover:bg-red-900/30'
                                          : 'text-sky-600 hover:text-sky-800 hover:bg-sky-100/60'
                                      }`}
                                      title={`Phản hồi lại ${reply.userName}`}
                                    >
                                      <Reply className="w-2.5 h-2.5" />
                                      <span>Phản hồi</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Load More Older Comments Button */}
                    {rootComments.length > visibleCommentsCount && (
                      <div className="flex justify-center pt-2 pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setVisibleCommentsCount((prev) => prev + 15);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                            isHellMode
                              ? 'bg-red-950/60 hover:bg-red-900/80 border-red-800 text-red-200'
                              : 'bg-white hover:bg-sky-50 border-slate-200 hover:border-sky-300 text-slate-700'
                          }`}
                        >
                          <span>Xem thêm nhận xét cũ hơn ({rootComments.length - visibleCommentsCount})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FIXED INPUT SECTION (BOTTOM AREA) */}
                  <div
                    className={`shrink-0 p-3 sm:p-4 border-t font-vietnamese ${
                      isHellMode
                        ? 'bg-black/85 border-red-900/60'
                        : 'bg-slate-50/95 border-slate-200'
                    }`}
                  >
                    <form onSubmit={handleSubmit} className="space-y-2">
                      {/* Active Reply Banner Indicator */}
                      {replyingTo && (
                        <div
                          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-vietnamese border transition-all ${
                            isHellMode
                              ? 'bg-red-950/70 border-red-800 text-red-200'
                              : 'bg-sky-100/80 border-sky-200 text-sky-800 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Reply className="w-3.5 h-3.5 text-sky-600 dark:text-red-400 shrink-0" />
                            <span className="font-semibold text-[11px] sm:text-xs">Đang phản hồi:</span>
                            <span className="font-black text-[11px] sm:text-xs text-sky-700 dark:text-amber-300 truncate">
                              @{replyingTo.targetUserName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelReply}
                            className="p-1 hover:opacity-75 cursor-pointer rounded-md transition-opacity shrink-0 text-slate-500 hover:text-slate-800 dark:text-red-300 dark:hover:text-white"
                            title="Hủy phản hồi"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Stylized "Biệt danh" Text Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            className={`font-bold text-[11px] sm:text-xs flex items-center gap-1.5 ${
                              isHellMode ? 'text-red-200' : 'text-slate-600'
                            }`}
                          >
                            <User
                              className={`w-3.5 h-3.5 ${
                                isHellMode ? 'text-red-400' : 'text-sky-500'
                              }`}
                            />
                            <span>Biệt danh của bạn:</span>
                          </label>
                          <span className="text-[10px] text-slate-400 italic">
                            *Hiện công khai
                          </span>
                        </div>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          maxLength={50}
                          placeholder="Ví dụ: Vô danh, Fan cuồng, Em iu..."
                          className={`w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border font-medium font-vietnamese outline-hidden transition-all ${
                            isHellMode
                              ? 'bg-red-950/40 border-red-800/80 text-white placeholder:text-red-400/50 focus:border-red-500 focus:bg-red-950/70'
                              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                          }`}
                        />
                      </div>

                      {/* Multi-line "Nội dung nhận xét" Input Box */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            className={`font-bold text-[11px] sm:text-xs flex items-center gap-1.5 ${
                              isHellMode ? 'text-red-200' : 'text-slate-600'
                            }`}
                          >
                            <Sparkles
                              className={`w-3.5 h-3.5 ${
                                isHellMode ? 'text-amber-400' : 'text-amber-500'
                              }`}
                            />
                            <span>{replyingTo ? 'Nội dung phản hồi:' : 'Nội dung nhận xét:'}</span>
                          </label>
                          <span
                            className={`text-[10px] font-mono ${
                              commentText.length >= 240
                                ? 'text-rose-500 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {commentText.length}/250
                          </span>
                        </div>
                        <textarea
                          ref={textareaRef}
                          rows={2}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          maxLength={250}
                          placeholder={
                            replyingTo
                              ? `Phản hồi lại cho @${replyingTo.targetUserName}...`
                              : `Để lại lời nhắn yêu thương cho ${characterName}...`
                          }
                          className={`w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border font-medium font-vietnamese outline-hidden transition-all resize-none ${
                            isHellMode
                              ? 'bg-red-950/40 border-red-800/80 text-white placeholder:text-red-400/50 focus:border-red-500 focus:bg-red-950/70'
                              : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                          }`}
                        />
                      </div>

                      {/* Feedback banner */}
                      {feedbackMessage && (
                        <div
                          className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 rounded-xl font-vietnamese ${
                            feedbackMessage.type === 'success'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {feedbackMessage.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                          )}
                          <span>{feedbackMessage.text}</span>
                        </div>
                      )}

                      {/* Prominent "Gửi nhận xét / phản hồi" Button */}
                      <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`w-full py-2.5 px-4 rounded-xl font-black font-vietnamese text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98 ${
                          isButtonDisabled
                            ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-red-950/40 dark:text-red-400/40 border border-transparent'
                            : isHellMode
                              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/50 border border-red-400/40'
                              : 'bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white shadow-sky-500/25 border-t border-white/30'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 stroke-[2.5]" />
                        )}
                        <span>
                          {rateLimitSeconds > 0
                            ? `Đợi ${rateLimitSeconds}s trước khi gửi tiếp`
                            : isSubmitting
                              ? (replyingTo ? 'Đang gửi phản hồi...' : 'Đang gửi nhận xét...')
                              : (replyingTo ? 'Gửi phản hồi' : 'Gửi nhận xét')}
                        </span>
                      </button>

                      {/* Caution reminder inside modal - ONLY for characters with password */}
                      {isLockedChar && (
                        <div
                          className={`w-full py-1.5 px-2.5 rounded-xl text-[10.5px] sm:text-[11px] font-medium font-vietnamese text-center leading-tight border transition-all flex items-center justify-center gap-1.5 ${
                            isHellMode
                              ? 'bg-red-950/40 border-red-900/60 text-red-300'
                              : 'bg-amber-50/90 border-amber-200 text-amber-900 shadow-2xs'
                          }`}
                        >
                          <span className="shrink-0 text-xs">⚠️</span>
                          <span>Các bồ iu thương mộng chè bằng cách không spoil pass nhóe🥹</span>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
