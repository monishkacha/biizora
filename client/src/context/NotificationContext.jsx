import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { notificationsApi } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, activeBusinessId } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user || !activeBusinessId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await notificationsApi.list();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  }, [user, activeBusinessId]);

  useEffect(() => {
    refresh();

    const timer = setInterval(refresh, 60000);

    return () => clearInterval(timer);
  }, [refresh]);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
              ...n,
              read: true,
            }
            : n
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (message, type = "info") => {
    const notification = {
      id: Date.now().toString(),
      title: type.toUpperCase(),
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((count) => count + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refresh,
        markRead,
        markAllRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}

export function useNotifications() {
  return useNotification();
}