import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Sparkles, Heart, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { playSparkleSound, playUiClick, playGachaRevealFanfare } from '../utils/audio';

const ngocHoangAvatar = 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg';

// 3 nhân vật mới nhất
const NEWEST_CHARACTERS = [
  {
    id: 'char-17-au-duong-nhat-si',
    name: 'Âu Dương Nhất Sĩ',
    avatarUrl: 'https://i.ibb.co/ccs4WQXR/Kh-ng-C-Ti-u-80.jpg',
    roleTag: 'Học đường',
    subTag: 'Sĩ diện x Thanh mai trúc mã',
    quote: 'Hình này là hình gì? Hình như cô ấy cũng thích mình...',
    badge: 'MỚI ✨',
  },
  {
    id: 'char-16-hoang-nhat-thien',
    name: 'Hoàng Nhất Thiên',
    avatarUrl: 'https://i.ibb.co/zjDNf5m/Kh-ng-C-Ti-u-65-20260919130152.jpg',
    roleTag: 'Hiện đại',
    subTag: 'Trai IT máu S • Sài Gòn',
    quote: 'Tôi phát hiện bạn gái ngoại tình với... Google AI Studio?',
    badge: 'MỚI ✨',
  },
  {
    id: 'char-15-seo-jihoon',
    name: 'Seo Jihoon',
    avatarUrl: 'https://i.ibb.co/XrJQzRnq/Kh-ng-C-Ti-u-4-20260908130049.png',
    roleTag: 'Học đường',
    subTag: '🦊 Cáo x 🐰 Thỏ',
    quote: 'Sau này nếu cậu muốn hôn. Thì hôn tôi cũng được.',
    badge: 'MỚI ✨',
  },
];

// 4 nhân vật cũ vừa được cập nhật prompt mới: xếp thứ tự Vô Trần, Kenji, Nolan, James
const UPDATED_PROMPT_CHARACTERS = [
  {
    id: 'char-8-votran',
    name: 'Tạ Vô Trần',
    avatarUrl: 'https://i.ibb.co/ynZJCxm4/media-1787359430-1.png',
    roleTag: 'Dân quốc • Ngược • BL',
    subTag: 'Char đã có vợ • Côn trùng • Yandere',
    quote: 'Em có biết một khi côn trùng tìm thấy bạn đời thì thế nào không?',
    badge: 'PROMPT MỚI 🌟',
  },
  {
    id: 'char-6-kenji',
    name: 'Kenji Aranaka',
    avatarUrl: 'https://i.ibb.co/391gm1bd/media-1787358159.png',
    roleTag: 'Thời Minh Trị • Sát thủ',
    subTag: 'Plot ẩn • Lạnh lùng x Trung thành',
    quote: 'Lưỡi kiếm này chỉ cúi đầu trước duy nhất một người.',
    badge: 'PROMPT MỚI 🌟',
  },
  {
    id: 'char-9-nolan',
    name: 'Nolan Wilson',
    avatarUrl: 'https://i.ibb.co/chj1SZBk/media-1787361799.png',
    roleTag: 'Hiện đại • Cotswolds',
    subTag: 'Char lừa dối • Khác biệt giai cấp',
    quote: 'Anh yêu em bằng tất cả những gì anh có - trừ sự thật.',
    badge: 'PROMPT MỚI 🌟',
  },
  {
    id: 'char-7-james',
    name: 'James Rodriguez',
    avatarUrl: 'https://i.ibb.co/B5v8wxGR/media-1787368652-1.png',
    roleTag: 'Hiện đại • Latino',
    subTag: 'Ngọt • Green flag • Đời thường',
    quote: 'Anh không cần em hoàn hảo, anh chỉ cần đó là em.',
    badge: 'PROMPT MỚI 🌟',
  },
];

interface NgocHoangImperialEdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterGame?: () => void;
  onSelectCharacter?: (characterId: string) => void;
  soundEnabled?: boolean;
}

export const NgocHoangImperialEdictModal: React.FC<NgocHoangImperialEdictModalProps> = ({
  isOpen,
  onClose,
  onEnterGame,
  onSelectCharacter,
  soundEnabled = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      playGachaRevealFanfare(soundEnabled);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const handleAction = () => {
    playSparkleSound(soundEnabled);
    if (onEnterGame) {
      onEnterGame();
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    playUiClick(soundEnabled);
    if (onEnterGame) {
      onEnterGame();
    } else {
      onClose();
    }
  };

  const handleSelectChar = (charId: string) => {
    playSparkleSound(soundEnabled);
    if (onSelectCharacter) {
      onSelectCharacter(charId);
    } else if (onEnterGame) {
      onEnterGame();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto font-dessert select-none">
        {/* Deep Mystical Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Ambient Floating Golden Celestial Sparkles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              animate={{
                y: ['100vh', '-10vh'],
                x: [0, (i % 2 === 0 ? 25 : -25) * ((i % 3) + 1)],
                opacity: [0, 0.9, 0],
                scale: [0.6, 1.3, 0.4],
              }}
              transition={{
                duration: 2.8 + (i % 4) * 0.6,
                repeat: Infinity,
                delay: (i * 0.2) % 2,
                ease: 'easeOut',
              }}
              className="absolute text-yellow-300 pointer-events-none"
              style={{ left: `${(i * 7.5 + 4) % 94}%` }}
            >
              <Sparkles className="w-4 h-4 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
            </motion.div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* MAIN IMPERIAL EDICT SCROLL (CUỘN CHIẾU CHỈ THIÊN ĐÌNH)                      */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 25 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative z-10 w-[92%] sm:w-full max-w-lg max-h-[82vh] sm:max-h-[86vh] flex flex-col rounded-2xl sm:rounded-[32px] bg-gradient-to-b from-[#fef3c7] via-[#fffbeb] to-[#fef3c7] border-[3px] sm:border-4 border-[#b45309] shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_35px_rgba(245,158,11,0.3)] overflow-hidden text-stone-900 my-auto"
        >
          {/* Top Imperial Scroll Roller Bar (Trục cuộn chiếu chỉ gấm hoàng gia) */}
          <div className="relative w-full h-7 sm:h-8 bg-gradient-to-r from-[#78350f] via-[#d97706] to-[#78350f] border-b-2 border-[#b45309] flex items-center justify-between px-2.5 sm:px-4 shrink-0 shadow-md">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-300 border border-amber-950 shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-950 opacity-80" />
            </div>

            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300 animate-pulse drop-shadow" />
              <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                THIÊN ĐÌNH SẮC CHỈ • CHƠI ROBLOX KHUM
              </span>
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300 animate-pulse drop-shadow" />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-950 opacity-80" />
              <span className="w-2 h-2 rounded-full bg-yellow-300 border border-amber-950 shadow-xs" />
            </div>
          </div>

          {/* Close button (top right) */}
          <button
            onClick={handleClose}
            className="absolute top-8 right-2 sm:top-9 sm:right-3.5 z-30 p-1 sm:p-1.5 rounded-full bg-amber-900/15 hover:bg-rose-500 hover:text-white text-amber-900 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Đóng chiếu chỉ"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Header Content with Avatar of Ngọc Hoàng */}
          <div className="pt-3 pb-1.5 px-3 sm:px-5 flex flex-col items-center text-center relative shrink-0">
            {/* Crowned Avatar */}
            <div className="relative group cursor-pointer mb-1.5" onClick={() => playSparkleSound(soundEnabled)}>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.5)] border-2 border-white transform group-hover:scale-105 transition-transform">
                <img
                  src={ngocHoangAvatar}
                  alt="Ngọc Hoàng Chơi Roblox Khum"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 p-0.5 rounded-full border border-yellow-200 shadow-md animate-bounce">
                <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-950" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                MỘNG CHÈ
              </div>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-xl md:text-2xl font-black text-amber-950 tracking-tight leading-tight flex items-center justify-center gap-1">
              <span>👑 CHIẾU CHỈ TỪ NGỌC HOÀNG 📜</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-800 font-bold mt-0.5 flex items-center gap-1">
              <span>✨ Bản Tin Cập Nhật Phụng Thiên Thừa Vận ✨</span>
            </p>
          </div>

          {/* Golden Divider */}
          <div className="w-full px-5 py-0.5 flex items-center justify-center gap-2 shrink-0 opacity-70">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-600 to-amber-800" />
            <Sparkles className="w-3 h-3 text-amber-700 fill-amber-600" />
            <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-600 to-amber-800" />
          </div>

          {/* ========================================================================= */}
          {/* SCROLLABLE EDICT BODY (Chứa 2 phần nội dung như yêu cầu)                   */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto px-2.5 sm:px-5 py-2.5 sm:py-3 space-y-3 sm:space-y-3.5 text-left custom-scrollbar">
            {/* ----------------------------------------------------------------------- */}
            {/* PHẦN 1: CÂU HỎI & 3 CHỒNG MỚI NHẤT                                      */}
            {/* ----------------------------------------------------------------------- */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-100/90 to-yellow-50/90 border-2 border-amber-300 shadow-sm relative overflow-hidden">
              {/* Background watermark icon */}
              <Crown className="absolute -bottom-4 -right-4 w-24 h-24 text-amber-200/40 pointer-events-none" />

              {/* Lời mở đầu quan trọng */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-rose-700 tracking-tight leading-snug">
                  &ldquo;Các em bé đã thử chồng mới chưa?&rdquo; 💖✨
                </h3>
              </div>

              <p className="text-[11px] sm:text-xs text-stone-700 font-medium mb-2.5">
                Ngọc Hoàng vừa cho ra mắt 3 gương mặt cực phẩm mới toanh, diện mạo xuất chúng và cốt truyện siêu cuốn hút:
              </p>

              {/* Danh sách 3 nhân vật mới nhất có ký hiệu MỚI */}
              <div className="space-y-2">
                {NEWEST_CHARACTERS.map((char, idx) => (
                  <div
                    key={char.id}
                    onClick={() => handleSelectChar(char.id)}
                    className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl bg-white/90 hover:bg-white border border-amber-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                    title={`Bấm để tới vị trí của ${char.name} trong trang`}
                  >
                    {/* Character Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover border-2 border-amber-300 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -top-1 -left-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center border border-white shadow-xs">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Character Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                          {char.name}
                        </span>
                        {/* Ký hiệu MỚI theo yêu cầu */}
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          {char.badge}
                        </span>
                      </div>

                      <div className="text-[9.5px] sm:text-[10.5px] font-bold text-amber-800">
                        {char.subTag}
                      </div>

                      <div className="text-[9.5px] sm:text-[10.5px] text-stone-600 italic truncate mt-0.5">
                        &ldquo;{char.quote}&rdquo;
                      </div>
                    </div>

                    {/* Quick direct indicator arrow */}
                    <div className="shrink-0 px-1.5 sm:px-2 py-1 rounded-lg bg-amber-100/80 group-hover:bg-amber-500 text-amber-800 group-hover:text-white transition-all text-[9.5px] sm:text-[10px] font-black flex items-center gap-0.5">
                      <span className="hidden sm:inline">Ghé xem</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hint scroll down indicator */}
            <div className="flex items-center justify-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-amber-700 py-0.5 animate-pulse">
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              <span>Kéo xuống xem thêm cập nhật quan trọng từ Mẹ</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </div>

            {/* ----------------------------------------------------------------------- */}
            {/* PHẦN 2: THÔNG BÁO KHI KÉO XUỐNG VỀ 4 CHỒNG CŨ CẬP NHẬT PROMPT           */}
            {/* ----------------------------------------------------------------------- */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-300 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
                <h3 className="text-xs sm:text-sm font-black text-rose-800 uppercase tracking-wide">
                  💌 LỜI NHẮN NHỦ TỪ MẸ MỘNG CHÈ:
                </h3>
              </div>

              {/* Thông báo nguyên văn theo yêu cầu người dùng */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/95 border border-rose-200 shadow-inner mb-2.5">
                <p className="text-xs sm:text-[13px] font-black text-rose-950 leading-relaxed">
                  &ldquo;Các chồng Nolan, Vô Trần, James và Kenji đã được mẹ update prompt mới để cải thiện chất lượng. Ghé mấy chồng cũ một xí nhé &lt;33&rdquo;
                </p>
              </div>

              {/* Danh sách 4 nhân vật: xếp dọc xuống cả 4 nhân vật giống hệt bố cục của 3 nhân vật mới */}
              <div className="space-y-2">
                {UPDATED_PROMPT_CHARACTERS.map((char, idx) => (
                  <div
                    key={char.id}
                    onClick={() => handleSelectChar(char.id)}
                    className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl bg-white/90 hover:bg-white border border-rose-200/90 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                    title={`Bấm để tới vị trí của ${char.name} trong trang`}
                  >
                    {/* Character Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover border-2 border-rose-300 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -top-1 -left-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-white shadow-xs">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Character Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-rose-700 transition-colors truncate">
                          {char.name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          {char.badge}
                        </span>
                      </div>

                      <div className="text-[9.5px] sm:text-[10.5px] font-bold text-rose-800">
                        {char.subTag}
                      </div>

                      <div className="text-[9.5px] sm:text-[10.5px] text-stone-600 italic truncate mt-0.5">
                        &ldquo;{char.quote}&rdquo;
                      </div>
                    </div>

                    {/* Quick direct indicator arrow */}
                    <div className="shrink-0 px-1.5 sm:px-2 py-1 rounded-lg bg-rose-100/80 group-hover:bg-rose-500 text-rose-800 group-hover:text-white transition-all text-[9.5px] sm:text-[10px] font-black flex items-center gap-0.5">
                      <span className="hidden sm:inline">Ghé xem</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Triện đỏ hoàng gia (Imperial Seal) */}
            <div className="flex items-center justify-between pt-1 pb-0.5 px-1 text-stone-700">
              <div className="text-[9.5px] sm:text-xs font-bold italic">
                * Khâm thử! Chiếu truyền khắp cõi Ổ Nghiện Roblox ✨
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-red-700 bg-red-600/10 text-red-700 flex flex-col items-center justify-center font-serif text-[8px] sm:text-[9px] font-black leading-tight rotate-3 shadow-xs shrink-0">
                <span>NGỌC HOÀNG</span>
                <span>CHÍ BẢO</span>
                <span>👑</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FOOTER ACTION BUTTON (Tuân chỉ Ngọc Hoàng)                                 */}
          {/* ========================================================================= */}
          <div className="p-2.5 sm:p-3.5 bg-gradient-to-t from-amber-100 to-amber-50 border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-center gap-2 shrink-0">
            <button
              onClick={handleAction}
              className="relative group w-full py-2.5 sm:py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-500 hover:from-amber-600 hover:via-rose-600 hover:to-yellow-600 text-white font-black text-sm sm:text-base shadow-[0_4px_15px_rgba(245,158,11,0.4)] border-2 border-white/60 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-200 text-white drop-shadow" />
              <span>Tuân chỉ Ngọc Hoàng</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
