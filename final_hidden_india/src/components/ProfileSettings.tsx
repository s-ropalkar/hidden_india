/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Bookmark, Clock, LogOut, 
  ChevronRight, Sparkles, Check, Trash2,
  Ticket, Heart, ShoppingBag, Package, Bell, CheckCircle, Shield, AlertCircle
} from 'lucide-react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import BottomNav from './BottomNav';

interface ProfileSettingsProps {
  onNavigate: (screen: ScreenId) => void;
  userName: string;
  userEmail: string;
  userAvatar: string;
  onLogout?: () => void;
}

interface SavedItem {
  id: string;
  name: string;
  craft: string;
  origin: string;
  price: string;
  img: string;
}

export default function ProfileSettings({ onNavigate, userName, userEmail, userAvatar, onLogout }: ProfileSettingsProps) {
  const { user, refreshUser } = useAuth();
  const [activeItem, setActiveItem] = useState(() => localStorage.getItem('profileTab') || 'Personal Information');
  const [geoFocus, setGeoFocus] = useState(user?.geographicFocus || 'Maharashtra & Western Ghats');
  const [interests, setInterests] = useState<string[]>(user?.interests?.length ? user.interests : ['Textile Arts', 'Ceramics', 'Warli Paintings']);
  const [successMsg, setSuccessMsg] = useState('');
  const [displayName, setDisplayName] = useState(userName);

  const [userBookedWorkshops, setUserBookedWorkshops] = useState<api.UserWorkshopBooking[]>([]);
  const [attendedWorkshops, setAttendedWorkshops] = useState<api.UserWorkshopBooking[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [myOrders, setMyOrders] = useState<Awaited<ReturnType<typeof api.getMyOrders>>>([]);
  const [notifications, setNotifications] = useState<api.AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setDisplayName(userName);
    if (user?.geographicFocus) setGeoFocus(user.geographicFocus);
    if (user?.interests?.length) setInterests(user.interests);
  }, [userName, user]);

  useEffect(() => {
    const tab = localStorage.getItem('profileTab');
    if (tab) {
      setActiveItem(tab);
      localStorage.removeItem('profileTab');
    }
  }, []);

  useEffect(() => {
    api.getMyWorkshops().then(({ upcoming, attended }) => {
      setUserBookedWorkshops(upcoming);
      setAttendedWorkshops(attended);
    }).catch(() => {
      setUserBookedWorkshops([]);
      setAttendedWorkshops([]);
    });
    api.getSavedItems()
      .then((items) => setSavedItems(items.filter((i) => i.savedType === 'product')))
      .catch(() => setSavedItems([]));
    api.getMyOrders().then(setMyOrders).catch(() => setMyOrders([]));
    api.getNotifications().then((data) => {
      setNotifications(data.items);
      setUnreadCount(data.unread);
    }).catch(() => {
      setNotifications([]);
      setUnreadCount(0);
    });
  }, []);

  const notificationIcon = (type: string) => {
    if (type === 'order') return <Package size={16} className="text-emerald-700" />;
    if (type === 'workshop') return <Ticket size={16} className="text-indigo-700" />;
    if (type === 'application') return <Shield size={16} className="text-primary" />;
    return <CheckCircle size={16} className="text-primary" />;
  };

  const markAllNotificationsRead = async () => {
    await api.markNotificationsRead().catch(() => {});
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeSavedItem = async (id: string, savedType = 'product') => {
    try {
      await api.unsaveItem(savedType, id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name: displayName, geographicFocus: geoFocus, interests });
      await refreshUser();
      setSuccessMsg('Identity tapestry saved successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="bg-background text-on-background font-sans relative pb-28 min-h-screen select-none w-full text-left">
      {/* Profile Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span 
            onClick={() => onNavigate('personalized-dashboard')}
            className="font-serif text-xl text-primary font-semibold tracking-tight cursor-pointer"
          >
            Heritage Collective
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span 
            onClick={() => onNavigate('explore-map')}
            className="hidden md:inline font-sans font-bold text-xs uppercase tracking-wider text-[#4c5b7e] hover:text-primary cursor-pointer pb-0.5"
          >
            Explore Map
          </span>
          <div className="w-9 h-9 rounded-full bg-surface-container overflow-hidden border border-primary">
            <img alt="User avatar" className="w-[102%] h-[102%] object-cover" src={userAvatar} />
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side menu for Account Panels */}
        <section className="lg:col-span-3 bg-surface-container-low border border-outline/10 rounded-xl overflow-hidden p-2.5 space-y-1 shadow-sm">
          {[
            { id: 'Personal Information', name: 'Personal Information', icon: User },
            { id: 'Saved Artifacts', name: 'Saved Artifacts', icon: Bookmark },
            { id: 'My Orders', name: 'My Orders', icon: ShoppingBag },
            { id: 'Workshop Bookings', name: 'Workshop Bookings', icon: Ticket },
            { id: 'Notifications', name: 'Notifications', icon: Bell },
            { id: 'Log Out', name: 'Log Out', icon: LogOut, isRed: true }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'Log Out') {
                    onLogout?.();
                    onNavigate('join-heritage');
                  } else {
                    setActiveItem(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-on-primary' 
                    : item.isRed 
                      ? 'text-error hover:bg-error-container/20' 
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={14} />
                  <span>{item.name}</span>
                </div>
                {!isActive && !item.isRed && <ChevronRight size={12} className="opacity-50" />}
              </button>
            );
          })}
        </section>

        {/* Right Side form Details */}
        <section className="lg:col-span-9 space-y-8">
          {/* Welcome intro */}
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-1 tracking-tight text-on-surface">Namaste, {userName}</h2>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Manage your collection, update your personal tapestry, and review your custodian status.
            </p>
          </div>

          {/* Invitation banner requesting to verify artisan */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden warli-pattern shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1.5 z-10 max-w-[480px]">
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles size={16} />
                <span className="font-sans font-extrabold text-[10px] uppercase tracking-widest">Heritage Custodian Program</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface leading-snug">Are you an artist preserving ancient traditions?</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Connect with digital galleries, manage workshop registrations, and receive master patron credentials directly.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('artisan-application')}
              className="bg-primary text-on-primary font-sans font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#a33d1f] transition-all cursor-pointer shadow whitespace-nowrap z-10"
            >
              Request to Become an Artisan
            </button>
          </div>

          {/* DYNAMIC CONTENT PANELS (Small scale but fully-designed to never be blank!) */}
          
          {/* 1. PERSONAL DETAILS TAB */}
          {activeItem === 'Personal Information' && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-on-surface border-b border-outline-variant/25 pb-3 flex items-center gap-2">
                <User size={18} className="text-primary" /> Account Identity
              </h3>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                      Full Display Name
                    </label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 px-3.5 py-2.5 text-on-surface text-sm rounded outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      defaultValue={userEmail}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 px-3.5 py-2.5 text-on-surface text-sm rounded outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                      Geographic Focus
                    </label>
                    <input 
                      type="text" 
                      value={geoFocus}
                      onChange={(e) => setGeoFocus(e.target.value)}
                      className="w-full bg-surface-container-high border-b border-outline-variant focus:border-primary focus:ring-0 px-3.5 py-2.5 text-on-surface text-sm rounded outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                      Primary Interest Tags
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {interests.map(i => (
                        <span 
                          key={i} 
                          onClick={() => setInterests(interests.filter(tag => tag !== i))}
                          className="bg-primary/10 hover:bg-red-100 text-primary hover:text-red-700 font-sans font-semibold text-[10px] py-1 px-3 uppercase tracking-wider rounded-lg cursor-pointer transition-all"
                        >
                          {i} &times;
                        </span>
                      ))}
                      <button 
                        type="button"
                        onClick={() => {
                          const val = prompt('Enter a new craft interest tagging:');
                          if (val) setInterests([...interests, val]);
                        }}
                        className="bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant font-sans font-extrabold text-[10px] py-1 px-3 uppercase tracking-wider rounded-lg"
                      >
                        + Add Tab
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-5">
                  <span className="text-xs text-primary font-serif font-semibold italic">{successMsg}</span>
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-[#a33d1f] text-on-primary font-sans font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg cursor-pointer transition-colors shadow"
                  >
                    Save Identity Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. SAVED ARTIFACTS TAB ("security & trap" references removed as requested!) */}
          {activeItem === 'Saved Artifacts' && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-on-surface border-b border-outline-variant/25 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><Heart size={18} className="text-primary" /> Wishlist</span>
                <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold">Saved for later</span>
              </h3>

              {savedItems.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant italic text-sm">
                  Your wishlist is empty. Tap the heart on any artifact in the home dashboard to save it here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {savedItems.map((item) => (
                    <div key={item.id} className="flex flex-col bg-surface border border-outline-variant/15 p-3 rounded-xl hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-surface-container rounded-lg overflow-hidden mb-3.5 relative">
                        <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white font-sans font-bold text-[9px] px-2 py-0.5 rounded">
                          {item.price}
                        </span>
                      </div>
                      <h4 className="font-serif text-[14px] font-bold text-on-surface leading-tight mb-0.5">{item.name}</h4>
                      <p className="font-sans text-[10px] text-primary leading-none font-bold uppercase tracking-wider mb-2">{item.craft}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/10">
                        <p className="font-sans text-[10px] text-on-surface-variant">{item.origin}</p>
                        <button 
                          onClick={() => removeSavedItem(item.id)}
                          className="text-error hover:text-red-700 text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeItem === 'My Orders' && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-on-surface border-b border-outline-variant/25 pb-3 flex items-center gap-2">
                <Package size={18} className="text-primary" /> My Orders
              </h3>
              <p className="font-sans text-xs text-on-surface-variant -mt-3">Products you have purchased appear here — not wishlisted items.</p>

              {myOrders.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant italic text-sm">
                  No orders yet. Buy an artifact from the home dashboard to see it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-outline-variant/15 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
                      {order.product?.image && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                          <img className="w-full h-full object-cover" src={order.product.image} alt={order.product.name} />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif text-sm font-bold text-on-surface">{order.product?.name || 'Product'}</h4>
                          <span className="text-[8px] font-sans font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {order.status}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-on-surface-variant mt-1">
                          Qty: {order.quantity} · {order.product?.state || 'India'}
                        </p>
                        <p className="font-sans text-[10px] text-on-surface-variant mt-0.5">
                          Ordered {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-sans font-bold text-sm text-primary">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeItem === 'Notifications' && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/25 pb-3">
                <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
                  <Bell size={18} className="text-primary" /> Notification Center
                </h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant italic text-sm flex flex-col items-center gap-2">
                  <AlertCircle size={20} className="opacity-60" />
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`bg-surface border border-outline-variant/15 p-4 rounded-xl flex gap-3 ${!n.read ? 'border-primary/25 bg-primary-container/5' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-sans text-sm font-bold text-on-surface">{n.title}</p>
                          {!n.read && (
                            <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">{n.message}</p>
                        {n.createdAt && (
                          <p className="font-sans text-[10px] text-on-surface-variant/70 mt-2">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeItem === 'Workshop Bookings' && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-8">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface border-b border-outline-variant/25 pb-3 flex items-center gap-2">
                  <Ticket size={18} className="text-primary" /> Registered Workshops
                </h3>
                <div className="space-y-4 mt-4">
                  {userBookedWorkshops.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic py-6 text-center">No upcoming workshop registrations.</p>
                  ) : (
                    userBookedWorkshops.map((ws) => (
                      <div key={ws.id} className="bg-surface border border-outline-variant/15 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Ticket size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-serif text-sm font-bold text-on-surface">{ws.name}</h4>
                              <span className={`text-[8px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                ws.mode === 'online' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {ws.mode === 'online' ? 'Online' : 'Offline'}
                              </span>
                              <span className="text-[8px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {ws.status}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Instructor: <span className="text-primary font-semibold">{ws.host}</span></p>
                            <p className="font-sans text-[10px] text-on-surface-variant font-medium mt-1">{ws.date} | {ws.time}</p>
                            {ws.mode !== 'online' && ws.venue && (
                              <p className="font-sans text-[10px] text-on-surface-variant mt-0.5">Venue: {ws.venue}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-sans font-bold text-xs text-primary block">{ws.price}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface border-b border-outline-variant/25 pb-3 flex items-center gap-2">
                  <Clock size={18} className="text-primary" /> Attended Workshops History
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-2 font-sans">
                  Sessions appear here after the hosting artisan marks your registration as complete in their Bookings tab.
                </p>
                <div className="space-y-4 mt-4">
                  {attendedWorkshops.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic py-6 text-center">No attended workshops yet. Completed sessions will appear here.</p>
                  ) : (
                    attendedWorkshops.map((ws) => (
                      <div key={ws.id} className="bg-surface border border-outline-variant/15 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-90">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                            <Check size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-sm font-bold text-on-surface">{ws.name}</h4>
                              <span className="text-[8px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Attended
                              </span>
                            </div>
                            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Instructor: {ws.host}</p>
                            <p className="font-sans text-[10px] text-on-surface-variant font-medium mt-1">{ws.date} | {ws.time}</p>
                          </div>
                        </div>
                        <span className="font-sans font-bold text-xs text-on-surface-variant">{ws.price}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      <BottomNav active="profile" onNavigate={onNavigate} showSaved={false} />
    </div>
  );
}
