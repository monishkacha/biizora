import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, setAccessToken, setActiveBusinessId } from '../api/client';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (inviteToken) {
        const data = await authApi.acceptInvite({ token: inviteToken, name: fullName, password });
        setAccessToken(data.accessToken);
        if (data.activeBusinessId) setActiveBusinessId(data.activeBusinessId);
        window.location.href = '/app';
        return;
      }
      await register({ fullName, email, companyName, phone, password });
      navigate('/app/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-display font-semibold tracking-tight">
              {inviteToken ? 'Join your team' : 'Create your workspace'}
            </h1>
            <p className="mt-1.5 text-sm text-warm-gray">Smarter Invoicing. Better Cash Flow. Powered by AI.</p>
          </div>
        </div>

        <div className="bz-card p-7 sm:p-8 space-y-4">
          {error ? (
            <p className="text-xs text-terracotta bg-[#F8E6E1] border border-[#E8C4BA] rounded-[14px] px-3 py-2.5">{error}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-warm-gray">Full name</span>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bz-input" placeholder="Adrian Hale" />
            </label>
            {!inviteToken ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-warm-gray">Business email</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bz-input" placeholder="adrian.hale@company.com" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-warm-gray">Company name</span>
                  <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="bz-input" placeholder="Hale & Co." />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-warm-gray">Phone</span>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="bz-input" placeholder="+91 98765 43210" />
                </label>
              </>
            ) : null}
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-warm-gray">Password</span>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bz-input" />
            </label>
            <Button type="submit" variant="accent" loading={loading} className="w-full" size="lg">
              {inviteToken ? 'Accept invite' : 'Create account'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-gray">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-green-bottle hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
