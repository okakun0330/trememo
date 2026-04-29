'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const active = (p: string) => path === p ? '#00FF88' : '#444444';

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-30"
      style={{ background: 'linear-gradient(to top, #0D0D0D 80%, transparent)' }}>
      <div className="border-t border-[#1F1F1F] bg-[#0D0D0D] px-6 pb-8 pt-3 flex items-center justify-around">

        {/* ホーム */}
        <button onClick={() => router.push('/')}
          className="flex flex-col items-center gap-1 min-w-[44px]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M2 9.5L11 2l9 7.5V19a1 1 0 01-1 1H14v-5h-4v5H3a1 1 0 01-1-1V9.5z"
              stroke={active('/')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium" style={{ color: active('/') }}>ホーム</span>
        </button>

        {/* 記録 */}
        <button onClick={() => router.push('/history')}
          className="flex flex-col items-center gap-1 min-w-[44px]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="3" width="16" height="16" rx="2"
              stroke={active('/history')} strokeWidth="1.5" />
            <path d="M7 15l3-4 3 2 3-5"
              stroke={active('/history')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium" style={{ color: active('/history') }}>記録</span>
        </button>

        {/* ＋ center button */}
        <button onClick={() => router.push('/select')}
          className="w-14 h-14 rounded-full bg-[#00FF88] flex items-center justify-center -mt-5 glow-btn active:scale-95 transition-transform">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 4v14M4 11h14" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* グラフ（自己ベスト） */}
        <button onClick={() => router.push('/history?tab=pbs')}
          className="flex flex-col items-center gap-1 min-w-[44px]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 17l5-5 4 3 5-8 4 3"
              stroke={active('/history?tab=pbs')} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-medium" style={{ color: '#444' }}>グラフ</span>
        </button>

        {/* 設定 */}
        <button onClick={() => router.push('/settings')}
          className="flex flex-col items-center gap-1 min-w-[44px]">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3"
              stroke={active('/settings')} strokeWidth="1.5" />
            <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.9 4.9l1.4 1.4M15.7 15.7l1.4 1.4M4.9 17.1l1.4-1.4M15.7 6.3l1.4-1.4"
              stroke={active('/settings')} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-medium" style={{ color: active('/settings') }}>設定</span>
        </button>

      </div>
    </div>
  );
}
