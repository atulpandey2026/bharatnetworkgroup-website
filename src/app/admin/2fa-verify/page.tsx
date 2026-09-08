'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [loadingFactor, setLoadingFactor] = useState(true);

  useEffect(() => {
    loadFactor();
  }, []);

  const loadFactor = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totp = data?.totp?.find((f: any) => f.status === 'verified');
      if (!totp) {
        // No MFA factor found — redirect to admin
        router.replace('/admin');
        return;
      }
      setFactorId(totp.id);
    } catch {
      router.replace('/admin/login');
    } finally {
      setLoadingFactor(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const challengeRes = await supabase.auth.mfa.challenge({ factorId });
      if (challengeRes.error) throw challengeRes.error;

      const verifyRes = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeRes.data.id,
        code,
      });
      if (verifyRes.error) throw verifyRes.error;

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loadingFactor) {
    return (
      <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E05A1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B09] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E05A1E] flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">BNG Admin</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Two-Factor Verification</h1>
          <p className="text-white/50 text-sm">Enter the code from your authenticator app</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#E05A1E]/10 border border-[#E05A1E]/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#E05A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2 text-center">
                6-Digit Authentication Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 text-center text-3xl tracking-widest font-mono focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
            >
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button
              onClick={handleSignOut}
              className="text-white/40 hover:text-white/70 text-xs transition-colors"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Open your authenticator app to get the current code.
        </p>
      </div>
    </div>
  );
}
