import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { authApi, setAccessToken, setActiveBusinessId } from '../api/client';
import { ArrowRight, ShieldCheck, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import AuthBrandHeader from '../components/AuthBrandHeader';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('manufacturing');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite');

  const BUSINESS_TYPES = [
    { value: 'salon', label: t('nav.salon', 'Salon') },
    { value: 'restaurant', label: t('nav.restaurant', 'Restaurant / Cafe') },
    { value: 'retail', label: t('nav.retail', 'Retail') },
    { value: 'manufacturing', label: t('nav.manufacturing', 'Manufacturing') },
    { value: 'stationery', label: t('nav.stationery', 'Stationery') },
  ];

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((c) => Math.max(0, c - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const safeFetchJson = async (url, options) => {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || 'Server connection error. Please try again.' };
    }
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // Step 1: Submit Registration Form (triggers OTP send)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMsg('');

    if (inviteToken) {
      try {
        const data = await authApi.acceptInvite({
          token: inviteToken,
          name: ownerName,
          password,
        });
        setAccessToken(data.accessToken);
        if (data.activeBusinessId) setActiveBusinessId(data.activeBusinessId);
        window.location.href = '/app';
      } catch (err) {
        setError(err.message || 'Failed to accept invite');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await safeFetchJson('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: ownerName }),
      });

      setStep(2);
      setCooldown(60);
      setInfoMsg(data.message || `Verification code sent to ${email}`);
    } catch (err) {
      setError(err.message || t('errors.registerFailed', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await safeFetchJson('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email,
          companyName: businessName,
          businessType,
          password,
          otp: otpCode.trim(),
        }),
      });

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.activeBusinessId) setActiveBusinessId(data.activeBusinessId);
        window.location.href = '/app';
      } else {
        navigate('/app/membership');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      const data = await safeFetchJson('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: ownerName }),
      });
      setCooldown(60);
      setInfoMsg(data.message || 'A new 6-digit verification code has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-3">
          <AuthBrandHeader />
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">
              {inviteToken ? t('auth.createAccount', 'Join your team') : step === 1 ? t('auth.createAccountTitle', 'Create your business') : t('auth.verifyEmailTitle', 'Verify Email Address')}
            </h1>
            <p className="mt-1.5 text-sm text-warm-gray">
              {step === 1 ? t('auth.createAccountSubtitle', 'One account · One business · Built for your industry') : `Enter 6-digit code sent to ${email}`}
            </p>
          </div>
        </div>

        <div className="bz-card p-7 sm:p-8 space-y-4">
          {infoMsg ? (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-[14px] px-3 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              {infoMsg}
            </p>
          ) : null}
          {error ? (
            <p className="text-xs text-terracotta bg-[#F8E6E1] border border-[#E8C4BA] rounded-[14px] px-3 py-2.5">{error}</p>
          ) : null}

          {step === 1 ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-warm-gray">{t('auth.fullName', 'Owner name')}</span>
                <input
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="bz-input"
                  placeholder="John Smith"
                />
              </label>
              {!inviteToken ? (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-warm-gray">{t('auth.businessName', 'Business name')}</span>
                    <input
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bz-input"
                      placeholder="Apex Manufacturing Works"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-warm-gray">{t('auth.workEmail', 'Email')}</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bz-input"
                      placeholder="john@company.com"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-warm-gray">{t('auth.businessType', 'Business type')}</span>
                    <select
                      required
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="bz-input"
                    >
                      {BUSINESS_TYPES.map((tItem) => (
                        <option key={tItem.value} value={tItem.value}>
                          {tItem.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-warm-gray">{t('auth.password', 'Password')}</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bz-input"
                />
              </label>
              <Button type="submit" variant="accent" loading={loading} className="w-full" size="lg">
                {inviteToken ? t('auth.acceptInvite', 'Accept invite') : t('auth.sendCodeBtn', 'Send Verification Code')} <Mail className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-bottle flex items-center justify-center mx-auto mb-2 border border-green-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-xs text-warm-gray">{t('auth.checkOtpMsg', 'Check your inbox for the 6-digit verification code.')}</p>
                <p className="text-[11px] text-green-bottle font-semibold">Valid for 5 minutes</p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-warm-gray">{t('auth.verificationCode', 'Verification Code')}</span>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    className="bz-input pl-10 font-mono text-center tracking-widest text-lg font-bold"
                    placeholder="123456"
                  />
                  <KeyRound className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </label>

              <Button type="submit" variant="accent" loading={loading} className="w-full" size="lg">
                {t('auth.verifyActivateBtn', 'Verify & Activate Workspace')} <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex justify-between items-center pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-warm-gray hover:underline"
                >
                  ← {t('auth.editDetails', 'Edit details')}
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || cooldown > 0}
                  className={`font-semibold ${cooldown > 0 ? 'text-warm-gray cursor-not-allowed' : 'text-green-bottle hover:underline'}`}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : t('auth.resendOtp', 'Resend OTP')}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-warm-gray">
          {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="font-semibold text-green-bottle hover:underline">
            {t('auth.signInBtn', 'Sign in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
