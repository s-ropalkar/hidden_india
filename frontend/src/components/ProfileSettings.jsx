import React, { useState, useEffect } from 'react';
import {
  User, Bookmark, Clock, LogOut, ChevronRight, Sparkles, Check, Trash2,
  Ticket, Heart, ShoppingBag, Package, Bell, CheckCircle, Shield, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import BottomNav from './BottomNav';

export default function ProfileSettings({ onNavigate, userName, userEmail, userAvatar, onLogout }) {
  const { user, refreshUser } = useAuth();
  const [activeItem, setActiveItem] = useState(() => localStorage.getItem('profileTab') || 'Personal Information');
  const [geoFocus, setGeoFocus] = useState(user?.geographicFocus || '');
  const [interests, setInterests] = useState(user?.interests?.length ? user.interests : ['Textile Arts', 'Ceramics', 'Warli Paintings']);
  const [successMsg, setSuccessMsg] = useState('');
  const [displayName, setDisplayName] = useState(userName);

  const [userBookedWorkshops, setUserBookedWorkshops] = useState([]);
  const [attendedWorkshops, setAttendedWorkshops] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setDisplayName(userName);
    if (user?.geographicFocus) setGeoFocus(user.geographicFocus);
    if (user?.interests?.length) setInterests(user.interests);
  }, [userName, user]);

  useEffect(() => {
    const tab = localStorage.getItem('profileTab');
    if (tab) { setActiveItem(tab); localStorage.removeItem('profileTab'); }
  }, []);

  useEffect(() => {
    api.getMyWorkshops().then(({ upcoming, attended }) => {
      setUserBookedWorkshops(upcoming);
      setAttendedWorkshops(attended);
    }).catch(() => { setUserBookedWorkshops([]); setAttendedWorkshops([]); });

    api.getSavedItems()
      .then(items => setSavedItems(items.filter(i => i.savedType === 'product')))
      .catch(() => setSavedItems([]));

    api.getMyOrders().then(setMyOrders).catch(() => setMyOrders([]));

    api.getNotifications().then(data => {
      setNotifications(data.items);
      setUnreadCount(data.unread);
    }).catch(() => { setNotifications([]); setUnreadCount(0); });
  }, []);

  const notifIcon = (type) => {
    if (type === 'order') return <Package size={16} className="text-emerald" />;
    if (type === 'workshop') return <Ticket size={16} className="text-indigo" />;
    if (type === 'application') return <Shield size={16} className="text-primary" />;
    return <CheckCircle size={16} className="text-primary" />;
  };

  const markAllRead = async () => {
    await api.markNotificationsRead().catch(() => {});
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeItem = async (id, savedType = 'product') => {
    try {
      await api.unsaveItem(savedType, id);
    } catch {}
    setSavedItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name: displayName, geographicFocus: geoFocus, interests });
      await refreshUser();
      setSuccessMsg('Identity tapestry saved successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const menuItems = [
    { id: 'Personal Information', icon: User },
    { id: 'Saved Artifacts', icon: Bookmark },
    { id: 'My Orders', icon: ShoppingBag },
    { id: 'Workshop Bookings', icon: Ticket },
    { id: 'Notifications', icon: Bell },
    { id: 'Log Out', icon: LogOut, isRed: true },
  ];

  return (
    <div className="profile-root">
      {/* Header */}
      <header className="topbar topbar--left-right">
        <span onClick={() => onNavigate('personalized-dashboard')} className="topbar-brand">
          Heritage Collective
        </span>
        <div className="topbar-right">
          <span onClick={() => onNavigate('explore-map')} className="topbar-link hidden-mobile">Explore Map</span>
          <div className="topbar-avatar">
            <img src={userAvatar} alt="User" />
          </div>
        </div>
      </header>

      <main className="profile-main">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'Log Out') { onLogout?.(); onNavigate('join-heritage'); }
                  else setActiveItem(item.id);
                }}
                className={`sidebar-btn ${isActive ? 'sidebar-btn--active' : ''} ${item.isRed ? 'sidebar-btn--red' : ''}`}
              >
                <span className="sidebar-btn-inner">
                  <Icon size={14} />
                  <span>{item.id}</span>
                </span>
                {!isActive && !item.isRed && <ChevronRight size={12} className="opacity-40" />}
              </button>
            );
          })}
        </aside>

        {/* Content area */}
        <section className="profile-content">
          <div className="mb-4">
            <h2 className="page-title">Namaste, {userName}</h2>
            <p className="text-muted-sm">Manage your collection, update your personal tapestry, and review your custodian status.</p>
          </div>

          {/* Artisan invite banner */}
          <div className="artisan-invite-banner">
            <div>
              <div className="banner-eyebrow"><Sparkles size={16} /> Heritage Custodian Program</div>
              <h3 className="banner-title">Are you an artist preserving ancient traditions?</h3>
              <p className="text-muted-sm">Connect with digital galleries, manage workshop registrations, and receive master patron credentials directly.</p>
            </div>
            <button onClick={() => onNavigate('artisan-application')} className="btn-primary whitespace-nowrap">
              Request to Become an Artisan
            </button>
          </div>

          {/* Personal Information */}
          {activeItem === 'Personal Information' && (
            <div className="panel">
              <h3 className="panel-title"><User size={18} className="text-primary" /> Account Identity</h3>
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Display Name</label>
                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" defaultValue={userEmail} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Geographic Focus</label>
                    <input type="text" value={geoFocus} onChange={e => setGeoFocus(e.target.value)} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Interest Tags</label>
                    <div className="tag-row mt-1">
                      {interests.map(i => (
                        <span
                          key={i}
                          onClick={() => setInterests(interests.filter(t => t !== i))}
                          className="tag tag--removable"
                        >
                          {i} &times;
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => { const v = prompt('Enter a new craft interest:'); if (v) setInterests([...interests, v]); }}
                        className="tag tag--add"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-footer">
                  <span className="text-primary italic text-sm">{successMsg}</span>
                  <button type="submit" className="btn-primary">Save Identity Changes</button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Artifacts */}
          {activeItem === 'Saved Artifacts' && (
            <div className="panel">
              <h3 className="panel-title"><Heart size={18} className="text-primary" /> Wishlist</h3>
              {savedItems.length === 0 ? (
                <div className="empty-state">Your wishlist is empty. Tap the heart on any artifact to save it here.</div>
              ) : (
                <div className="saved-grid">
                  {savedItems.map(item => (
                    <div key={item.id} className="saved-card">
                      <div className="saved-img-wrap">
                        <img src={item.img} alt={item.name} className="saved-img" />
                        <span className="saved-price-badge">{item.price}</span>
                      </div>
                      <h4 className="saved-name">{item.name}</h4>
                      <p className="saved-craft">{item.craft}</p>
                      <div className="saved-footer">
                        <p className="text-muted-sm">{item.origin}</p>
                        <button onClick={() => removeItem(item.id)} className="remove-btn">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Orders */}
          {activeItem === 'My Orders' && (
            <div className="panel">
              <h3 className="panel-title"><Package size={18} className="text-primary" /> My Orders</h3>
              <p className="text-muted-sm mb-4">Products you have purchased appear here.</p>
              {myOrders.length === 0 ? (
                <div className="empty-state">No orders yet. Buy an artifact from the home dashboard.</div>
              ) : (
                <div className="orders-list">
                  {myOrders.map(order => (
                    <div key={order.id} className="order-card">
                      {order.product?.image && (
                        <div className="order-img-wrap">
                          <img src={order.product.image} alt={order.product.name} className="order-img" />
                        </div>
                      )}
                      <div className="order-info">
                        <div className="order-name-row">
                          <h4 className="order-name">{order.product?.name || 'Product'}</h4>
                          <span className="badge badge-green">{order.status}</span>
                        </div>
                        <p className="text-muted-sm">Qty: {order.quantity} · {order.product?.state || 'India'}</p>
                        <p className="text-muted-sm">
                          Ordered {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <span className="order-total">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeItem === 'Notifications' && (
            <div className="panel">
              <div className="panel-title-row">
                <h3 className="panel-title"><Bell size={18} className="text-primary" /> Notification Center</h3>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllRead} className="link-btn-small">Mark all read</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state"><AlertCircle size={20} className="opacity-50" /> No notifications yet.</div>
              ) : (
                <div className="notif-full-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-full-item ${!n.read ? 'notif-full-item--unread' : ''}`}>
                      <div>{notifIcon(n.type)}</div>
                      <div className="notif-full-body">
                        <div className="notif-full-title-row">
                          <p className="fw-bold">{n.title}</p>
                          {!n.read && <span className="badge badge-primary">New</span>}
                        </div>
                        <p className="text-muted-sm">{n.message}</p>
                        {n.createdAt && (
                          <p className="text-tiny">{new Date(n.createdAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workshop Bookings */}
          {activeItem === 'Workshop Bookings' && (
            <div className="panel">
              <h3 className="panel-title"><Ticket size={18} className="text-primary" /> Registered Workshops</h3>
              {userBookedWorkshops.length === 0 ? (
                <div className="empty-state">No upcoming workshop registrations.</div>
              ) : (
                <div className="orders-list">
                  {userBookedWorkshops.map(ws => (
                    <div key={ws.id} className="order-card">
                      <div className="order-info">
                        <div className="order-name-row">
                          <h4 className="order-name">{ws.name}</h4>
                          <span className={`badge ${ws.mode === 'online' ? 'badge-indigo' : 'badge-green'}`}>{ws.mode}</span>
                          <span className="badge badge-amber">{ws.status}</span>
                        </div>
                        <p className="text-muted-sm">Instructor: <strong>{ws.host}</strong></p>
                        <p className="text-muted-sm">{ws.date} | {ws.time}</p>
                        {ws.mode !== 'online' && ws.venue && (
                          <p className="text-muted-sm">Venue: {ws.venue}</p>
                        )}
                      </div>
                      <span className="order-total">{ws.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="panel-title mt-6"><Clock size={18} className="text-primary" /> Attended Workshops History</h3>
              <p className="text-muted-sm mb-3">Sessions appear here after the artisan marks them complete.</p>
              {attendedWorkshops.length === 0 ? (
                <div className="empty-state">No attended workshops yet.</div>
              ) : (
                <div className="orders-list">
                  {attendedWorkshops.map(ws => (
                    <div key={ws.id} className="order-card order-card--muted">
                      <div className="order-info">
                        <div className="order-name-row">
                          <h4 className="order-name">{ws.name}</h4>
                          <span className="badge badge-green">Attended</span>
                        </div>
                        <p className="text-muted-sm">Instructor: {ws.host}</p>
                        <p className="text-muted-sm">{ws.date} | {ws.time}</p>
                      </div>
                      <span className="order-total text-muted">{ws.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="profile" onNavigate={onNavigate} showSaved={false} />
    </div>
  );
}
