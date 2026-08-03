import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[14px] bg-accent text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <span className="text-xl font-display font-semibold">Biizora</span>
          </Link>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-text-muted">We&apos;ll email you a reset link</p>
        </div>

        <div className="bz-card p-7 space-y-4">
          {sent ? (
            <p className="text-sm text-text-secondary leading-relaxed">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-4"
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-text-secondary">Email</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bz-input" />
              </label>
              <Button type="submit" className="w-full">Send reset link</Button>
            </form>
          )}
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
