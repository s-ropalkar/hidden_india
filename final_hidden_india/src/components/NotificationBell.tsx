/**

 * @license

 * SPDX-License-Identifier: Apache-2.0

 */



import React, { useEffect, useState } from 'react';

import { Bell, CheckCircle, Package, Ticket, X, ShieldCheck, AlertCircle } from 'lucide-react';

import * as api from '../api';



interface NotificationBellProps {

  onNavigateProfile?: () => void;

  onViewAll?: () => void;

}



export default function NotificationBell({ onNavigateProfile, onViewAll }: NotificationBellProps) {

  const [open, setOpen] = useState(false);

  const [unread, setUnread] = useState(0);

  const [items, setItems] = useState<api.AppNotification[]>([]);



  const load = () => {

    api.getNotifications().then((data) => {

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

    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  };



  const iconFor = (type: string) => {

    if (type === 'order') return <Package size={14} className="text-emerald-700" />;

    if (type === 'workshop') return <Ticket size={14} className="text-indigo-700" />;

    if (type === 'application') return <ShieldCheck size={14} className="text-primary" />;

    return <CheckCircle size={14} className="text-primary" />;

  };



  return (

    <div className="relative">

      <button

        type="button"

        onClick={() => { setOpen(!open); if (!open) load(); }}

        className="relative text-primary p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"

        aria-label="Notifications"

      >

        <Bell size={20} />

        {unread > 0 && (

          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary text-on-primary text-[9px] font-bold rounded-full flex items-center justify-center">

            {unread > 9 ? '9+' : unread}

          </span>

        )}

      </button>



      {open && (

        <>

          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] bg-surface border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">

              <h4 className="font-serif text-sm font-bold text-on-surface">Notification Center</h4>

              <div className="flex items-center gap-2">

                {unread > 0 && (

                  <button type="button" onClick={markRead} className="text-[10px] font-bold text-primary uppercase">

                    Mark read

                  </button>

                )}

                <button type="button" onClick={() => setOpen(false)} className="text-on-surface-variant">

                  <X size={14} />

                </button>

              </div>

            </div>

            <div className="max-h-72 overflow-y-auto">

              {items.length === 0 ? (

                <p className="text-xs text-on-surface-variant italic p-4 text-center flex items-center justify-center gap-2">

                  <AlertCircle size={14} /> No notifications yet.

                </p>

              ) : (

                items.map((n) => (

                  <div

                    key={n.id}

                    className={`px-4 py-3 border-b border-outline-variant/10 flex gap-2.5 ${!n.read ? 'bg-primary-container/10' : ''}`}

                  >

                    <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>

                    <div>

                      <p className="font-sans text-xs font-bold text-on-surface">{n.title}</p>

                      <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 leading-snug">{n.message}</p>

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

                className="w-full text-center text-[10px] font-bold uppercase text-primary py-2.5 hover:bg-surface-container-high border-t border-outline-variant/10"

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


