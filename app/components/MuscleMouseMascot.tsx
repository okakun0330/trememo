import React from 'react';

interface Props {
  size?: number;
  /** 'full' = 通常ポーズ, 'small' = コンパクト版, 'celebrate' = お祝いポーズ */
  variant?: 'full' | 'small' | 'celebrate';
}

export default function MuscleMouseMascot({ size = 130, variant = 'full' }: Props) {
  const aspect = variant === 'celebrate' ? 120 / 120 : 110 / 130;
  const h = Math.round(size / aspect);

  if (variant === 'celebrate') {
    return (
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <radialGradient id="celGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF88" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#00FF88" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="bodyGrad" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F5E8D0"/>
            <stop offset="100%" stopColor="#D4A870"/>
          </radialGradient>
        </defs>
        {/* Glow bg */}
        <ellipse cx="60" cy="60" rx="55" ry="55" fill="url(#celGlow)"/>
        {/* Left ear */}
        <ellipse cx="24" cy="22" rx="16" ry="16" fill="#C8A070"/>
        <ellipse cx="24" cy="22" rx="10" ry="10" fill="#F9AABB"/>
        {/* Right ear */}
        <ellipse cx="96" cy="22" rx="16" ry="16" fill="#C8A070"/>
        <ellipse cx="96" cy="22" rx="10" ry="10" fill="#F9AABB"/>
        {/* Head */}
        <ellipse cx="60" cy="50" rx="31" ry="29" fill="url(#bodyGrad)"/>
        {/* Headband */}
        <path d="M30 38 Q60 30 90 38 Q90 44 60 37 Q30 44 30 38Z" fill="#00FF88"/>
        <text x="49" y="43" fontSize="6" fontWeight="bold" fill="#006633" fontFamily="sans-serif">GYM</text>
        {/* Eyes - happy/closed */}
        <path d="M43 50 Q47 46 51 50" stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M69 50 Q73 46 77 50" stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Cheek */}
        <ellipse cx="36" cy="57" rx="6" ry="4" fill="#FF9999" opacity="0.7"/>
        <ellipse cx="84" cy="57" rx="6" ry="4" fill="#FF9999" opacity="0.7"/>
        {/* Nose */}
        <ellipse cx="60" cy="58" rx="4" ry="3" fill="#FF9999"/>
        {/* Big smile */}
        <path d="M46 65 Q60 76 74 65" stroke="#8B5A2B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="54" y="65" width="5" height="5" rx="1.5" fill="white"/>
        <rect x="61" y="65" width="5" height="5" rx="1.5" fill="white"/>
        {/* Body */}
        <ellipse cx="60" cy="97" rx="22" ry="20" fill="url(#bodyGrad)"/>
        {/* Black tank top */}
        <ellipse cx="60" cy="97" rx="18" ry="17" fill="#111111" opacity="0.85"/>
        <path d="M44 84 Q60 80 76 84" stroke="#00FF88" strokeWidth="1.5" fill="none"/>
        {/* Arms raised celebrate */}
        <ellipse cx="28" cy="78" rx="9" ry="16" fill="url(#bodyGrad)" transform="rotate(-45 28 78)"/>
        <ellipse cx="20" cy="62" rx="10" ry="7.5" fill="#D4A870"/>
        <ellipse cx="25" cy="51" rx="8" ry="10" fill="url(#bodyGrad)" transform="rotate(15 25 51)"/>
        <ellipse cx="92" cy="78" rx="9" ry="16" fill="url(#bodyGrad)" transform="rotate(45 92 78)"/>
        <ellipse cx="100" cy="62" rx="10" ry="7.5" fill="#D4A870"/>
        <ellipse cx="95" cy="51" rx="8" ry="10" fill="url(#bodyGrad)" transform="rotate(-15 95 51)"/>
        {/* Sparkles */}
        <text x="5"  y="45" fontSize="13" fill="#00FF88">✦</text>
        <text x="98" y="45" fontSize="13" fill="#00FF88">✦</text>
        <text x="12" y="28" fontSize="9"  fill="#FFD700">★</text>
        <text x="97" y="28" fontSize="9"  fill="#FFD700">★</text>
        <text x="2"  y="68" fontSize="7"  fill="#00FF88" opacity="0.7">✦</text>
        <text x="108" y="68" fontSize="7" fill="#00FF88" opacity="0.7">✦</text>
        {/* Shadow */}
        <ellipse cx="60" cy="118" rx="22" ry="4" fill="#000" opacity="0.3"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 110 130" width={size} height={h}>
      <defs>
        <radialGradient id="skinGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E0C0"/>
          <stop offset="100%" stopColor="#D4A870"/>
        </radialGradient>
        <radialGradient id="musGrad" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#ECC898"/>
          <stop offset="100%" stopColor="#C8965A"/>
        </radialGradient>
        <radialGradient id="glowRad" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#00FF88" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#00FF88" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Green ambient glow */}
      <ellipse cx="55" cy="115" rx="48" ry="20" fill="url(#glowRad)"/>

      {/* Shadow */}
      <ellipse cx="55" cy="128" rx="26" ry="4" fill="#000" opacity="0.4"/>

      {/* ── EARS ── */}
      <ellipse cx="23" cy="21" rx="16" ry="16" fill="#C8A070"/>
      <ellipse cx="23" cy="21" rx="10" ry="10" fill="#F9AABB"/>
      <ellipse cx="87" cy="21" rx="16" ry="16" fill="#C8A070"/>
      <ellipse cx="87" cy="21" rx="10" ry="10" fill="#F9AABB"/>

      {/* ── HEAD ── */}
      <ellipse cx="55" cy="48" rx="31" ry="29" fill="url(#skinGrad)"/>
      {/* Jaw shadow */}
      <ellipse cx="55" cy="62" rx="18" ry="8" fill="#C89060" opacity="0.3"/>

      {/* ── HEADBAND ── */}
      <path d="M26 36 Q55 27 84 36 Q84 43 55 35 Q26 43 26 36Z" fill="#00FF88"/>
      <text x="43" y="41" fontSize="7" fontWeight="900" fill="#005522" fontFamily="sans-serif" letterSpacing="1">GYM</text>

      {/* ── EYES ── */}
      {/* Left */}
      <circle cx="42" cy="47" r="8"   fill="white"/>
      <circle cx="43" cy="48.5" r="6" fill="#1A0800"/>
      <circle cx="45" cy="46" r="2.2" fill="white"/>
      <circle cx="42" cy="51" r="1.2" fill="white" opacity="0.5"/>
      {/* Right */}
      <circle cx="68" cy="47" r="8"   fill="white"/>
      <circle cx="69" cy="48.5" r="6" fill="#1A0800"/>
      <circle cx="71" cy="46" r="2.2" fill="white"/>
      <circle cx="68" cy="51" r="1.2" fill="white" opacity="0.5"/>

      {/* Brows */}
      <path d="M36 41 Q42 38 48 40" stroke="#8B5A2B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M62 40 Q68 38 74 41" stroke="#8B5A2B" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* ── BLUSH ── */}
      <ellipse cx="31" cy="56" rx="7" ry="5" fill="#FF9999" opacity="0.6"/>
      <ellipse cx="79" cy="56" rx="7" ry="5" fill="#FF9999" opacity="0.6"/>

      {/* ── NOSE ── */}
      <ellipse cx="55" cy="58" rx="4.5" ry="3.5" fill="#FF9999"/>
      <ellipse cx="54" cy="57" rx="1.5" ry="1" fill="white" opacity="0.5"/>

      {/* ── MOUTH ── */}
      <path d="M46 65 Q55 73 64 65" stroke="#8B5A2B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <rect x="51" y="65" width="4.5" height="5" rx="1.5" fill="white"/>
      <rect x="56.5" y="65" width="4.5" height="5" rx="1.5" fill="white"/>

      {/* ── WHISKERS ── */}
      <line x1="57" y1="58" x2="76" y2="53" stroke="#C4A070" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="57" y1="61" x2="77" y2="61" stroke="#C4A070" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="53" y1="58" x2="34" y2="53" stroke="#C4A070" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="53" y1="61" x2="33" y2="61" stroke="#C4A070" strokeWidth="1.3" strokeLinecap="round"/>

      {/* ── NECK ── */}
      <rect x="49" y="74" width="12" height="8" rx="5" fill="#D4A870"/>

      {/* ── BODY ── */}
      <ellipse cx="55" cy="101" rx="23" ry="23" fill="url(#skinGrad)"/>
      {/* Black tank top */}
      <ellipse cx="55" cy="103" rx="19" ry="19" fill="#111111"/>
      {/* Tank top collar */}
      <path d="M44 84 Q55 80 66 84" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Tank top lime stripe */}
      <path d="M44 84 Q55 80 66 84" stroke="#00FF88" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Muscle lines visible at sides */}
      <path d="M34 90 Q38 98 36 106" stroke="#C8965A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M76 90 Q72 98 74 106" stroke="#C8965A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ── LEFT ARM (raised flex) ── */}
      <ellipse cx="27" cy="86" rx="10" ry="16" fill="url(#skinGrad)" transform="rotate(-38 27 86)"/>
      {/* Bicep peak */}
      <ellipse cx="18" cy="71" rx="12" ry="9" fill="url(#musGrad)"/>
      <path d="M10 72 Q18 62 27 70" stroke="#C8965A" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Forearm */}
      <ellipse cx="23" cy="58" rx="8" ry="12" fill="url(#skinGrad)" transform="rotate(12 23 58)"/>
      <ellipse cx="23" cy="48" rx="7" ry="6" fill="url(#musGrad)"/>

      {/* ── RIGHT ARM (raised flex) ── */}
      <ellipse cx="83" cy="86" rx="10" ry="16" fill="url(#skinGrad)" transform="rotate(38 83 86)"/>
      <ellipse cx="92" cy="71" rx="12" ry="9" fill="url(#musGrad)"/>
      <path d="M100 72 Q92 62 83 70" stroke="#C8965A" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <ellipse cx="87" cy="58" rx="8" ry="12" fill="url(#skinGrad)" transform="rotate(-12 87 58)"/>
      <ellipse cx="87" cy="48" rx="7" ry="6" fill="url(#musGrad)"/>

      {/* ── SHORTS ── */}
      <path d="M33 113 Q36 124 49 122 Q55 120 61 122 Q74 124 77 113Z" fill="#00FF88"/>
      <line x1="55" y1="113" x2="55" y2="122" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>

      {/* ── LEGS ── */}
      <ellipse cx="42" cy="122" rx="11" ry="7" fill="url(#skinGrad)"/>
      <ellipse cx="68" cy="122" rx="11" ry="7" fill="url(#skinGrad)"/>

      {/* ── SHOES ── */}
      <ellipse cx="40" cy="128" rx="14" ry="5.5" fill="#00CC66"/>
      <ellipse cx="70" cy="128" rx="14" ry="5.5" fill="#00CC66"/>
      <ellipse cx="36" cy="126" rx="5" ry="2" fill="rgba(255,255,255,0.3)"/>
      <ellipse cx="66" cy="126" rx="5" ry="2" fill="rgba(255,255,255,0.3)"/>

      {/* ── TAIL ── */}
      <path d="M76 110 Q90 116 86 124" stroke="#D4A870" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

      {/* ── SPARKLES ── */}
      <text x="3"  y="75" fontSize="13" fill="#00FF88" opacity="0.9">✦</text>
      <text x="95" y="75" fontSize="13" fill="#00FF88" opacity="0.9">✦</text>
      <text x="8"  y="55" fontSize="9"  fill="#FFD700" opacity="0.8">★</text>
      <text x="95" y="55" fontSize="9"  fill="#FFD700" opacity="0.8">★</text>
    </svg>
  );
}
