import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, ArrowRight, ChevronDown, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

function DemoWorkspaceDropdown({ onSelect, disabled, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  const handleSelect = (account) => {
    setSelectedLabel(account.label);
    setIsOpen(false);
    onSelect(account);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[52px] px-4 rounded-[16px] bg-[#F5F4F0] border border-[#E5E3DD] text-warm-gray text-xs font-semibold flex items-center justify-between hover:bg-[#EAE8E2] focus:border-green-bottle transition-all duration-[220ms] focus:outline-none disabled:opacity-60"
      >
        <span className="text-charcoal font-sans">{selectedLabel || t('auth.chooseDemoWorkspace', 'Choose a demo workspace')}</span>
        <ChevronDown className={`w-4 h-4 text-warm-gray transition-transform duration-220 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E5E3DD] rounded-[16px] shadow-elev z-20 overflow-hidden">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => handleSelect(account)}
              className="w-full text-left px-4 py-3 text-xs text-charcoal hover:bg-cream transition-colors border-b border-stone/50 last:border-0 font-medium"
            >
              {account.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DEMO_ACCOUNTS = [
  {
    label: 'Manufacturing (Primary Demo)',
    email: 'manufacturing@biizora.demo',
    password: 'demo1234',
  },
  {
    label: 'Retail demo',
    email: 'retail-demo@biizora.com',
    password: 'demo123',
  },
  {
    label: 'Salon demo',
    email: 'salon-demo@biizora.com',
    password: 'demo123',
  },
  {
    label: 'Restaurant demo',
    email: 'restaurant-demo@biizora.com',
    password: 'demo123',
  },
  {
    label: 'Stationery demo',
    email: 'stationery-demo@biizora.com',
    password: 'demo123',
  },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/app');
    } catch (err) {
      setError(err.message || t('errors.loginFailed', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMode === 'password') {
      await signIn(email, password);
    } else {
      if (!otpSent) {
        await handleSendLoginOTP();
      } else {
        await handleVerifyLoginOTP();
      }
    }
  };

  const handleSendLoginOTP = async () => {
    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMsg('');
    try {
      const res = await fetch('/api/auth/login-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP code');
      setOtpSent(true);
      setInfoMsg(data.message || 'Verification code sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOTP = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      
      // Store token & refresh user state via login or manual reload
      if (data.accessToken) {
        localStorage.setItem('biizora_token', data.accessToken);
        window.location.href = '/app';
      } else {
        navigate('/app');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setLoginMode('password');
    await signIn(account.email, account.password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[14px] bg-green-bottle text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <span className="text-xl font-display font-semibold tracking-tight">Biizora</span>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight">{t('auth.welcomeBack', 'Welcome back')}</h1>
            <p className="mt-1.5 text-sm text-warm-gray">{t('auth.signInSubtitle', 'Sign in to your business operating system')}</p>
          </div>
        </div>

        <div className="bz-card p-7 sm:p-8 space-y-5">
          <div className="relative w-full">
            <label className="block space-y-1.5 mb-2">
              <span className="text-xs font-medium text-warm-gray font-sans">{t('auth.quickDemoAccess', 'Quick Demo Access')}</span>
            </label>
            <DemoWorkspaceDropdown
              disabled={loading}
              onSelect={handleDemoLogin}
              t={t}
            />
          </div>

          {/* Auth Method Switcher */}
          <div className="flex bg-[#F5F4F0] p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setError(''); setInfoMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginMode === 'password' ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-charcoal'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setError(''); setInfoMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginMode === 'otp' ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-charcoal'
              }`}
            >
              Email OTP Login
            </button>
          </div>

          {infoMsg ? (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-[14px] px-3 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              {infoMsg}
            </p>
          ) : null}

          {error ? (
            <p className="text-xs text-terracotta bg-[#F8E6E1] border border-[#E8C4BA] rounded-[14px] px-3 py-2.5">{error}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-warm-gray">{t('auth.workEmail', 'Work email')}</span>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bz-input pl-10"
                  placeholder="you@company.com"
                />
                <Mail className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </label>

            {loginMode === 'password' ? (
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-warm-gray">Password</span>
                  <Link to="/forgot-password" className="text-xs text-warm-gray hover:text-green-bottle">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bz-input pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-warm-gray">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
            ) : (
              <div>
                {otpSent ? (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-warm-gray">6-Digit Verification Code</span>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.trim())}
                        className="bz-input pl-10 font-mono tracking-widest text-base font-bold text-center"
                        placeholder="123456"
                      />
                      <KeyRound className="w-4 h-4 text-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-warm-gray">Code expires in 10 minutes</span>
                      <button
                        type="button"
                        onClick={handleSendLoginOTP}
                        disabled={loading}
                        className="text-green-bottle font-semibold hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                  </label>
                ) : null}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loginMode === 'password' ? (
                <>{t('auth.signInBtn', 'Sign in')} <ArrowRight className="w-4 h-4" /></>
              ) : otpSent ? (
                <>{t('auth.verifyOtpBtn', 'Verify OTP & Sign in')} <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>{t('auth.sendCodeBtn', 'Send Verification Code')} <Mail className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-gray">
          {t('auth.newToBiizora', 'New to Biizora?')}{' '}
          <Link to="/register" className="font-semibold text-green-bottle hover:underline">{t('auth.createAccount', 'Create account')}</Link>
        </p>
      </div>
    </div>
  );
}
