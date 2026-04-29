import Image from 'next/image';

interface Props {
  size?: number;
  /** 'full' = 通常ポーズ, 'small' = コンパクト版, 'celebrate' = お祝いポーズ */
  variant?: 'full' | 'small' | 'celebrate';
}

export default function MuscleMouseMascot({ size = 130, variant = 'full' }: Props) {
  const src = variant === 'celebrate' ? '/mascot/celebrate1.png' : '/mascot/main1.png';

  return (
    <Image
      src={src}
      alt="マスコットキャラクター"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      priority={variant === 'celebrate'}
    />
  );
}
