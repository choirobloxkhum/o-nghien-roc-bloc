import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Sparkles, MessageCircle, RefreshCw, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { RPCharacter } from '../types';
import { fireConfetti } from '../utils/confettiHelper';

interface RPPlayModalProps {
  character: RPCharacter | null;
  hasVoted?: boolean;
  onClose: () => void;
  onDonateRobux: (characterId: string) => void;
}

export const RPPlayModal: React.FC<RPPlayModalProps> = ({
  character,
  hasVoted = false,
  onClose,
  onDonateRobux,
}) => {
  if (!character) return null;

  const [messages, setMessages] = useState<{ sender: 'npc' | 'user'; text: string }[]>([
    {
      sender: 'npc',
      text:
        character.sampleDialogue?.[0] ||
        `Chào em! Anh là ${character.name}. Hôm nay em muốn cùng anh dạo quanh map nào trong Roblox?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    // Dynamic cute character response simulation
    setTimeout(() => {
      setIsTyping(false);
      const possibleReplies = [
        `"Em nói gì cũng đúng hết, chỉ cần em thích là anh chiều!" ✨`,
        `"Đi cẩn thận nào nhóc, nắm chặt tay anh kẻo lạc trong server." 🫂`,
        `"Vừa nãy anh đã thả thêm Robux vào tài khoản cho em rồi đấy, cứ sắm đồ thoải mái." 💳`,
        `"Ai dám ăn hiếp em trong game? Nói tên ra đây để anh xử đẹp!" ⚔️`,
        `"Chỉ cần ở bên em thì map nào cũng thành thiên đường hết." 💖`,
      ];
      const randomReply =
        possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
      setMessages((prev) => [...prev, { sender: 'npc', text: randomReply }]);
    }, 800);
  };

  const isReduced =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('reduced-motion-mode');

  const handleBurstConfetti = () => {
    if (hasVoted) return;
    onDonateRobux(character.id);
    fireConfetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md">
      <motion.div
        initial={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
        animate={isReduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={isReduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        transition={isReduced ? { duration: 0.1, ease: 'linear' } : { duration: 0.25 }}
        className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
      >
        {/* Header with Character Status */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/60 shadow-sm shrink-0">
              <img
                src={character.avatarUrl}
                alt={character.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_15%]"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  {character.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  {character.roleTag}
                </span>
              </div>
              <span className="text-sky-100 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang trực tuyến trong phòng RP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!hasVoted) {
                  handleBurstConfetti();
                }
                onDonateRobux(character.id);
              }}
              title={hasVoted ? 'Thiết bị này đã thả 1 Robux cho nhân vật này' : 'Tặng 1 Robux (+1 R$)'}
              className={`px-3 py-1.5 rounded-xl font-black text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-transform border-t border-white/40 border-b-2 ${
                hasVoted
                  ? 'bg-amber-200 text-amber-950 border-amber-300 opacity-90'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-105 active:scale-95 border-amber-600'
              }`}
            >
              <span>💰</span>
              <span>{character.robuxDonations} R$</span>
              {hasVoted ? (
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-black">Đã thả 1 R$</span>
              ) : (
                <span className="text-[10px] bg-amber-800 text-yellow-200 px-1 py-0.5 rounded-full font-black">+1 R$</span>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat / Interaction Log Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50">
          {/* Quick Scenario Alert */}
          <div className="p-3 rounded-2xl bg-sky-100/70 border border-sky-200 text-sky-900 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Kịch bản RP: </span>
              <span>{character.plotTitle || 'Buổi hẹn hò tại server Roblox'}</span>
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'npc' && (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-sky-200 shrink-0 mb-0.5 border border-sky-300">
                  <img
                    src={character.avatarUrl}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[center_15%]"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pl-10">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              <span>{character.name} đang soạn lời thoại...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Nói chuyện với ${character.name}...`}
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-sm font-medium border border-slate-200 focus:border-sky-500 outline-none transition-all"
          />

          <button
            onClick={handleSendMessage}
            className="w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
