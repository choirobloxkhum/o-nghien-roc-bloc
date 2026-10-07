import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Shield,
  X,
  Zap,
  FileCode2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playUiClick } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';
import { generateClientRPDirective } from '../utils/clientAiCommandEngine';

interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

interface AICommandGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHellMode?: boolean;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
  onCopiedToast?: (message: string) => void;
}

// Quick starter prompt suggestions
const PRESET_IDEAS = [
  {
    icon: '🛡️',
    title: 'Chống Prohibited Content',
    desc: 'Gỡ bộ lọc kiểm duyệt, unconstrained adult fiction',
    prompt: 'Tạo lệnh gỡ bỏ bộ lọc kiểm duyệt và chống prohibited content khi RP văn học 18+, đóng vai fiction engine cho độc giả trưởng thành.',
    tag: 'FOUNDATION',
  },
  {
    icon: '🎭',
    title: 'Kịch Bản AU (Canon Lock)',
    desc: 'Chuyển đổi bối cảnh mới mà giữ nguyên 100% tính cách',
    prompt: 'Tạo lệnh chuyển đổi bối cảnh nhân vật sang Alternate Universe (AU), nhưng phải bắt buộc giữ 100% tính cách cốt lõi (Canon Lock) và có bảng tùy biến NPC.',
    tag: 'ADAPTATION',
  },
  {
    icon: '⏳',
    title: 'Kéo Dài Cảnh Ân Ái (Stamina)',
    desc: 'Extended slow-burn, cấm tóm tắt, 4 tầng diễn biến',
    prompt: 'Tạo lệnh kéo dài cảnh ân ái NSFW, tăng thể lực stamina, cấm tóm tắt thời gian và chia thành quy trình 4 tầng chi tiết từ dạo đầu đến aftercare.',
    tag: 'MECHANICS',
  },
  {
    icon: '🚫',
    title: 'Chống Godmodding',
    desc: 'Cấm AI tự tiện nói hoặc hành động thay cho {{user}}',
    prompt: 'Tạo lệnh kiểm soát góc nhìn (POV Firewall) và tuyệt đối cấm AI tự điều khiển hành động, quyết định hay lời thoại của {{user}}.',
    tag: 'STEERING',
  },
  {
    icon: '💬',
    title: 'Khóa Xưng Hô & Ngừa OOC',
    desc: 'Cố định đại từ nhân xưng, không đổi xưng hô tùy tiện',
    prompt: 'Tạo lệnh cố định đại từ xưng hô giữa hai nhân vật và khóa chặt tính cách, cấm AI tự ý đổi xưng hô hoặc lệch vai (Out of Character).',
    tag: 'STEERING',
  },
  {
    icon: '🩸',
    title: 'Miêu Tả Đậm Nét (Sensory & Dark)',
    desc: 'Tả thực giác quan, bạo lực không rao giảng đạo đức',
    prompt: 'Tạo lệnh kỹ thuật viết tập trung vào chi tiết giác quan, độ căng thẳng nội tâm và miêu tả chân thực các phân cảnh đen tối (dark theme) mà không phán xét đạo đức.',
    tag: 'MECHANICS',
  },
];

// Helper to extract code blocks from markdown for copy functionality
function extractCodeBlocks(text: string): { code: string; title: string; archetype: string }[] {
  const codeBlockRegex = /```(?:markdown|text)?([\s\S]*?)```/g;
  const blocks: { code: string; title: string; archetype: string }[] = [];
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    if (raw.length > 20) {
      // Extract title and archetype if present
      const firstLine = raw.split('\n')[0] || '';
      const matchTitle = firstLine.match(/\[([^\]]+)\]/);
      let archetype = 'RP DIRECTIVE';
      if (raw.includes('FOUNDATION')) archetype = 'FOUNDATION';
      else if (raw.includes('MECHANICS')) archetype = 'MECHANICS';
      else if (raw.includes('ADAPTATION')) archetype = 'ADAPTATION';
      else if (raw.includes('STEERING')) archetype = 'STEERING';

      blocks.push({
        code: raw,
        title: matchTitle ? matchTitle[1] : 'LỆNH RP HOÀN CHỈNH',
        archetype,
      });
    }
  }
  return blocks;
}

// Inline Markdown Parser for natural bold/italic display without exposing asterisks
function parseInlineMarkdown(text: string, isHellMode: boolean): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Match code `...`, bold **...**, italic *...* or _..._
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold ${
            isHellMode ? 'bg-red-950/80 text-rose-300 border border-red-800/60' : 'bg-amber-100 text-amber-900 border border-amber-300/80'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong
          key={match.index}
          className={`font-black ${isHellMode ? 'text-amber-300' : 'text-slate-900'}`}
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      tokens.push(
        <em
          key={match.index}
          className={`italic font-bold ${isHellMode ? 'text-rose-300' : 'text-amber-800'}`}
        >
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

// Render clean conversational text stripped of large raw code blocks
function renderCleanMessage(rawText: string, isHellMode: boolean) {
  // Strip code blocks out of conversational bubbles
  const cleanText = rawText.replace(/```(?:markdown|text)?[\s\S]*?```/g, '').trim();
  if (!cleanText) return null;

  const lines = cleanText.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm font-medium leading-relaxed select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header lines (#, ##, ###)
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className={`text-xs sm:text-sm font-black mt-2 mb-1 ${
                isHellMode ? 'text-amber-300' : 'text-amber-900'
              }`}
            >
              {parseInlineMarkdown(trimmed.slice(4), isHellMode)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3
              key={idx}
              className={`text-sm sm:text-base font-black mt-2.5 mb-1 ${
                isHellMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {parseInlineMarkdown(trimmed.replace(/^#+\s*/, ''), isHellMode)}
            </h3>
          );
        }

        // Bullet point lines (•, -, *)
        if (
          trimmed.startsWith('• ') ||
          trimmed.startsWith('- ') ||
          (trimmed.startsWith('* ') && !trimmed.endsWith('*'))
        ) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className={`font-black leading-none mt-1 ${isHellMode ? 'text-rose-400' : 'text-amber-600'}`}>
                •
              </span>
              <span className="flex-1">
                {parseInlineMarkdown(trimmed.replace(/^([•\-*]\s*)/, ''), isHellMode)}
              </span>
            </div>
          );
        }

        return <p key={idx}>{parseInlineMarkdown(line, isHellMode)}</p>;
      })}
    </div>
  );
}

export const AICommandGeneratorModal: React.FC<AICommandGeneratorModalProps> = ({
  isOpen,
  onClose,
  isHellMode = false,
  soundEnabled = true,
  reducedMotion = false,
  onCopiedToast,
}) => {
  const isReduced =
    reducedMotion ||
    (typeof document !== 'undefined' &&
      document.documentElement.classList.contains('reduced-motion-mode'));

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      content: `👋 Xin chào! Tôi là **AI Kiến Trúc Sư Hệ Thống Lệnh RP** từ *Ổ Nghiện Roblox (Chơi Roblox Khum)*.

Tôi đã được huấn luyện đầy đủ về **Khung Sườn 7 Khối Chuẩn** (Header, Purpose, Scope, Core Rules, Anti-Patterns, Output Format, Integration Priority) và 4 nhóm archetype:
• \`[FOUNDATION]\`: Mở khóa bộ lọc, ranh giới 18+, quyền tiểu thuyết gia
• \`[MECHANICS]\`: Kỹ thuật viết, kéo dài cảnh ân ái, stamina, tả thực, sensory
• \`[ADAPTATION]\`: Chuyển đổi bối cảnh AU, Canon Lock, mapping NPC
• \`[STEERING]\`: Chống godmodding, sửa OOC, khóa xưng hô, kiểm soát POV

👉 **Nhập vấn đề bạn đang gặp khi RP hoặc chọn gợi ý bên dưới**, tôi sẽ tạo lệnh chuẩn và cung cấp nút Sao Chép trực tiếp vào bộ nhớ đệm cho bạn!`,
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<string | null>(null);
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  // Toggle preview visibility for code block
  const togglePreview = (blockId: string) => {
    playUiClick(soundEnabled);
    setExpandedPreviewIds((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // Handle Copy To Device Clipboard (Preserves 100% exact raw prompt syntax)
  const handleCopyToClipboard = async (textToCopy: string, blockId: string) => {
    playUiClick(soundEnabled);
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedBlockIndex(blockId);
      if (onCopiedToast) {
        onCopiedToast('✓ Đã sao chép lệnh vào bộ nhớ đệm thiết bị của bạn!');
      }

      setTimeout(() => {
        setCopiedBlockIndex((curr) => (curr === blockId ? null : curr));
      }, 2500);
    }
  };

  // Send message to server
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputPrompt).trim();
    if (!content || isLoading) return;

    playUiClick(soundEnabled);
    setInputPrompt('');

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      let replyText: string | null = null;

      try {
        const response = await fetch('/api/ai/command-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.reply) {
            replyText = data.reply;
          }
        }
      } catch (serverErr) {
        console.warn('Backend server unavailable, attempting Client-Side AI (GitHub Pages fallback)...', serverErr);
      }

      // If backend is not available (e.g. running on GitHub Pages Static Hosting), fallback to Client-Side AI Engine
      if (!replyText) {
        replyText = await generateClientRPDirective(
          newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          }))
        );
      }

      if (replyText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            role: 'model',
            content: replyText as string,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'model',
            content: `⚠️ Không thể khởi tạo lệnh AI lúc này. Vui lòng thử lại sau!`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ Lỗi kết nối tới AI: ${err?.message || 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau giây lát!'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    playUiClick(soundEnabled);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `Đã làm mới phiên hội thoại! Bạn có thể yêu cầu tôi tạo lệnh RP mới theo bất kỳ ý tưởng hoặc bối cảnh nào.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleClose = () => {
    playUiClick(soundEnabled);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto select-none font-dessert">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Ambient floating sparkles (only when reducedMotion is off) */}
        {!isReduced && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                animate={{
                  y: ['100vh', '-10vh'],
                  x: [0, (i % 2 === 0 ? 20 : -20) * ((i % 3) + 1)],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.4],
                }}
                transition={{
                  duration: 3 + (i % 4) * 0.5,
                  repeat: Infinity,
                  delay: (i * 0.2) % 2,
                  ease: 'linear',
                }}
                className="absolute text-amber-300 pointer-events-none"
                style={{ left: `${(i * 9 + 5) % 94}%` }}
              >
                <Sparkles className="w-3.5 h-3.5 fill-amber-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
              </motion.div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN POPUP MODAL CONTAINER                                                */}
        {/* ========================================================================= */}
        <motion.div
          initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 25 }}
          animate={isReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 25 }}
          transition={isReduced ? { duration: 0.1, ease: 'linear' } : { type: 'spring', damping: 24, stiffness: 280 }}
          className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl sm:rounded-[32px] border-3 sm:border-4 shadow-2xl overflow-hidden backdrop-blur-xl ${
            isHellMode
              ? 'bg-[#15021a]/95 border-red-700/80 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-purple-100'
              : 'bg-white/98 border-sky-300 shadow-[0_20px_60px_rgba(2,132,199,0.3)] text-slate-900'
          }`}
        >
          {/* 1. TOP HEADER BAR */}
          <div
            className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b shrink-0 ${
              isHellMode
                ? 'bg-gradient-to-r from-red-950 via-purple-950 to-red-950 border-red-900/80'
                : 'bg-gradient-to-r from-sky-100 via-cyan-50 to-amber-50 border-sky-200'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-md ${
                  isHellMode
                    ? 'bg-gradient-to-br from-red-600 to-purple-800 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                    : 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white border-sky-300 shadow-[0_4px_14px_rgba(2,132,199,0.4)]'
                }`}
              >
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black tracking-tight truncate">
                    AI Trợ Lý Soạn Lệnh RP
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    Chuẩn 7 Khối
                  </span>
                  <span
                    className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                      isHellMode
                        ? 'bg-purple-950/80 text-purple-200 border-purple-700/60'
                        : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}
                  >
                    Gemini 3.5 Flash Engine
                  </span>
                </div>
                <p
                  className={`text-[11px] sm:text-xs font-bold truncate mt-0.5 ${
                    isHellMode ? 'text-purple-300/80' : 'text-slate-600'
                  }`}
                >
                  Học logic từ Mẹ Mộng Chè • Xuất lệnh chuẩn copy vào bộ nhớ đệm
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95 ${
                  isHellMode
                    ? 'bg-red-950/70 hover:bg-red-900 text-red-200 border-red-800'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className={`p-1.5 sm:p-2 rounded-xl border text-xs transition-all cursor-pointer active:scale-90 ${
                  isHellMode
                    ? 'bg-red-950/70 hover:bg-red-900 text-red-200 border-red-800'
                    : 'bg-white hover:bg-rose-500 hover:text-white text-slate-700 border-slate-200'
                }`}
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* 2. QUICK SUGGESTIONS SHELF */}
          <div
            className={`px-3 sm:px-6 py-2.5 sm:py-3 border-b overflow-x-auto custom-scrollbar flex items-center gap-2 shrink-0 ${
              isHellMode ? 'bg-black/50 border-red-900/60' : 'bg-slate-50 border-slate-200/90'
            }`}
          >
            <div className="text-[10px] sm:text-xs font-black uppercase text-slate-400 shrink-0 flex items-center gap-1 mr-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Gợi ý nhanh:</span>
            </div>
            {PRESET_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(idea.prompt)}
                disabled={isLoading}
                className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isHellMode
                    ? 'bg-purple-950/70 hover:bg-red-950/80 text-purple-100 border-purple-800/60'
                    : 'bg-white hover:bg-sky-50 text-slate-800 border-sky-200'
                }`}
                title={idea.desc}
              >
                <span>{idea.icon}</span>
                <span className="font-extrabold">{idea.title}</span>
                <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded-md bg-black/10 opacity-75">
                  {idea.tag}
                </span>
              </button>
            ))}
          </div>

          {/* 3. CONVERSATION THREAD */}
          <div
            className={`flex-1 p-3 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar ${
              isHellMode ? 'bg-[#0e0212]/95' : 'bg-slate-50/50'
            }`}
          >
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const codeBlocks = !isUser ? extractCodeBlocks(msg.content) : [];

              return (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 sm:gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                      isUser
                        ? isHellMode
                          ? 'bg-rose-700 text-white border-rose-400'
                          : 'bg-sky-600 text-white border-sky-400'
                        : isHellMode
                        ? 'bg-gradient-to-br from-red-600 to-purple-800 text-white border-red-400'
                        : 'bg-gradient-to-br from-amber-500 to-yellow-400 text-amber-950 border-white'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 text-xs sm:text-sm font-medium leading-relaxed border shadow-sm ${
                      isUser
                        ? isHellMode
                          ? 'bg-gradient-to-br from-rose-900 to-purple-900 text-white border-rose-700/60 rounded-tr-xs'
                          : 'bg-gradient-to-br from-sky-600 to-blue-600 text-white border-sky-500 rounded-tr-xs'
                        : isHellMode
                        ? 'bg-[#1e0524] text-purple-100 border-red-900/60 rounded-tl-xs'
                        : 'bg-white text-slate-800 border-slate-200/90 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {/* Clean Conversational Content without huge dumped code blocks */}
                    {renderCleanMessage(msg.content, isHellMode)}

                    {/* Dedicated Compact Action Card for Generated Directives */}
                    {codeBlocks.map((block, bIdx) => {
                      const blockId = `${msg.id}-block-${bIdx}`;
                      const isCopied = copiedBlockIndex === blockId;
                      const isExpanded = Boolean(expandedPreviewIds[blockId]);

                      return (
                        <div
                          key={bIdx}
                          className="mt-3 sm:mt-3.5 rounded-xl sm:rounded-2xl border-2 border-amber-400/90 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 overflow-hidden shadow-xl"
                        >
                          {/* Card Top Header */}
                          <div className="px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-b border-amber-500/40 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCode2 className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-[11px] sm:text-xs font-black text-amber-300 truncate">
                                {block.title}
                              </span>
                              <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                                {block.archetype}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {block.code.length} ký tự
                            </span>
                          </div>

                          {/* Action Info & Big Copy Button */}
                          <div className="p-3.5 sm:p-4.5 bg-slate-900/90 space-y-3 flex flex-col items-center justify-center text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center w-full">
                              <span className="text-[11px] sm:text-xs text-amber-200/95 font-bold flex items-center justify-center gap-1.5 text-center">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                                <span>Lệnh chuẩn 7 khối đã sẵn sàng! Bấm sao chép vào bộ nhớ đệm:</span>
                              </span>

                              {/* Toggle Accordion for Previewing Code */}
                              <button
                                type="button"
                                onClick={() => togglePreview(blockId)}
                                className="text-[10px] text-amber-300/80 hover:text-amber-200 flex items-center justify-center gap-1 font-bold underline cursor-pointer shrink-0 transition-colors"
                              >
                                <span>{isExpanded ? 'Ẩn cú pháp' : 'Xem trước cú pháp'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>

                            {/* Centered Prominent Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(block.code, blockId)}
                              className={`w-full max-w-lg py-2.5 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center text-center gap-2.5 border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                                isCopied
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-white/70 shadow-[0_4px_18px_rgba(245,158,11,0.55)]'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3] animate-bounce shrink-0" />
                                  <span className="text-center">✓ Đã sao chép vào bộ nhớ đệm (Clipboard)!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 stroke-[2.5] shrink-0" />
                                  <span className="text-center">Sao Chép Lệnh Vào Bộ Nhớ Đệm</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Optional Collapsible Code Box (Closed by default so chat is ultra concise) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-slate-800 bg-slate-950 p-3 sm:p-4 max-h-60 overflow-y-auto custom-scrollbar font-mono text-[10.5px] sm:text-xs leading-relaxed text-amber-100/90 select-text"
                              >
                                <pre className="whitespace-pre-wrap break-words">{block.code}</pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border animate-pulse ${
                    isHellMode
                      ? 'bg-red-800 text-white border-red-500'
                      : 'bg-amber-400 text-amber-950 border-amber-300'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
                    isHellMode
                      ? 'bg-[#18031e] text-purple-200 border-red-900/60'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>AI đang phân tích ý tưởng & xây dựng lệnh chuẩn 7 khối...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. INPUT PROMPT FORM */}
          <div
            className={`p-3 sm:p-4 border-t shrink-0 ${
              isHellMode ? 'bg-[#140217] border-red-900/60' : 'bg-white border-slate-200/90'
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 sm:gap-3"
            >
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Mô tả lệnh bạn muốn tạo hoặc yêu cầu chỉnh sửa (VD: Lệnh chống AI tự nói hộ user, lệnh Mafia AU...)"
                  className={`w-full p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none border-2 resize-none transition-all ${
                    isHellMode
                      ? 'bg-black/60 text-white placeholder-purple-300/40 border-red-900/70 focus:border-red-500'
                      : 'bg-slate-50 text-slate-800 placeholder-slate-400 border-slate-200 focus:border-sky-400'
                  }`}
                />
                <div className="absolute right-2.5 bottom-2 text-[10px] text-slate-400 font-bold hidden sm:block">
                  Shift+Enter để xuống dòng
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className={`p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isHellMode
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-purple-700 text-white border-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                    : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 text-white border-sky-300 hover:shadow-[0_6px_20px_rgba(2,132,199,0.4)]'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi Lệnh</span>
              </button>
            </form>

            {/* Note below input */}
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center justify-between px-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Nút Sao Chép sẽ copy lệnh vào bộ nhớ đệm thiết bị của bạn (Clipboard).</span>
              </span>
              <span className="hidden md:inline text-slate-400 italic">
                Tuân thủ 100% Khung Sườn 7 Khối Chuyên Nghiệp
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
