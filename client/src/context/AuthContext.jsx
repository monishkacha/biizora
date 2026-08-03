import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  setAccessToken,
  getAccessToken,
  setActiveBusinessId,
  getActiveBusinessId,
  setUnauthorizedHandler,
  clearLegacyStorage,
  businessApi,
} from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [activeBusinessId, setActiveBiz] = useState(getActiveBusinessId());
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  const applySession = useCallback((data) => {
    if (data.accessToken) setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    if (data.businesses) {
      setBusinesses(data.businesses);
      const preferred =
        data.activeBusinessId ||
        getActiveBusinessId() ||
        data.businesses[0]?.id ||
        null;
      if (preferred) {
        setActiveBusinessId(preferred);
        setActiveBiz(preferred);
      }
    }
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
    setBusinesses([]);
    setActiveBiz(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setBusinesses([]);
      setAccessToken(null);
    });

    const boot = async () => {
      clearLegacyStorage();
      try {
        if (getAccessToken()) {
          const data = await authApi.me();
          setUser(data.user);
          setBusinesses(data.businesses || []);
          const preferred = getActiveBusinessId() || data.businesses?.[0]?.id;
          if (preferred) {
            setActiveBusinessId(preferred);
            setActiveBiz(preferred);
          }
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
    return { success: true, user: data.user };
  };

  const register = async (userData) => {
    const data = await authApi.register({
      name: userData.fullName || userData.name,
      email: userData.email,
      password: userData.password,
      companyName: userData.companyName,
      phone: userData.phone,
    });
    clearLegacyStorage();
    applySession(data);
    return { success: true, user: data.user };
  };

  const updateProfile = async (updatedFields) => {
    const data = await authApi.updateProfile(updatedFields);
    setUser(data.user);
    return data.user;
  };

  const refreshBusinesses = async () => {
    const data = await businessApi.list();
    setBusinesses(data.businesses || []);
    return data.businesses;
  };

  const switchWorkspace = (wsId) => {
    setActiveBusinessId(wsId);
    setActiveBiz(wsId);
  };

  const activeWorkspace =
    businesses.find((b) => b.id === activeBusinessId) || businesses[0] || null;

  const workspaces = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    plan: b.plan || 'Pro',
    role: b.role,
    membersCount: b.membersCount || 0,
    onboardingCompleted: b.onboardingCompleted,
  }));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        bootError,
        login,
        register,
        logout,
        updateProfile,
        activeWorkspace,
        activeBusinessId,
        workspaces,
        businesses,
        switchWorkspace,
        refreshBusinesses,
        setBusinesses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
