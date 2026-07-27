import React from 'react';
import { CheckCircle2, Calendar, MapPin, User, ChevronRight, Sparkles } from 'lucide-react';

export default function WorkshopConfirmation({ onNavigate, bookedInfo }) {
  return (
    <div className="confirmation-root">
      <div className="parchment-texture confirmation-bg" />

      <div className="confirmation-content">
        {/* Success icon */}
        <div className="confirmation-icon-wrap">
          <div className="confirmation-icon">
            <CheckCircle2 size={44} className="text-primary" />
            <div className="confirmation-ping" />
          </div>
          <div className="confirmation-eyebrow">
            <Sparkles size={14} />
            <span>Custodian Confirmed</span>
          </div>
          <h2 className="confirmation-title">Your space in the lineage is secured.</h2>
          <p className="text-muted-sm max-w-xs text-center">
            You are now officially a custodian of this ancestral craft.
          </p>
        </div>

        {/* Booking details */}
        <div className="booking-card">
          <h3 className="booking-card-title">{bookedInfo.title}</h3>
          <div className="booking-details">
            <div className="booking-detail-item">
              <div className="booking-detail-icon">
                <User size={14} />
              </div>
              <div>
                <span className="detail-label">Led by Master</span>
                <span className="detail-value">{bookedInfo.instructor}</span>
              </div>
            </div>
            <div className="booking-detail-item">
              <div className="booking-detail-icon">
                <Calendar size={14} />
              </div>
              <div>
                <span className="detail-label">Session Period</span>
                <span className="detail-value">{bookedInfo.date} · {bookedInfo.time}</span>
              </div>
            </div>
            <div className="booking-detail-item">
              <div className="booking-detail-icon">
                <MapPin size={14} />
              </div>
              <div>
                <span className="detail-label">Venue Center</span>
                <span className="detail-value">{bookedInfo.venue}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('personalized-dashboard')}
          className="btn-primary btn-full"
        >
          Back to Dashboard <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
