'use client';

import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-0782141543357042';

type Props = {
  slot: string;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function AdUnit({ slot, format = 'auto', className = '', style }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const el = insRef.current;
    if (!el) return;
    if (el.offsetWidth === 0) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {}
  }, []);

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
