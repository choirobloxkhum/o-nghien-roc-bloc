import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 py-2 text-xs font-black text-white shadow-2xl border-2 border-amber-300 animate-pulse select-none">
      <div className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5 text-amber-200" />
      </div>
      <div>
        <div className="leading-tight">Chế độ Ngoại tuyến (Offline)</div>
        <div className="text-[10px] text-amber-100 font-bold opacity-90 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>Đang chạy mượt bằng bộ nhớ đệm</span>
        </div>
      </div>
    </div>
  );
};
