/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Sparkles, ShieldAlert, Award, Calendar, CheckSquare } from 'lucide-react';
import { ScreenId, Workshop } from '../types';
import * as api from '../api';

interface WorkshopDetailProps {
  onNavigate: (screen: ScreenId) => void;
  onSetBookedWorkshop: (title: string, instructor: string, date: string, time: string, venue: string) => void;
}

export default function WorkshopDetail({ onNavigate, onSetBookedWorkshop }: WorkshopDetailProps) {
  const [selectedSession, setSelectedSession] = useState('session-1');
  const [bookingDate, setBookingDate] = useState('Saturday, Oct 24');
  const [workshop, setWorkshop] = useState<(Workshop & {
    seatsTotal?: number;
    seatsRegistered?: number;
    seatsAvailable?: number;
    isRegistered?: boolean;
  }) | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const activeId = localStorage.getItem('selectedWorkshopId');
    const load = async (id: string) => {
      try {
        const ws = await api.getWorkshop(id);
        setWorkshop(ws);
        if (ws.date) setBookingDate(ws.date);
      } catch {
        const list = await api.getWorkshops();
        const fallback = list.find((w) => w.id === id) || list[0] || null;
        setWorkshop(fallback);
      }
    };
    if (!activeId) {
      api.getWorkshops().then((list) => list[0] && setWorkshop(list[0]));
      return;
    }
    load(activeId);
  }, []);

  const handleBook = async () => {
    if (!workshop || workshop.isRegistered || (workshop.seatsAvailable ?? 1) <= 0) return;
    setBooking(true);
    setBookingError('');
    const bookingTime = selectedSession === 'session-1' ? workshop.time : '2:30 PM - 5:30 PM';

    try {
      await api.registerWorkshop(workshop.id, selectedSession);
      onSetBookedWorkshop(workshop.title, workshop.instructor, bookingDate, bookingTime, workshop.venue);
      onNavigate('workshop-confirmation');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setBookingError(msg);
      if (msg.toLowerCase().includes('already')) {
        setWorkshop((w) => (w ? { ...w, isRegistered: true } : w));
      }
    } finally {
      setBooking(false);
    }
  };

  const seatsTotal = workshop?.seatsTotal ?? 20;
  const seatsRegistered = workshop?.seatsRegistered ?? 0;
  const seatsRemaining = workshop?.seatsAvailable ?? Math.max(0, seatsTotal - seatsRegistered);
  const isFull = seatsRemaining <= 0;
  const isRegistered = workshop?.isRegistered ?? false;

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-primary animate-pulse">Loading workshop...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-32 w-full">
      
      {/* Detail Panoramic Image Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden select-none">
        <img 
          className="w-full h-full object-cover" 
          src={workshop.thumbnail} 
          alt={workshop.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent"></div>
        <button 
          onClick={() => onNavigate('personalized-dashboard')}
          className="absolute top-4 left-4 p-2.5 bg-white/95 text-primary hover:bg-[#a33d1f] hover:text-white rounded-full transition-all cursor-pointer shadow"
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Workshop Description & Instructor details */}
        <section className="lg:col-span-8 space-y-8">
          <div className="space-y-3">
            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold tracking-widest px-3.5 py-1 rounded-full inline-block leading-none">
              Traditional {workshop.category}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-on-surface leading-tight tracking-tight">
              {workshop.title}
            </h1>
            
              <div className="flex flex-wrap items-center gap-4.5 text-xs text-on-surface-variant font-medium pt-1">
              <div className="flex items-center gap-1.5"><MapPin size={14} /> {workshop.venue}</div>
              <div className="flex items-center gap-1.5"><Clock size={14} /> {workshop.time || '3 Hours'}</div>
            </div>
          </div>

          {/* Instructor Bio Profile badge */}
          <div className="bg-surface border border-outline-variant/30 p-5 rounded-2xl flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-primary shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src={workshop.instructorAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuB4j93Z4oxaP_4lpblntiom2aeXeu0KcsxtjvI9UNg3j2wiX588u0GLQ90IFO7Gqq-rewXgpFDlE1Ia0CTL23Qs3lUg6TOiwKUj_-yLJxRpHyXDgsmsyUW561XlVFlj-5NKOpK9fGH7EOgTefThy8KUnmX7B_HOIA2RHxFJ0r7-E8JujEDDnAyAtemUEeYYN_W7_vZ50uuprPlMQP3dk2o1rlUnHNWZjophVQZ2MIjC9c5_tRFOHGheW0BHwtkK79esU8kk4H_6_j8"} 
                alt={workshop.instructor} 
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-primary">
                <Award size={14} />
                <span className="font-sans font-extrabold text-[9px] uppercase tracking-wider">National Award Recipient</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface mt-0.5">Led by {workshop.instructor}</h3>
              <p className="font-sans text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Revered exponent preserving traditional heritage crafts, utilizing authentic vegetable color pigments with dedicated structural geometries.
              </p>
            </div>
          </div>

          {/* Structured checklist: "What you'll learn" */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface">What you'll learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Traditional formulation matching mineral pigments and natural binding gums.',
                'Freehand sketching and block-tracing displaying deep historical motives.',
                'Oxide painting application and high-precision stroke sequences.',
                'Maintenance and curation techniques to protect original art compositions.'
              ].map((item, index) => (
                <div key={index} className="flex gap-3.5 items-start p-3 bg-surface border border-outline-variant/15 rounded-xl">
                  <CheckSquare size={16} className="text-primary shrink-0 mt-0.5" />
                  <span className="font-sans text-xs text-on-surface-variant leading-relaxed font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Materials provided */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface">Materials provided</h3>
            <ul className="list-disc pl-5 font-sans text-xs text-on-surface-variant space-y-2 leading-relaxed font-semibold font-sans">
              <li>Pre-prepared authentic baseline mediums ready for painting.</li>
              <li>Natural mineral paint kits including organic leaf brush outline tracers.</li>
              <li>Traditional fine-tip detailing calligraphic sketching brushes.</li>
              <li>Exclusive community certificates of masterclass completion.</li>
            </ul>
          </div>
        </section>

        {/* Right column: Dynamic reservation widget booking list */}
        <section className="lg:col-span-4 bg-surface-container-low border-2 border-primary/10 rounded-2xl p-6 shadow-md space-y-6 relative overflow-hidden">
          {/* Subtle paper pattern layout underlay */}
          <div className="absolute inset-0 parchment-texture opacity-25 pointer-events-none -z-10"></div>
          
          <div className="border-b border-outline-variant/35 pb-4">
            <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold">Price Per Guardian</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-serif font-bold text-primary">{workshop.price}</span>
              <span className="text-xs font-sans text-on-surface-variant">/ individual</span>
            </div>
          </div>

          {/* Seat availability */}
          <div className={`border p-3.5 rounded-xl flex items-start gap-3 ${isFull ? 'bg-error-container border-error/15' : 'bg-surface-container-low border-outline-variant/20'}`}>
            <ShieldAlert size={18} className={`shrink-0 mt-0.5 ${isFull ? 'text-error' : 'text-primary'}`} />
            <div className="space-y-2 w-full">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">
                {isRegistered ? 'Already Registered' : isFull ? 'Fully Booked' : `${seatsRemaining} Seats Remaining`}
              </h4>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-sans">
                <div className="bg-surface border border-outline-variant/20 rounded-lg p-2 text-center">
                  <span className="block text-on-surface-variant uppercase font-bold">Total</span>
                  <span className="block text-sm font-bold text-on-surface mt-0.5">{seatsTotal}</span>
                </div>
                <div className="bg-surface border border-outline-variant/20 rounded-lg p-2 text-center">
                  <span className="block text-on-surface-variant uppercase font-bold">Registered</span>
                  <span className="block text-sm font-bold text-on-surface mt-0.5">{seatsRegistered}</span>
                </div>
                <div className="bg-surface border border-outline-variant/20 rounded-lg p-2 text-center">
                  <span className="block text-on-surface-variant uppercase font-bold">Remaining</span>
                  <span className="block text-sm font-bold text-primary mt-0.5">{seatsRemaining}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Selector dropdown dropdown simulation */}
          <div className="space-y-2">
            <label className="block font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Select Date Event</label>
            <div className="relative">
              <select 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-surface-container border-b border-outline-variant focus:border-primary px-3.5 py-3 text-on-surface text-xs font-sans rounded font-bold uppercase tracking-wider cursor-pointer outline-none"
              >
                <option value={workshop.date}>{workshop.date || 'Scheduled date'} • {workshop.venue || 'Studio'}</option>
              </select>
            </div>
          </div>

          {/* Available Sessions selections */}
          <div className="space-y-2.5">
            <label className="block font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Available Sessions</label>
            <div className="space-y-2.5">
              {[
                { id: 'session-1', label: 'Scheduled Session', time: workshop.time || '10:00 AM - 1:00 PM', slots: `${seatsRemaining} seats left` },
              ].map((sess) => {
                const isSelected = selectedSession === sess.id;
                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setSelectedSession(sess.id)}
                    className={`w-full text-left p-3.5 border transition-all rounded-xl cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary-container/10 ring-1 ring-primary' 
                        : 'border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-sans font-bold text-xs text-on-surface block">{sess.label}</span>
                      <span className="font-sans text-[10px] text-[#ac4425] font-bold block">{sess.slots}</span>
                    </div>
                    <span className="font-sans text-xs text-on-surface-variant font-medium block mt-1">{sess.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Spots reservation buttons */}
          <div className="pt-2">
            {bookingError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{bookingError}</p>
            )}
            <button
              onClick={handleBook}
              disabled={booking || isFull || isRegistered}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#a33d1f] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Calendar size={14} />
              {booking
                ? 'Registering...'
                : isRegistered
                  ? 'Already Registered'
                  : isFull
                    ? 'Fully Booked'
                    : 'Register (RSVP Now)'}
            </button>
            <p className="text-center font-sans text-[10px] text-on-surface-variant font-medium mt-3 italic">
              Status updates instantly to: "Registration Submitted" in your profile dashboard catalog!
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}
