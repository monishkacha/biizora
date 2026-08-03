import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultWorkspaces } from '../data/initialData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('amexora_user');
    return saved ? JSON.parse(saved) : {
      id: "usr-100",
      name: "Krish Patel",
      email: "kpatel3360@gmail.com",
      role: "Owner", // Owner | Manager | Accountant | Employee
      companyName: "Amexora Technologies Pvt Ltd",
      phone: "+91 99049 14513",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      emailVerified: true,
      subscriptionPlan: "Pro Plan",
      subscriptionStatus: "active",
      trialDaysLeft: 14
    };
  });

  const [activeWorkspace, setActiveWorkspace] = useState(defaultWorkspaces[0]);
  const [workspaces, setWorkspaces] = useState(defaultWorkspaces);

  useEffect(() => {
    if (user) {
      localStorage.setItem('amexora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('amexora_user');
    }
  }, [user]);

  const login = (email, password, rememberMe = true) => {
    // Simulated JWT login
    const loggedUser = {
      id: "usr-100",
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: "Owner",
      companyName: "Amexora Technologies Pvt Ltd",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      emailVerified: true,
      subscriptionPlan: "Pro Plan",
      subscriptionStatus: "active",
      trialDaysLeft: 14,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.amexora_token_demo"
    };
    setUser(loggedUser);
    return { success: true, user: loggedUser };
  };

  const register = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.fullName || userData.name,
      email: userData.email,
      role: "Owner",
      companyName: userData.companyName || "My Business",
      phone: userData.phone || "+91 99999 88888",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      emailVerified: true,
      subscriptionPlan: "Pro Plan (14-Day Trial)",
      subscriptionStatus: "trial",
      trialDaysLeft: 14
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const switchWorkspace = (wsId) => {
    const ws = workspaces.find(w => w.id === wsId);
    if (ws) setActiveWorkspace(ws);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      activeWorkspace,
      workspaces,
      switchWorkspace
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
