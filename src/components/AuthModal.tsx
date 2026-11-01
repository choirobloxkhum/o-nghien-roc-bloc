import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Flame,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playUiClick } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
  isHellModePrompt?: boolean;
  soundEnabled?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  isHellModePrompt = false,
  soundEnabled = true,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, formatAuthError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleTabSwitch = (newMode: 'login' | 'register') => {
    playUiClick(soundEnabled);
    setMode(newMode);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);
    setSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    playUiClick(soundEnabled);
    setIsGoogleSubmitting(true);
    setErrorMessage(null);
    setIsUnauthorizedDomain(false);
    try {
      await signInWithGoogle();
      setSuccessMessage('Đăng nhập với Google thành công! 🎉');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
      }
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleCopyHostname = () => {
    if (!currentHostname) return;
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick(soundEnabled);
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email!');
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu!');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setErrorMessage('Mật khẩu đăng ký phải có tối thiểu 6 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(trimmedEmail, password);
        setSuccessMessage('Đăng nhập thành công! Chào mừng bạn trở lại ✨');
      } else {
        await signUpWithEmail(trimmedEmail, password, displayName);
        setSuccessMessage('Tạo tài khoản thành công! 🎉');
      }
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#181d24] via-[#12161c] to-[#0c0e12] rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)] border-2 border-sky-400/50 text-white overflow-hidden"
        >
          {/* Top Decorative Rim */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500" />

          {/* Close button */}
          <button
            onClick={() => {
              playUiClick(soundEnabled);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            {isHellModePrompt ? (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 p-0.5 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.6)] border border-red-300">
                <div className="w-full h-full bg-black/70 rounded-[14px] flex items-center justify-center">
                  <Flame className="w-7 h-7 text-amber-300 fill-amber-400 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 mb-3 shadow-[0_0_20px_rgba(56,189,248,0.5)] border border-sky-200">
                <div className="w-full h-full bg-sky-950/80 rounded-[14px] flex items-center justify-center">
                  <UserIcon className="w-7 h-7 text-sky-300" />
                </div>
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
            </h3>

            {isHellModePrompt && (
              <div className="mt-2.5 p-3 rounded-2xl bg-red-950/40 border border-red-700/60 text-left flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 font-medium leading-relaxed">
                  <strong className="text-amber-300 font-bold">Chế độ Địa Ngục 18+</strong> chỉ dành riêng cho người dùng đã có tài khoản. Vui lòng đăng nhập hoặc đăng ký để tiếp tục!
                </p>
              </div>
            )}
          </div>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            disabled={isGoogleSubmitting || isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all mb-4 disabled:opacity-50"
          >
            {isGoogleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 10.03 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Tiếp tục với Google</span>
          </button>

          {/* Diagnostic helper if unauthorized domain */}
          {isUnauthorizedDomain && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-950/50 border border-amber-500/60 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 font-black text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Google OAuth chưa nhận diện tên miền này:</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/60 border border-amber-400/30 text-[11px] font-mono">
                <span className="truncate text-white">{currentHostname || 'ais-dev-...'}</span>
                <button
                  type="button"
                  onClick={handleCopyHostname}
                  className="ml-2 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed">
                Đảm bảo bạn đã thêm đúng tên miền trên vào <strong>Firebase Console</strong> của dự án <code>gen-lang-client-0387748439</code> (chỉ nhập tên miền, không kèm <code>https://</code> hay <code>/</code>).
              </p>
              {isInsideIframe && (
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-1.5 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer border border-amber-400/40 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở app ở Tab mới riêng biệt để thử lại</span>
                </button>
              )}
            </div>
          )}

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-white/15 w-full" />
            <span className="bg-[#12161c] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              hoặc Email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tên hiển thị / Biệt danh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="VD: Em Bé Roblox, Chìu Ông..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Địa chỉ Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nhapemail@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : mode === 'login' ? (
                <span>Đăng Nhập Ngay</span>
              ) : (
                <span>Đăng Ký Tài Khoản</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-4 text-center text-[11px] text-slate-400">
            {mode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className="text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className="text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
