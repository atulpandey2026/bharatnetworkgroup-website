'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const data = await signIn(email.trim(), password);
      const supabase = createClient();

      // MFA is optional. If the account has a verified TOTP factor and
      // the session is still AAL1, send the user to the verification page.
      try {
        const { data: assuranceData, error: assuranceError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (!assuranceError &&
            assuranceData?.nextLevel === 'aal2' &&
            assuranceData?.currentLevel !== 'aal2') {
          router.replace('/admin/2fa-verify');
          return;
        }
      } catch {
        // Do not block a normal login if the optional MFA check fails.
      }

      // Audit logging is deliberately non-blocking.
      try {
        const user = data?.user;
        if (user) {
          const profile = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (profile.data) {
            await supabase.from('audit_logs').insert({
              user_id: user.id,
              user_email: user.email || '',
              action: 'login',
              entity_type: 'auth',
              entity_id: user.id,
              entity_name: user.email || '',
              summary: `Admin login: ${user.email}`,
              metadata: {},
            });
          }
        }
      } catch {
        // Ignore audit logging failures during authentication.
      }

      // Give the browser auth state a moment to persist the session cookie,
      // then navigate. replace() avoids returning to the login page via Back.
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E05A1E] flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">BNG Admin</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm">Sign in to manage your website content</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E] transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Bharat Network Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
