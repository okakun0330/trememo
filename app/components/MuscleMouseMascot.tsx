import React from 'react';

interface Props {
  size?: number;
  mood?: 'default' | 'flex' | 'happy';
}

/**
 * トレメモのマスコットキャラ「マッスルチュー」
 * 筋肉質でかわいいネズミが両腕を上げてフレックスしているポーズ
 */
export default function MuscleMouseMascot({ size = 130, mood = 'flex' }: Props) {
  const h = Math.round(size * 130 / 110);
  return (
    <svg viewBox="0 0 110 130" width={size} height={h} xmlns="http://www.w3.org/2000/svg">

      {/* ── SHADOW ── */}
      <ellipse cx="55" cy="128" rx="28" ry="4" fill="#E0E0E0" />

      {/* ── EARS (behind head) ── */}
      {/* Left ear */}
      <ellipse cx="24" cy="20" rx="15" ry="15" fill="#EDD0B0" />
      <ellipse cx="24" cy="20" rx="9"  ry="9"  fill="#F9AABB" />
      {/* Right ear */}
      <ellipse cx="86" cy="20" rx="15" ry="15" fill="#EDD0B0" />
      <ellipse cx="86" cy="20" rx="9"  ry="9"  fill="#F9AABB" />

      {/* ── HEAD ── */}
      <ellipse cx="55" cy="46" rx="30" ry="28" fill="#F2DFC2" />

      {/* Headband (lime green) */}
      <path
        d="M27 34 Q55 26 83 34 Q83 41 55 33 Q27 41 27 34 Z"
        fill="#00DD77"
      />
      <text x="46" y="40" fontSize="6" fontWeight="bold" fill="white" fontFamily="sans-serif">
        GYM
      </text>

      {/* ── EYES ── */}
      {/* Left eye */}
      <circle cx="43" cy="47" r="7"   fill="white" />
      <circle cx="44" cy="48" r="5.5" fill="#1A0800" />
      <circle cx="46" cy="45" r="2"   fill="white" />
      <circle cx="43" cy="50" r="1"   fill="white" opacity="0.5" />
      {/* Right eye */}
      <circle cx="67" cy="47" r="7"   fill="white" />
      <circle cx="68" cy="48" r="5.5" fill="#1A0800" />
      <circle cx="70" cy="45" r="2"   fill="white" />
      <circle cx="67" cy="50" r="1"   fill="white" opacity="0.5" />

      {/* Brow (determined look) */}
      <path d="M38 41 Q43 38 48 40" stroke="#8B5A2B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M62 40 Q67 38 72 41" stroke="#8B5A2B" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ── BLUSH ── */}
      <ellipse cx="33" cy="55" rx="6"   ry="4"   fill="#FF9999" opacity="0.55" />
      <ellipse cx="77" cy="55" rx="6"   ry="4"   fill="#FF9999" opacity="0.55" />

      {/* ── NOSE ── */}
      <ellipse cx="55" cy="57" rx="4" ry="3" fill="#FF9999" />

      {/* ── MOUTH (big happy smile) ── */}
      <path
        d="M46 63 Q55 72 64 63"
        stroke="#8B5A2B" strokeWidth="2.2" fill="none" strokeLinecap="round"
      />
      {/* Teeth */}
      <rect x="51" y="63" width="4" height="4" rx="1" fill="white" />
      <rect x="55" y="63" width="4" height="4" rx="1" fill="white" />

      {/* ── WHISKERS ── */}
      <line x1="57" y1="57" x2="76" y2="53" stroke="#C4A070" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="57" y1="60" x2="77" y2="60" stroke="#C4A070" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="53" y1="57" x2="34" y2="53" stroke="#C4A070" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="53" y1="60" x2="33" y2="60" stroke="#C4A070" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── NECK ── */}
      <rect x="49" y="72" width="12" height="7" rx="4" fill="#E8C8A0" />

      {/* ── BODY (muscular torso) ── */}
      <ellipse cx="55" cy="99" rx="21" ry="22" fill="#F2DFC2" />

      {/* Pec definition */}
      <path d="M40 90 Q47 97 55 93" stroke="#D8B890" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M70 90 Q63 97 55 93" stroke="#D8B890" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Abs lines */}
      <path d="M48 100 Q55 103 62 100" stroke="#D8B890" strokeWidth="1.2" fill="none" />
      <path d="M47 107 Q55 110 63 107" stroke="#D8B890" strokeWidth="1.2" fill="none" />

      {/* ── LEFT ARM (raised flex) ── */}
      {/* Upper arm */}
      <ellipse cx="29" cy="84" rx="9"  ry="15" fill="#F2DFC2" transform="rotate(-35 29 84)" />
      {/* Bicep peak */}
      <ellipse cx="20" cy="70" rx="11" ry="8"  fill="#EAC898" />
      {/* Forearm */}
      <ellipse cx="25" cy="58" rx="7"  ry="11" fill="#F2DFC2" transform="rotate(10 25 58)" />
      {/* Fist hint */}
      <ellipse cx="26" cy="49" rx="6"  ry="5"  fill="#EAC898" />
      {/* Arm outline accent */}
      <path d="M15 72 Q20 62 27 52" stroke="#D8B890" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* ── RIGHT ARM (raised flex) ── */}
      <ellipse cx="81" cy="84" rx="9"  ry="15" fill="#F2DFC2" transform="rotate(35 81 84)" />
      <ellipse cx="90" cy="70" rx="11" ry="8"  fill="#EAC898" />
      <ellipse cx="85" cy="58" rx="7"  ry="11" fill="#F2DFC2" transform="rotate(-10 85 58)" />
      <ellipse cx="84" cy="49" rx="6"  ry="5"  fill="#EAC898" />
      <path d="M95 72 Q90 62 83 52" stroke="#D8B890" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* ── SHORTS (lime green) ── */}
      <path
        d="M34 112 Q37 123 49 121 Q55 119 61 121 Q73 123 76 112 Z"
        fill="#00DD77"
      />
      {/* Shorts stripe */}
      <line x1="55" y1="112" x2="55" y2="121" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />

      {/* ── LEGS ── */}
      <ellipse cx="43" cy="121" rx="10" ry="7" fill="#F2DFC2" />
      <ellipse cx="67" cy="121" rx="10" ry="7" fill="#F2DFC2" />

      {/* ── SHOES (lime green) ── */}
      <ellipse cx="41" cy="127" rx="13" ry="5" fill="#00DD77" />
      <ellipse cx="69" cy="127" rx="13" ry="5" fill="#00DD77" />
      {/* Shoe highlight */}
      <ellipse cx="38" cy="125" rx="5" ry="2" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="66" cy="125" rx="5" ry="2" fill="rgba(255,255,255,0.35)" />

      {/* ── TAIL ── */}
      <path
        d="M74 108 Q88 114 84 122"
        stroke="#EDD0B0" strokeWidth="3" fill="none" strokeLinecap="round"
      />

      {/* ── STAR SPARKLES (energy/power effect) ── */}
      <text x="5"  y="72" fontSize="10" fill="#00DD77" opacity="0.8">✦</text>
      <text x="93" y="72" fontSize="10" fill="#00DD77" opacity="0.8">✦</text>
      <text x="10" y="55" fontSize="7"  fill="#FFD700" opacity="0.7">★</text>
      <text x="94" y="55" fontSize="7"  fill="#FFD700" opacity="0.7">★</text>

    </svg>
  );
}
