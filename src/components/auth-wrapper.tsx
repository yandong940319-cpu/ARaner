'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthPage) {
      router.push('/login');
    }
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', height: '100%', width: '100%',
        alignItems: 'center', justifyContent: 'center',
        background: '#f7f6f2', color: '#9a958b', fontSize: 14,
      }}>
        加载中...
      </div>
    );
  }

  // On auth pages or when authenticated, render children
  if (isAuthPage || user) {
    return <>{children}</>;
  }

  // Not authenticated and not on auth page - will redirect
  return null;
}

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
