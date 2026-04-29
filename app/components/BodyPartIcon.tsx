import React from 'react';
import { BodyPart } from '@/lib/types';

interface IconProps {
  size?: number;
  className?: string;
}

function ChestIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Left pec */}
      <path d="M4 22 C4 14 10 11 18 13 C18 13 18 13 20 14" />
      <path d="M4 22 C4 30 10 33 18 31 C19 30.5 20 30 20 29" />
      <path d="M4 22 L4 22" />
      {/* Right pec */}
      <path d="M36 22 C36 14 30 11 22 13 C21 13.3 20 14 20 14" />
      <path d="M36 22 C36 30 30 33 22 31 C21 30.5 20 30 20 29" />
      {/* Center line */}
      <line x1="20" y1="14" x2="20" y2="29" strokeDasharray="2.5 2" />
      {/* Sternum/collarbone */}
      <path d="M8 11 Q20 8 32 11" />
    </svg>
  );
}

function BackIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Lat spread silhouette */}
      <path d="M20 5 L36 15 Q38 20 35 26 L28 33 L20 35 L12 33 L5 26 Q2 20 4 15 Z" />
      {/* Spine */}
      <line x1="20" y1="5" x2="20" y2="35" strokeDasharray="2.5 2" />
      {/* Upper back / traps */}
      <path d="M10 15 Q20 11 30 15" />
    </svg>
  );
}

function LegsIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Hip line */}
      <path d="M10 8 Q20 6 30 8" />
      {/* Left leg */}
      <path d="M13 8 C12 16 10 24 9 36" />
      <path d="M19 8 C18 16 17 24 17 36" />
      {/* Right leg */}
      <path d="M21 8 C22 16 23 24 23 36" />
      <path d="M27 8 C28 16 30 24 31 36" />
      {/* Knee indicators */}
      <path d="M10 22 Q13.5 20 17 22" strokeWidth="1" />
      <path d="M23 22 Q26.5 20 30 22" strokeWidth="1" />
    </svg>
  );
}

function ShouldersIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Deltoid arcs */}
      {/* Left deltoid */}
      <path d="M6 26 C4 18 8 11 16 10" />
      <path d="M6 26 C8 30 13 32 16 30" />
      {/* Right deltoid */}
      <path d="M34 26 C36 18 32 11 24 10" />
      <path d="M34 26 C32 30 27 32 24 30" />
      {/* Neck / center */}
      <path d="M16 10 Q20 8 24 10" />
      <line x1="20" y1="8" x2="20" y2="30" strokeDasharray="2.5 2" strokeWidth="1" />
      {/* Shoulder caps */}
      <circle cx="7" cy="24" r="2.5" />
      <circle cx="33" cy="24" r="2.5" />
    </svg>
  );
}

function ArmsIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Bicep curve */}
      <path d="M10 30 C8 22 8 14 12 10 C16 6 24 6 28 10 C32 14 32 22 30 30" />
      {/* Inner arm line */}
      <path d="M14 28 C13 22 13 16 16 12 C18 10 22 10 24 12 C27 16 27 22 26 28" />
      {/* Elbow hint */}
      <path d="M10 30 Q20 34 30 30" />
      {/* Muscle peak */}
      <path d="M16 12 Q20 7 24 12" strokeWidth="1" />
    </svg>
  );
}

function AbsIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Six-pack grid */}
      <rect x="11" y="5"  width="7.5" height="8" rx="2" />
      <rect x="21.5" y="5"  width="7.5" height="8" rx="2" />
      <rect x="11" y="16" width="7.5" height="8" rx="2" />
      <rect x="21.5" y="16" width="7.5" height="8" rx="2" />
      <rect x="11" y="27" width="7.5" height="8" rx="2" />
      <rect x="21.5" y="27" width="7.5" height="8" rx="2" />
    </svg>
  );
}

function CardioIcon({ size = 40, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* ECG / heartbeat line */}
      <path d="M2 20 L9 20 L13 9 L18 31 L23 15 L27 24 L31 20 L38 20" />
    </svg>
  );
}

const ICON_MAP: Record<BodyPart, React.FC<IconProps>> = {
  chest: ChestIcon,
  back: BackIcon,
  legs: LegsIcon,
  shoulders: ShouldersIcon,
  arms: ArmsIcon,
  abs: AbsIcon,
  cardio: CardioIcon,
};

export default function BodyPartIcon({
  bodyPart,
  size = 40,
  className,
  style,
}: {
  bodyPart: BodyPart;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICON_MAP[bodyPart];
  return (
    <span style={style} className={className}>
      <Icon size={size} />
    </span>
  );
}
