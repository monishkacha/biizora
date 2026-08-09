import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Shown when the active business subscription is not Active.
 */
export default function SubscriptionPendingPage() {
  const { activeWorkspace, logout } = useAuth();
  const status = activeWorkspace?.subscriptionStatus || 'Pending';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-green-bottle/10 text-green-bottle flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
            Subscription {status}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
            Your account has been created successfully.
          </h1>
          <p className="text-sm sm:text-base text-warm-gray leading-relaxed">
            Your subscription is currently pending activation.
          </p>
        </div>

        <div className="rounded-2xl border border-stone bg-white p-6 text-left space-y-4 shadow-subtle">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-green-bottle shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Please contact</p>
              <a
                href="mailto:biizora@gmail.com"
                className="text-green-bottle font-medium hover:underline"
              >
                biizora@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-warm-gray shrink-0 mt-0.5" />
            <p className="text-sm text-warm-gray leading-relaxed">
              Once your subscription is activated you will automatically receive dashboard access.
            </p>
          </div>
        </div>


        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="mailto:biizora@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-bottle text-white text-sm font-semibold hover:opacity-90"
          >
            <Mail className="w-4 h-4" /> Email Biizora
          </a>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-stone bg-white text-sm font-medium text-charcoal hover:bg-ivory"
          >
            Back to home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-warm-gray hover:text-charcoal underline-offset-2 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
