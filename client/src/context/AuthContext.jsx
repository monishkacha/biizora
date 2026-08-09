import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  setAccessToken,
  getAccessToken,
  setActiveBusinessId,
  setUnauthorizedHandler,
  clearLegacyStorage,
  businessApi,
} from '../api/client';

const AuthContext = createContext();

function normalizeBusiness(b) {
  if (!b) return null;
  return {
    id: b.id,
    name: b.name || b.businessName,
    businessName: b.businessName || b.name,
    plan: b.plan || b.subscriptionPlan || 'starter',
    subscriptionPlan: b.subscriptionPlan || b.plan || 'starter',
    subscriptionStatus: b.subscriptionStatus || 'Pending',
    subscriptionExpiresAt: b.subscriptionExpiresAt || null,
    subscriptionActivatedAt: b.subscriptionActivatedAt || null,
    businessType: b.businessType || 'general',
    enabledModules: b.enabledModules || [],
    customFeatures: b.customFeatures || [],
    isDemoAccount: Boolean(b.isDemoAccount),
    themeColor: b.themeColor,
    role: b.role || 'Owner',
    permissions: b.permissions,
    membersCount: b.membersCount || 0,
    onboardingCompleted: b.onboardingCompleted !== false,
    isActive: b.isActive !== false && (b.subscriptionStatus || 'Pending') === 'Active',
    ownerName: b.ownerName,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  const applySession = useCallback((data) => {
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    const biz = normalizeBusiness(data.business || data.businesses?.[0] || null);
    setBusiness(biz);
    if (biz?.id) setActiveBusinessId(biz.id);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setActiveBusinessId(null);
    setUser(null);
    setBusiness(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setBusiness(null);
      setAccessToken(null);
    });

    const boot = async () => {
      clearLegacyStorage();
      try {
        if (getAccessToken()) {
          const data = await authApi.me();
          setUser(data.user);
          const biz = normalizeBusiness(data.business || data.businesses?.[0] || null);
          setBusiness(biz);
          if (biz?.id) setActiveBusinessId(biz.id);
        } else {
          const refreshed = await authApi.refresh();
          if (refreshed) applySession(refreshed);
        }
      } catch {
        setBootError(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [applySession]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    clearLegacyStorage();
    applySession(data);
    return { success: true, user: data.user, business: data.business };
  };

  const register = async (userData) => {
    const data = await authApi.register({
      name: userData.fullName || userData.name || userData.ownerName,
      email: userData.email,
      password: userData.password,
      companyName: userData.companyName || userData.businessName,
      phone: userData.phone,
      businessType: userData.businessType,
    });
    clearLegacyStorage();
    applySession(data);
    return { success: true, user: data.user, business: data.business };
  };

  const updateProfile = async (updatedFields) => {
    const data = await authApi.updateProfile(updatedFields);
    setUser(data.user);
    return data.user;
  };

  const refreshBusiness = async () => {
    const data = await businessApi.list();
    const biz = normalizeBusiness(data.business || data.businesses?.[0] || null);
    setBusiness(biz);
    if (biz?.id) setActiveBusinessId(biz.id);
    return biz;
  };

  // Backward-compatible aliases for legacy components.
  const activeWorkspace = business;
  const activeBusinessId = business?.id || null;
  const businesses = business ? [business] : [];
  const workspaces = businesses;

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        bootError,
        login,
        register,
        logout,
        updateProfile,
        refreshBusiness,
        refreshBusinesses: refreshBusiness,
        activeWorkspace,
        activeBusinessId,
        businesses,
        workspaces,
        // Legacy compatibility only.
        switchWorkspace: () => {},
        setBusinesses: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
