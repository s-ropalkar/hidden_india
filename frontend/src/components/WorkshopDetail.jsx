import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, ShieldAlert, Award, Calendar, CheckSquare } from 'lucide-react';
import * as api from '../api';

export default function WorkshopDetail({ onNavigate, onSetBookedWorkshop }) {
  const [selectedSession, setSelectedSession] = useState('session-1');
  const [bookingDate, setBookingDate] = useState('');
  const [workshop, setWorkshop] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const activeId = localStorage.getItem('selectedWorkshopId');

    const load = async (id) => {
      try {
        const ws = await api.getWorkshop(id);
        setWorkshop(ws);
        if (ws.date) setBookingDate(ws.date);
      } catch {
        try {
          const list = await api.getWorkshops();
          const fallback = list.find(w => w.id === id) || list[0] || null;
          setWorkshop(fallback);
          if (fallback?.date) setBookingDate(fallback.date);
        } catch {}
      }
    };

    if (!activeId) {
      api.getWorkshops().then(list => {
        if (list[0]) { setWorkshop(list[0]); if (list[0].date) setBookingDate(list[0].date); }
      }).catch(() => {});
      return;
    }
    load(activeId);
  }, []);

  const handleBook = async () => {
    if (!workshop || workshop.isRegistered || (workshop.seatsAvailable ?? 1) <= 0) return;
    setBooking(true);
    setBookingError('');
    const bookingTime = workshop.time;
    try {
      await api.registerWorkshop(workshop.id, selectedSession);
      onSetBookedWorkshop(workshop.title, workshop.instructor, bookingDate, bookingTime, workshop.venue);
      onNavigate('workshop-confirmation');
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setBookingError(msg);
      if (msg.toLowerCase().includes('already')) {
        setWorkshop(w => w ? { ...w, isRegistered: true } : w);
      }
    } finally {
      setBooking(false);
    }
  };

  if (!workshop) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Loading workshop...</p>
      </div>
    );
  }

  const seatsTotal = workshop.seatsTotal ?? 20;
  const seatsRegistered = workshop.seatsRegistered ?? 0;
  const seatsRemaining = workshop.seatsAvailable ?? Math.max(0, seatsTotal - seatsRegistered);
  const isFull = seatsRemaining <= 0;
  const isRegistered = workshop.isRegistered ?? false;

  return (
    <div className="page-root">
      {/* Banner */}
      <div className="workshop-banner">
        <img src={workshop.thumbnail} alt={workshop.title} className="workshop-banner-img" />
        <div className="workshop-banner-overlay" />
        <button onClick={() => onNavigate('personalized-dashboard')} className="status-back-btn">
          <ArrowLeft size={16} />
        </button>
      </div>

      <main className="workshop-detail-main">
        {/* Left column */}
        <section className="workshop-detail-left">
          <span className="badge badge-outline">Traditional {workshop.category}</span>
          <h1 className="workshop-detail-title">{workshop.title}</h1>
          <div className="workshop-detail-meta">
            <span><MapPin size={14} /> {workshop.venue}</span>
            <span><Clock size={14} /> {workshop.time || '3 Hours'}</span>
          </div>

          {/* Instructor */}
          <div className="instructor-card">
            <div className="instructor-avatar">
              <img
                src={workshop.instructorAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4j93Z4oxaP_4lpblntiom2aeXeu0KcsxtjvI9UNg3j2wiX588u0GLQ90IFO7Gqq-rewXgpFDlE1Ia0CTL23Qs3lUg6TOiwKUj_-yLJxRpHyXDgsmsyUW561XlVFlj-5NKOpK9fGH7EOgTefThy8KUnmX7B_HOIA2RHxFJ0r7-E8JujEDDnAyAtemUEeYYN_W7_vZ50uuprPlMQP3dk2o1rlUnHNWZjophVQZ2MIjC9c5_tRFOHGheW0BHwtkK79esU8kk4H_6_j8'}
                alt={workshop.instructor}
              />
            </div>
            <div>
              <div className="instructor-award"><Award size={14} /> National Award Recipient</div>
              <h3 className="instructor-name">Led by {workshop.instructor}</h3>
              <p className="text-muted-sm">Revered exponent preserving traditional heritage crafts, utilizing authentic vegetable color pigments.</p>
            </div>
          </div>

          {/* What you'll learn */}
          <div>
            <h3 className="section-title">What you&apos;ll learn</h3>
            <div className="learn-grid">
              {[
                'Traditional formulation matching mineral pigments and natural binding gums.',
                'Freehand sketching and block-tracing displaying deep historical motives.',
                'Oxide painting application and high-precision stroke sequences.',
                'Maintenance and curation techniques to protect original art compositions.'
              ].map((item, i) => (
                <div key={i} className="learn-item">
                  <CheckSquare size={16} className="text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <h3 className="section-title">Materials provided</h3>
            <ul className="materials-list">
              <li>Pre-prepared authentic baseline mediums ready for painting.</li>
              <li>Natural mineral paint kits including organic leaf brush outline tracers.</li>
              <li>Traditional fine-tip detailing calligraphic sketching brushes.</li>
              <li>Exclusive community certificates of masterclass completion.</li>
            </ul>
          </div>
        </section>

        {/* Right column — booking widget */}
        <section className="booking-widget">
          <div className="booking-price-block">
            <span className="label-xs">Price Per Guardian</span>
            <div className="booking-price-row">
              <span className="booking-price">{workshop.price}</span>
              <span className="text-muted-sm">/ individual</span>
            </div>
          </div>

          {/* Seats */}
          <div className={`seats-block ${isFull ? 'seats-block--full' : ''}`}>
            <ShieldAlert size={18} className={isFull ? 'text-error' : 'text-primary'} />
            <div className="seats-info">
              <h4 className="seats-title">
                {isRegistered ? 'Already Registered' : isFull ? 'Fully Booked' : `${seatsRemaining} Seats Remaining`}
              </h4>
              <div className="seats-grid">
                <div className="seat-stat"><span>Total</span><span>{seatsTotal}</span></div>
                <div className="seat-stat"><span>Registered</span><span>{seatsRegistered}</span></div>
                <div className="seat-stat"><span>Remaining</span><span className="text-primary">{seatsRemaining}</span></div>
              </div>
            </div>
          </div>

          {/* Date selector */}
          <div className="form-group">
            <label className="form-label">Select Date Event</label>
            <select
              value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              className="form-input"
            >
              <option value={workshop.date}>{workshop.date || 'Scheduled date'} · {workshop.venue || 'Studio'}</option>
            </select>
          </div>

          {/* Sessions */}
          <div className="form-group">
            <label className="form-label">Available Sessions</label>
            <button
              type="button"
              onClick={() => setSelectedSession('session-1')}
              className={`session-btn ${selectedSession === 'session-1' ? 'session-btn--active' : ''}`}
            >
              <div className="session-btn-row">
                <span className="fw-bold">Scheduled Session</span>
                <span className="text-primary text-xs fw-bold">{seatsRemaining} seats left</span>
              </div>
              <span className="text-muted-sm">{workshop.time || '10:00 AM – 1:00 PM'}</span>
            </button>
          </div>

          {bookingError && <div className="alert alert-error">{bookingError}</div>}

          <button
            onClick={handleBook}
            disabled={booking || isFull || isRegistered}
            className="btn-primary btn-full btn-lg"
          >
            <Calendar size={14} />
            {booking ? 'Registering...' : isRegistered ? 'Already Registered' : isFull ? 'Fully Booked' : 'Register (RSVP Now)'}
          </button>
          <p className="text-tiny text-center italic mt-2">
            Status updates instantly to your profile dashboard!
          </p>
        </section>
      </main>
    </div>
  );
}
