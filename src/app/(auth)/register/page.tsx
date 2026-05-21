'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/design-tokens';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name || undefined, orgName || undefined);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pr-card" style={{ width: 420, padding: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, background: colors.ink, borderRadius: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 12,
        }}>
          盎
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>创建账号</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: colors.text3 }}>
          创建一个新的 Workspace
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
            邮箱 <span style={{ color: colors.bad }}>*</span>
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
            密码 <span style={{ color: colors.bad }}>*</span>
          </label>
          <input
            className="pr-input"
            type="password"
            placeholder="至少 6 位"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
            姓名
          </label>
          <input
            className="pr-input"
            type="text"
            placeholder="你的名字"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: colors.text2, marginBottom: 4, display: 'block' }}>
            Workspace 名称
          </label>
          <input
            className="pr-input"
            type="text"
            placeholder="例如：品牌组"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
          />
        </div>
        <button className="pr-btn primary" type="submit" disabled={loading} style={{ height: 38, justifyContent: 'center', fontSize: 14, marginTop: 4 }}>
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: colors.text2 }}>
        已有账号？{' '}
        <Link href="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: 500 }}>
          登录
        </Link>
      </div>
    </div>
  );
}
