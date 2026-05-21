import { colors } from '@/lib/design-tokens';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', height: '100%', width: '100%',
      alignItems: 'center', justifyContent: 'center',
      background: colors.bg,
    }}>
      {children}
    </div>
  );
}
