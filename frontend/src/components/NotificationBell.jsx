import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Package, Ticket, X, ShieldCheck, AlertCircle } from 'lucide-react';
import * as api from '../api';

export default function NotificationBell({ onNavigateProfile, onViewAll }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);

  const load = () => {
    api.getNotifications().then(data => {
      setUnread(data.unread);
      setItems(data.items);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const markRead = async () => {
    await api.markNotificationsRead().catch(() => {});
    setUnread(0);
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const iconFor = (type) => {
    if (type === 'order') return <Package size={14} className="text-emerald" />;
    if (type === 'workshop') return <Ticket size={14} className="text-indigo" />;
    if (type === 'application') return <ShieldCheck size={14} className="text-primary" />;
    return <CheckCircle size={14} className="text-primary" />;
  };

  return (
    <div className="notif-wrap">
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="notif-bell-btn"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-dropdown">
            <div className="notif-header">
              <h4 className="notif-header-title">Notification Center</h4>
              <div className="notif-header-actions">
                {unread > 0 && (
                  <button type="button" onClick={markRead} className="link-btn-small">
                    Mark read
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="icon-btn">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="notif-list">
              {items.length === 0 ? (
                <p className="notif-empty">
                  <AlertCircle size={14} /> No notifications yet.
                </p>
              ) : (
                items.map(n => (
                  <div key={n.id} className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}>
                    <div className="notif-item-icon">{iconFor(n.type)}</div>
                    <div>
                      <p className="notif-item-title">{n.title}</p>
                      <p className="notif-item-msg">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {(onViewAll || onNavigateProfile) && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (onViewAll) onViewAll();
                  else if (onNavigateProfile) onNavigateProfile();
                }}
                className="notif-view-all"
              >
                View all notifications
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
