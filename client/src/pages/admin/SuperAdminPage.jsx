import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';
import {
  Building2,
  CheckCircle2,
  Ban,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, a, c] = await Promise.all([
        adminApi.tenants({ q, status }),
        adminApi.analytics(),
        adminApi.config(),
      ]);
      setTenants(t.tenants || []);
      setAnalytics(a);
      setConfig(c);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.isSuperAdmin) {
    return <Navigate to="/app" replace />;
  }

  const run = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const totals = analytics?.totals || {};

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray">Platform</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
          Super Admin
        </h1>
        <p className="text-sm text-warm-gray mt-1">
          Approve subscriptions, assign plans, enable modules and custom features.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          ['Businesses', totals.businesses],
          ['Users', totals.users],
          ['Active', totals.active],
          ['Pending', totals.pending],
          ['Suspended', totals.suspended],
          ['Expired', totals.expired],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-stone bg-white p-4 shadow-subtle">
            <p className="text-[11px] uppercase tracking-wider text-warm-gray">{label}</p>
            <p className="text-2xl font-semibold text-charcoal mt-1">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tenants…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone bg-white text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-stone bg-white text-sm"
        >
          <option value="">All statuses</option>
          {(config?.subscriptionStatuses || ['Pending', 'Active', 'Expired', 'Suspended', 'Cancelled']).map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            )
          )}
        </select>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone bg-white text-sm hover:bg-ivory"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-stone bg-white overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ivory/80 text-left text-[11px] uppercase tracking-wider text-warm-gray">
              <tr>
                <th className="px-4 py-3 font-semibold">Business</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Features</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-warm-gray">
                    Loading tenants…
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-warm-gray">
                    No tenants found
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="border-t border-stone/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-bottle shrink-0" />
                        <div>
                          <p className="font-medium text-charcoal">{t.businessName || t.name}</p>
                          <p className="text-[11px] text-warm-gray">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{t.businessType || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        disabled={busyId === t.id}
                        value={t.subscriptionPlan || 'starter'}
                        onChange={(e) =>
                          run(t.id, () => adminApi.assignPlan(t.id, e.target.value))
                        }
                        className="rounded-lg border border-stone px-2 py-1 text-xs bg-white"
                      >
                        {(config?.planIds || ['starter', 'growth', 'professional', 'enterprise']).map(
                          (p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          t.subscriptionStatus === 'Active'
                            ? 'bg-green-bottle/10 text-green-bottle'
                            : t.subscriptionStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone text-charcoal'
                        }`}
                      >
                        {t.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(t.customFeatures || []).length === 0 ? (
                          <span className="text-[11px] text-warm-gray">None</span>
                        ) : (
                          t.customFeatures.map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ivory border border-stone text-[10px]"
                            >
                              <Sparkles className="w-2.5 h-2.5" /> {f}
                            </span>
                          ))
                        )}
                      </div>
                      <select
                        className="mt-1 text-[11px] border border-stone rounded-lg px-1.5 py-1 bg-white"
                        disabled={busyId === t.id}
                        defaultValue=""
                        onChange={(e) => {
                          const feature = e.target.value;
                          if (!feature) return;
                          const next = Array.from(new Set([...(t.customFeatures || []), feature]));
                          run(t.id, () => adminApi.setFeatures(t.id, next));
                          e.target.value = '';
                        }}
                      >
                        <option value="">Add feature…</option>
                        {Object.keys(config?.customFeatures || {}).map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {t.subscriptionStatus !== 'Active' && (
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => run(t.id, () => adminApi.activate(t.id))}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-bottle text-white text-[11px] font-semibold"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Activate
                          </button>
                        )}
                        {t.subscriptionStatus === 'Active' && (
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => run(t.id, () => adminApi.suspend(t.id))}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-stone text-[11px] font-semibold"
                          >
                            <Ban className="w-3 h-3" /> Suspend
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === t.id}
                          onClick={() => {
                            if (window.confirm('Reset this tenant to Pending?')) {
                              run(t.id, () => adminApi.reset(t.id));
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-stone text-[11px]"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
