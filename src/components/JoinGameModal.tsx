import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ExternalLink, Copy, Check, X, UserCheck, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import avatarMemeImg from '../assets/images/maruko_roblox_head_1787049027788.jpg';

interface RPCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  link: string;
  avatarUrl?: string;
  badge?: string;
}

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onPlayClickSound: () => void;
  onPlayVictorySound: () => void;
}

const INITIAL_CHARACTERS: RPCharacter[] = [
  {
    id: '1',
    name: 'Mộng Chè',
    role: 'Nữ hoàng Roblox Kid 👑',
    description: 'Mình là cục cưng, gu Thế Trí 🫦. Luôn sẵn sàng quẩy RP muôn nơi!',
    link: 'https://www.roblox.com/users/profile',
    badge: 'Cục cưng',
  },
  {
    id: '2',
    name: 'Thế Trí',
    role: 'Gu Mộng Chè 💖',
    description: 'Nhân vật RP song hành cùng Mộng Chè trong mọi cốt truyện.',
    link: 'https://www.roblox.com/users/profile',
    badge: 'Chân ái',
  },
];

export const JoinGameModal: React.FC<JoinGameModalProps> = ({
  isOpen,
  onClose,
  soundEnabled: _soundEnabled,
  onPlayClickSound,
  onPlayVictorySound,
}) => {
  const [characters, setCharacters] = useState<RPCharacter[]>(INITIAL_CHARACTERS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLink, setNewLink] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      onPlayVictorySound();
    }
  }, [isOpen, onPlayVictorySound]);

  const handleCopy = (id: string, link: string) => {
    onPlayClickSound();
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLink.trim()) return;
    onPlayClickSound();

    const newChar: RPCharacter = {
      id: Date.now().toString(),
      name: newName.trim(),
      role: newRole.trim() || 'Nhân vật RP',
      description: 'Nhân vật RP mới được thêm vào danh sách.',
      link: newLink.trim().startsWith('http') ? newLink.trim() : `https://${newLink.trim()}`,
      badge: 'Mới',
    };

    setCharacters((prev) => [newChar, ...prev]);
    setNewName('');
    setNewRole('');
    setNewLink('');
    setShowAddForm(false);
    confetti({ particleCount: 30 });
  };

  const handleDelete = (id: string) => {
    onPlayClickSound();
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-dessert">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border-4 border-emerald-500 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden text-white"
      >
        {/* Background ambient glow with zero-blur radial gradients */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.22)_0%,_transparent_70%)] pointer-events-none transform-gpu" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[radial-gradient(circle,_rgba(234,179,8,0.18)_0%,_transparent_70%)] pointer-events-none transform-gpu" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Danh Sách Nhân Vật RP
              </h2>
              <p className="text-emerald-300 text-xs sm:text-sm">
                Chào mừng bạn đến với hội RP Roblox Kid! ✨
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onPlayClickSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Character List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3 relative z-10">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-3.5 sm:p-4 transition-all shadow-md flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={avatarMemeImg}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                        {char.name}
                      </h3>
                      {char.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 border border-emerald-400/50 text-emerald-300">
                          {char.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{char.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(char.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                  title="Xóa nhân vật này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {char.description}
              </p>

              {/* Action Link & Copy */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={char.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onPlayClickSound}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Vào Xem Nhân Vật</span>
                </a>

                <button
                  onClick={() => handleCopy(char.id, char.link)}
                  className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors border border-slate-600"
                  title="Sao chép link nhân vật"
                >
                  {copiedId === char.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Add Character Form toggle */}
          {showAddForm ? (
            <form
              onSubmit={handleAddCharacter}
              className="bg-slate-800 border-2 border-dashed border-emerald-500/60 rounded-2xl p-4 space-y-3"
            >
              <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Đăng Link Nhân Vật Mới
              </h4>
              <div>
                <input
                  type="text"
                  placeholder="Tên nhân vật (ví dụ: Bé Mộng, Thế Trí...)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Vai trò / Danh hiệu (ví dụ: Roblox Kid, Bestie...)"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <input
                  type="url"
                  placeholder="Dán link nhân vật Roblox (https://roblox.com/...)"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Lưu Nhân Vật
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                onPlayClickSound();
                setShowAddForm(true);
              }}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-400/80 text-slate-400 hover:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-slate-800/40 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              <span>+ Đăng Thêm Link Nhân Vật RP</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end relative z-10">
          <button
            onClick={() => {
              onPlayClickSound();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm border border-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};

