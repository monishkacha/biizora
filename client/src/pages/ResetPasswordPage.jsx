import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import AuthBrandHeader from '../components/AuthBrandHeader';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center space-y-3">
          <AuthBrandHeader />
          <h1 className="text-2xl font-display font-semibold tracking-tight">Choose a new password</h1>
        </div>

        <div className="bz-card p-7">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}
            className="space-y-4"
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-text-secondary">New password</span>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bz-input" />
            </label>
            <Button type="submit" className="w-full">Update password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
