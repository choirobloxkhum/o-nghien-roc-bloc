import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, Play, ChevronRight, Copy, Check } from 'lucide-react';
import { RPCharacter } from '../types';
import { playUiClick, playSparkleSound } from '../utils/audio';
import { getCharacterSessionPassword } from '../utils/passwordGenerator';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: RPCharacter | null;
  soundEnabled: boolean;
  isHellMode?: boolean;
  onOpenCocKienTroi?: (char: RPCharacter) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  character,
  soundEnabled,
  isHellMode = false,
  onOpenCocKienTroi,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hintClicks, setHintClicks] = useState(0);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Reset state when opened with a new character
  React.useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setError('');
      setIsUnlocked(false);
      setHintClicks(0);
      setCopiedPassword(false);
    }
  }, [isOpen, character?.id]);

  if (!character) return null;

  const activePassword = character.hasDynamicPassword
    ? getCharacterSessionPassword(character.id, character.password)
    : character.password || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick(soundEnabled);
    if (passwordInput.toLowerCase().trim() === activePassword.toLowerCase().trim()) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Mật khẩu chưa đúng nha, nghĩ kỹ lại nè! ❌');
    }
  };

  const handlePlayReal = () => {
    playUiClick(soundEnabled);
    if (character.playUrl) {
      window.open(character.playUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md rounded-3xl overflow-hidden border-2 ${
              isHellMode 
                ? 'bg-gradient-to-b from-[#3f0f0f] to-black border-red-900 shadow-[0_10px_40px_rgba(220,38,38,0.3)]' 
                : 'bg-[#fffdf0] border-amber-200 shadow-[0_15px_40px_rgba(245,158,11,0.25)]'
            }`}
          >
            {/* Header */}
            <div className={`relative h-24 flex items-center justify-center ${
              isHellMode
                ? 'bg-gradient-to-r from-red-900 via-red-950 to-black'
                : 'bg-gradient-to-r from-amber-400 to-amber-600'
            }`}>
              <div className={`absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] ${
                isHellMode ? 'mix-blend-overlay' : ''
              }`} />
              <div className={`absolute -bottom-10 w-20 h-20 rounded-full border-4 shadow-lg overflow-hidden z-10 ${
                isHellMode ? 'border-black bg-black' : 'border-white bg-white'
              }`}>
                <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={onClose}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-20 ${
                  isHellMode ? 'bg-black/20 text-white hover:bg-black/40' : 'bg-white/30 text-amber-950 hover:bg-white/50'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="pt-14 pb-8 px-6 text-center">
              <h3 className={`text-xl font-black mb-1 ${isHellMode ? 'text-red-50' : 'text-stone-800'}`}>
                {character.name}
              </h3>
              <p className={`text-sm font-medium mb-6 ${isHellMode ? 'text-red-400/80' : 'text-stone-500'}`}>
                Khu vực riêng tư - Yêu cầu mật khẩu
              </p>

              {!isUnlocked ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {character.passwordHint && (
                    <div className={`rounded-xl p-3 text-sm border shadow-sm text-left relative mt-4 ${
                      isHellMode 
                        ? 'bg-red-950/40 border-red-900/60 text-red-200' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className={`absolute -top-3 left-4 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isHellMode
                          ? 'bg-red-900 text-red-100'
                          : 'bg-amber-400 text-amber-950'
                      }`}>
                        Gợi ý
                      </div>

                      {character.passwordHint.toLowerCase().includes('nhấp anh mười đêm') ? (
                        <div>
                          <p className="font-semibold mb-1 mt-1">
                            Nhấp{' '}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                playUiClick(soundEnabled);
                                const nextClicks = hintClicks + 1;
                                setHintClicks(nextClicks);
                                if (nextClicks === 10) {
                                  playSparkleSound(soundEnabled);
                                }
                              }}
                              className="cursor-pointer select-none"
                            >
                              anh
                            </span>{' '}
                            mười đêm
                          </p>

                          {/* Secret password reveal after 10 clicks */}
                          {hintClicks >= 10 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              className={`mt-2.5 p-3 rounded-xl border flex items-center justify-between gap-2 ${
                                isHellMode
                                  ? 'bg-red-950/80 border-red-500/60 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                                  : 'bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 border-amber-300 text-stone-900 shadow-xs'
                              }`}
                            >
                              <div className="flex flex-col text-left">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isHellMode ? 'text-red-300' : 'text-amber-900'}`}>
                                  ✨ Mật khẩu của anh nè:
                                </span>
                                <span className="text-base font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
                                  {activePassword}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  playUiClick(soundEnabled);
                                  if (activePassword) {
                                    navigator.clipboard.writeText(activePassword);
                                    setPasswordInput(activePassword);
                                    setCopiedPassword(true);
                                    setTimeout(() => setCopiedPassword(false), 2000);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5 ${
                                  copiedPassword
                                    ? 'bg-emerald-600 text-white'
                                    : isHellMode
                                    ? 'bg-red-800 hover:bg-red-700 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                }`}
                              >
                                {copiedPassword ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Đã copy & điền!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Pass</span>
                                  </>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold mb-1 mt-1">{character.passwordHint}</p>
                      )}

                      {(character.id === 'char-11-lucifer' || character.name.toLowerCase().includes('lucifer')) && (
                        <p className={`text-[11px] font-medium mt-1.5 pt-1.5 border-t italic ${
                          isHellMode
                            ? 'text-red-300/80 border-red-900/50'
                            : 'text-amber-800/80 border-amber-200'
                        }`}>
                          Password không viết hoa, không dấu, không cách
                        </p>
                      )}
                    </div>
                  )}

                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${isHellMode ? 'text-red-600/70' : 'text-stone-400'}`} />
                    </div>
                    <input
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl leading-5 transition-all font-medium focus:outline-none focus:ring-4 ${
                        isHellMode
                          ? 'bg-black/40 border-red-900/50 text-red-100 placeholder-red-800 focus:ring-red-900/40 focus:border-red-700'
                          : 'bg-white border-amber-300 text-stone-900 placeholder-stone-400 focus:ring-amber-500/30 focus:border-orange-400 shadow-inner'
                      }`}
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-bold ${isHellMode ? 'text-red-500' : 'text-red-500'}`}
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all ${
                      isHellMode
                        ? 'bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-red-50 border border-red-800/50 shadow-[0_4px_15px_rgba(153,27,27,0.3)] active:scale-95'
                        : 'bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-[0_4px_0_rgb(234,88,12)] active:translate-y-1 active:shadow-[0_0px_0_rgb(234,88,12)]'
                    }`}
                  >
                    <span>Mở khóa</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Nút Đánh Trống Kiện Trời xin gợi ý pass */}
                  <button
                    type="button"
                    onClick={() => {
                      playUiClick(soundEnabled);
                      onClose();
                      onOpenCocKienTroi?.(character);
                    }}
                    className={`w-full mt-2 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isHellMode
                        ? 'bg-red-950/60 hover:bg-red-900/80 text-red-200 border-red-800/60 font-bold text-xs'
                        : 'bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-950 border-amber-300 font-black text-xs shadow-xs'
                    }`}
                  >
                    <span className="text-base">🐸🥁</span>
                    <span>Không biết pass? Đánh Trống Kiện Trời Xin Gợi Ý!</span>
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner border-2 ${
                      isHellMode
                        ? 'bg-red-950/60 text-red-500 border-red-900/50'
                        : 'bg-green-100 text-green-500 border-green-200'
                    }`}>
                      <Unlock className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1.5">
                    <h4 className={`text-lg font-bold ${isHellMode ? 'text-red-100' : 'text-stone-800'}`}>
                      Đã mở khóa thành công!
                    </h4>
                    <div className={`text-sm font-medium leading-relaxed ${isHellMode ? 'text-red-300/90' : 'text-stone-600'}`}>
                      <p>bé iu ích kỷ diếm link 1 mik chơi thui nhóee</p>
                      <p className="text-base font-semibold mt-1">ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePlayReal}
                    className={`w-full flex items-center justify-center gap-2 font-black py-4 px-4 rounded-xl transition-all ${
                      isHellMode
                        ? 'bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white shadow-red-900/40 border border-red-700/50 active:scale-95'
                        : 'bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-[0_0px_0_rgb(21,128,61)]'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>CHƠI NGAY</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
