'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/design-tokens';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-card" style={{ width: 400, padding: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, background: colors.ink, borderRadius: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}>
          盎
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>登录盎然内容</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: colors.text3 }}>
          多平台内容创作平台
        </p>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', background: colors.badSoft, color: colors.bad,
          borderRadius: 6, fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
            邮箱
          </label>
          <input
            className="pr-input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
            密码
          </label>
          <input
            className="pr-input"
            type="password"
            placeholder="输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="pr-btn primary" type="submit" disabled={loading} style={{ height: 38, justifyContent: 'center', fontSize: 14, marginTop: 4 }}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.text2 }}>
        还没有账号？{' '}
        <Link href="/register" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
          注册
        </Link>
      </div>
    </div>
  );
}
