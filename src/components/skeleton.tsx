'use client';

import { colors } from '@/lib/design-tokens';

interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  r?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ w = '100%', h = 16, r = 4, style }: SkeletonProps) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: `linear-gradient(90deg, ${colors.border} 20%, ${colors.surface2} 50%, ${colors.border} 80%)`,
      backgroundSize: '200% 100%',
      animation: 'pr-shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div className="pr-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton h={12} w="40%" />
      <Skeleton h={24} w="60%" />
      <Skeleton h={12} w="30%" />
    </div>
  );
}

export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="pr-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} h={14} w={i === 1 ? '80%' : i === cols - 1 ? '40%' : '60%'} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="pr-card">
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} cols={5} />
      ))}
    </div>
  );
}

export function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
