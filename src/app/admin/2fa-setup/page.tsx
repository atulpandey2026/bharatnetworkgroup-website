'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AdminLayout from '@/app/admin/AdminLayout';

type SetupStep = 'intro' | 'qr' | 'verify' | 'success';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<SetupStep>('intro');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaAlreadyEnabled, setMfaAlreadyEnabled] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp?.length > 0) {
        const verified = data.totp.find((f: any) => f.status === 'verified');
        if (verified) {
          setMfaAlreadyEnabled(true);
        }
      }
    } catch {
      // ignore
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep('qr');
    } catch (err: any) {
      setError(err?.message || 'Failed to start 2FA enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.length !== 6) {
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
        code: verifyCode,
      });
      if (verifyRes.error) throw verifyRes.error;

      // Mark mfa_enabled in user_profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ mfa_enabled: true })
          .eq('id', user.id);
      }

      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find((f: any) => f.status === 'verified');
      if (totp) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totp.id });
        if (error) throw error;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ mfa_enabled: false })
          .eq('id', user.id);
      }
      setMfaAlreadyEnabled(false);
      setStep('intro');
    } catch (err: any) {
      setError(err?.message || 'Failed to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#E05A1E] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add an extra layer of security to your admin account.
          </p>
        </div>

        {/* Already enabled state */}
        {mfaAlreadyEnabled && step !== 'success' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">2FA is Active</h2>
                <p className="text-sm text-gray-500">Your account is protected with two-factor authentication.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm font-medium">⚠️ Disabling 2FA will reduce your account security.</p>
            </div>

            <button
              onClick={handleDisable}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Disabling…' : 'Disable Two-Factor Authentication'}
            </button>
          </div>
        )}

        {/* Intro step */}
        {!mfaAlreadyEnabled && step === 'intro' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#E05A1E]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#E05A1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enable 2FA</h2>
                <p className="text-sm text-gray-500">Use an authenticator app to generate login codes.</p>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Install an authenticator app (Google Authenticator, Authy, etc.)',
                'Scan the QR code shown in the next step',
                'Enter the 6-digit code to confirm setup',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#E05A1E]/10 text-[#E05A1E] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Setting up…' : 'Set Up Two-Factor Authentication'}
            </button>
          </div>
        )}

        {/* QR Code step */}
        {step === 'qr' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Scan QR Code</h2>
            <p className="text-sm text-gray-500 mb-6">
              Open your authenticator app and scan the QR code below.
            </p>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="2FA QR Code" width={180} height={180} />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1 font-medium">Can&apos;t scan? Enter this key manually:</p>
              <p className="text-sm font-mono text-gray-800 break-all select-all">{secret}</p>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              I&apos;ve Scanned the QR Code →
            </button>
          </div>
        )}

        {/* Verify step */}
        {step === 'verify' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Verify Setup</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the 6-digit code from your authenticator app to confirm.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-[#E05A1E] focus:ring-1 focus:ring-[#E05A1E]"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('qr')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || verifyCode.length !== 6}
                  className="flex-1 bg-[#E05A1E] hover:bg-[#c94d16] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Verifying…' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2FA Enabled!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your account is now protected with two-factor authentication. You will be prompted for a code on your next login.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="w-full bg-[#E05A1E] hover:bg-[#c94d16] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
