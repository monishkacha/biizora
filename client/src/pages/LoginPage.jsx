import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const DEMO_ACCOUNTS = [
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
    label: 'Manufacturing demo',
    email: 'manufacturing-demo@biizora.com',
    password: 'demo123',
  },
  {
    label: 'Stationery demo',
    email: 'stationery-demo@biizora.com',
    password: 'demo123',
  },
  {
    label: 'Adrian Hale demo',
    email: 'adrian.hale@biizora.demo',
    password: 'demo1234',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
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
            <h1 className="text-2xl font-display font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-warm-gray">Sign in to your business operating system</p>
          </div>
        </div>

        <div className="bz-card p-7 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin(account)}
                className="w-full py-2.5 rounded-[14px] bg-cream border border-stone text-warm-gray text-xs font-medium hover:bg-bg-hover transition-colors disabled:opacity-60"
              >
                {loading ? `Opening ${account.label}…` : `Try ${account.label}`}
              </button>
            ))}
          </div>

          {error ? (
            <p className="text-xs text-terracotta bg-[#F8E6E1] border border-[#E8C4BA] rounded-[14px] px-3 py-2.5">{error}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-warm-gray">Work email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bz-input" placeholder="you@company.com" />
            </label>

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

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-gray">
          New to Biizora?{' '}
          <Link to="/register" className="font-semibold text-green-bottle hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
