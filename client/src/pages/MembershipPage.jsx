import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getPlan } from '../lib/plans';
import {
  BadgeCheck,
  Mail,
  RefreshCw,
  ArrowUpRight,
  Shield,
  HardDrive,
  Users,
  Sparkles,
  Calendar,
} from 'lucide-react';

const PLAN_ORDER = ['starter', 'growth', 'professional', 'enterprise'];

export default function MembershipPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { business, activeWorkspace, logout, user } = useAuth();
  const biz = business || activeWorkspace;
  const isDemo = Boolean(biz?.isDemoAccount || user?.isDemoAccount);
  const planId = isDemo ? 'enterprise' : (biz?.subscriptionPlan || 'starter');
  const status = isDemo ? 'Active' : (biz?.subscriptionStatus || 'Pending');
  const plan = getPlan(planId);
  const isActive = status === 'Active';

  const expiry = isDemo
    ? '31 Dec 2027'
    : (biz?.subscriptionExpiresAt
        ? new Date(biz.subscriptionExpiresAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—');

  const activated = isDemo
    ? '1 Jan 2025'
    : (biz?.subscriptionActivatedAt
        ? new Date(biz.subscriptionActivatedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—');

  const storageUsed = isDemo ? 'Unlimited' : '0 MB';
  const usersAllowed = isDemo || plan.limits.maxUsers === Infinity ? 'Unlimited' : plan.limits.maxUsers;
  const modulesIncluded = isDemo || plan.limits.maxModules === Infinity ? 'Unlimited' : plan.limits.maxModules;
  const aiCredits = isDemo || plan.limits.aiCredits === Infinity ? 'Unlimited' : plan.limits.aiCredits;

  const demoFeaturesList = [
    'Priority Support',
    'Advanced Analytics',
    'Custom Modules',
    'API Access Enabled',
    'White Label Enabled',
    'Unlimited Users',
    'Unlimited Storage',
    'Full Industry Suite',
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray">{isGu ? 'સબ્સ્ક્રિપ્શન' : 'Subscription'}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
            {isGu ? 'મેમ્બરશિપ પ્લાન' : 'Membership'}
          </h1>
          <p className="text-sm text-warm-gray mt-1">
            {biz?.name || 'Your business'} ·{' '}
            <span className="capitalize">{biz?.businessType || 'business'}</span>
          </p>
        </div>
        {isDemo && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-semibold">
            {isGu ? 'ડેમો એન્ટરપ્રાઇઝ એકાઉન્ટ' : 'Demo Enterprise Account'}
          </span>
        )}
      </div>

      {!isActive && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 space-y-2">
          <p className="font-semibold">{isGu ? 'તમારું એકાઉન્ટ સફળતાપૂર્વક બનાવવામાં આવ્યું છે.' : 'Your account has been created successfully.'}</p>
          <p>
            {isGu ? 'તમારું સબ્સ્ક્રિપ્શન હાલમાં' : 'Your subscription is currently'} <strong>{status}</strong>. {isGu ? 'ઍક્સેસ માટે કૃપા કરીને સંપર્ક કરો' : 'Dashboard access is paused until activation. Please contact'}{' '}
            <a href="mailto:biizora@gmail.com" className="underline font-medium">
              biizora@gmail.com
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [isGu ? 'હાલનો પ્લાન' : 'Current Plan', isDemo ? (isGu ? 'એન્ટરપ્રાઇઝ' : 'Enterprise') : plan.name],
          [isGu ? 'સ્થિતિ' : 'Status', status === 'Active' ? (isGu ? 'સક્રિય' : 'Active') : status],
          [isGu ? 'બિલિંગ સાયકલ' : 'Billing Cycle', isDemo ? (isGu ? 'માસિક' : 'Monthly') : (activated !== '—' ? (isGu ? 'સક્રિય' : 'Active') : 'Pending')],
          [isGu ? 'આગામી રિન્યુઅલ / એક્સપાયરી' : 'Next Renewal / Expiry', expiry],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-stone bg-white p-4 shadow-subtle">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">{label}</p>
            <p className="text-lg font-semibold text-charcoal mt-1 capitalize">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-stone bg-white p-6 shadow-subtle">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone p-4">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">Users allowed</p>
            <p className="text-lg font-semibold text-charcoal mt-2">{usersAllowed}</p>
          </div>
          <div className="rounded-2xl border border-stone p-4">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">Storage</p>
            <p className="text-lg font-semibold text-charcoal mt-2">{storageUsed}</p>
          </div>
          <div className="rounded-2xl border border-stone p-4">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">AI credits</p>
            <p className="text-lg font-semibold text-charcoal mt-2">{aiCredits}</p>
          </div>
          <div className="rounded-2xl border border-stone p-4">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">Modules included</p>
            <p className="text-lg font-semibold text-charcoal mt-2">{modulesIncluded}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-bottle" />
          <h2 className="font-display text-lg font-semibold text-charcoal">Plan entitlements</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-warm-gray">
            <Users className="w-4 h-4" /> Users allowed: <strong className="text-charcoal">{usersAllowed}</strong>
          </div>
          <div className="flex items-center gap-2 text-warm-gray">
            <HardDrive className="w-4 h-4" /> Storage:{' '}
            <strong className="text-charcoal">{storageUsed}</strong>
          </div>
          <div className="flex items-center gap-2 text-warm-gray">
            <Sparkles className="w-4 h-4" /> AI credits:{' '}
            <strong className="text-charcoal">{aiCredits}</strong>
          </div>
          <div className="flex items-center gap-2 text-warm-gray">
            <Calendar className="w-4 h-4" /> Modules:{' '}
            <strong className="text-charcoal">{modulesIncluded}</strong>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-2">Features included</p>
          <ul className="flex flex-wrap gap-2">
            {(isDemo ? demoFeaturesList : plan.features || []).map((f) => (
              <li
                key={f}
                className="px-2.5 py-1 rounded-lg bg-ivory border border-stone text-xs text-charcoal"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
        {(biz?.customFeatures || []).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-2">
              Custom features (this business only)
            </p>
            <ul className="flex flex-wrap gap-2">
              {biz.customFeatures.map((f) => (
                <li
                  key={f}
                  className="px-2.5 py-1 rounded-lg bg-green-bottle/10 text-green-bottle text-xs font-medium"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-stone bg-white p-6 shadow-subtle space-y-4">
        <h2 className="font-display text-lg font-semibold text-charcoal">Available plans</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLAN_ORDER.map((id) => {
            const p = getPlan(id);
            const current = id === planId;
            return (
              <div
                key={id}
                className={`rounded-xl border p-4 ${
                  current ? 'border-green-bottle bg-green-bottle/5' : 'border-stone'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-charcoal">{p.name}</p>
                  {current && (
                    <span className="text-[10px] font-bold uppercase text-green-bottle">Current</span>
                  )}
                </div>
                <p className="text-sm text-warm-gray mt-1">
                  ₹{p.priceMonthly.toLocaleString('en-IN')}/mo
                </p>
                <p className="text-xs text-warm-gray mt-2">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="mailto:biizora@gmail.com?subject=Upgrade%20plan%20request"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-bottle text-white text-sm font-semibold hover:opacity-90"
        >
          <ArrowUpRight className="w-4 h-4" /> Upgrade Plan
        </a>
        <a
          href="mailto:biizora@gmail.com?subject=Renew%20subscription"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone bg-white text-sm font-semibold hover:bg-ivory"
        >
          <RefreshCw className="w-4 h-4" /> Renew Subscription
        </a>
        <a
          href="mailto:biizora@gmail.com"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone bg-white text-sm font-medium hover:bg-ivory"
        >
          <Mail className="w-4 h-4" /> Contact Support
        </a>
        {user?.isSuperAdmin && (
          <Link
            to="/app/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone bg-white text-sm font-medium hover:bg-ivory"
          >
            <Shield className="w-4 h-4" /> Super Admin
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="text-sm text-warm-gray hover:text-charcoal underline-offset-2 hover:underline px-2"
        >
          Sign out
        </button>
      </div>

      <p className="text-xs text-warm-gray">
        Billing contact: <a href="mailto:biizora@gmail.com" className="text-green-bottle">biizora@gmail.com</a>
        {' · '}
        Support contact: <a href="mailto:biizora@gmail.com" className="text-green-bottle">biizora@gmail.com</a>
      </p>
    </div>
  );
}
