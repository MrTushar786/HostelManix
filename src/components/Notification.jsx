import { useState, useEffect } from "react";
import "../css/Notification.css";

let notificationId = 0;
const listeners = new Set();

export const showNotification = (message, type = "info", duration = 3000) => {
  const id = notificationId++;
  const notification = { id, message, type, duration };
  listeners.forEach(listener => listener(notification));
  return id;
};

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const listener = (notification) => {
      setNotifications(prev => [...prev, notification]);
      if (notification.duration > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      }
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <span className="notification-icon">
            {notification.type === "success" && "✓"}
            {notification.type === "error" && "✗"}
            {notification.type === "warning" && "⚠"}
            {notification.type === "info" && "ℹ"}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}>×</button>
        </div>
      ))}
    </div>
  );
};

