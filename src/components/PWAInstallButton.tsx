import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playUiClick } from '../utils/audio';

interface PWAInstallButtonProps {
  isHellMode?: boolean;
  soundEnabled?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  isHellMode = false,
  soundEnabled = true,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    playUiClick(soundEnabled);
    await install();
  };

  const handleIOSClick = () => {
    playUiClick(soundEnabled);
    setShowIOSGuide(true);
  };

  return (
    <>
      {isInstallable && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Cài đặt Ổ Nghiện Roblox về màn hình chính (Dùng mượt & Offline)"
          className={`group relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border shadow-md cursor-pointer active:scale-95 transition-all shrink-0 ${
            isHellMode
              ? 'bg-gradient-to-r from-purple-700 via-red-600 to-amber-600 hover:from-purple-600 hover:to-amber-500 text-white border-red-400/60 shadow-[0_0_12px_rgba(220,38,38,0.5)]'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white border-white/60 shadow-[0_2px_10px_rgba(16,185,129,0.4)]'
          }`}
        >
          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] animate-bounce" />
          <span className="whitespace-nowrap">Cài App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          type="button"
          onClick={handleIOSClick}
          title="Hướng dẫn cài đặt ứng dụng trên iPhone/iPad"
          className={`group relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs border shadow-sm cursor-pointer active:scale-95 transition-all shrink-0 ${
            isHellMode
              ? 'bg-red-950/70 hover:bg-red-900/80 text-purple-200 border-red-600/40'
              : 'bg-white/20 hover:bg-white/30 text-white border-white/40'
          }`}
        >
          <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="whitespace-nowrap">Cài iOS</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-sky-400/50 p-6 text-white shadow-2xl">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 flex items-center justify-center shadow-lg">
                <img src="/pwa-192x192.png" alt="App Icon" className="w-full h-full rounded-[14px] object-cover" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Cài đặt trên iPhone / iPad</h3>
                <p className="text-xs text-sky-200">Chơi mượt & không lo mất mạng</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-800/80 p-4 border border-white/10 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-black text-xs">
                  1
                </div>
                <p className="text-slate-200">
                  Bấm vào nút <strong>Chia sẻ (Share)</strong> <Share2 className="inline w-3.5 h-3.5 text-sky-400 mx-1" /> ở thanh dưới trình duyệt Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 font-black text-xs">
                  2
                </div>
                <p className="text-slate-200">
                  Cuộn xuống chọn <strong>Thêm vào MH chính</strong> <PlusSquare className="inline w-3.5 h-3.5 text-emerald-400 mx-1" /> (Add to Home Screen).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-md active:scale-95 transition cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
