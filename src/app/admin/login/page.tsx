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
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);

      // Check if MFA is required
      const supabase = createClient();
      const { data: assuranceData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      // If user has MFA enrolled but current session is only AAL1,
      // redirect to verify
      if (
        assuranceData?.nextLevel === 'aal2' &&
        assuranceData?.currentLevel !== 'aal2'
      ) {
        router.push('/admin/2fa-verify');
        return;
      }

      // Log login action after successful sign-in
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

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
        // Silently ignore audit log errors
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E05A1E] flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>

            <span className="text-white font-bold text-xl tracking-tight">
              BNG Admin
            </span>
          </div>

          <h1 className="text-white text-2xl font-bold mb-1">
            Welcome back
          </h1>

          <p className="text-white/50 text-sm">
            Sign in to manage your website content
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E] transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Bharat Network Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}