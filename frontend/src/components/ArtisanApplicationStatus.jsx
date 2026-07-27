import React, { useEffect, useState } from 'react';
import { Hourglass, ShieldCheck, Mail, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

export default function ArtisanApplicationStatus({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState('loading');
  const [details, setDetails] = useState({});

  useEffect(() => {
    api.getApplicationStatus()
      .then(data => {
        const s = data.status || 'none';
        setStatus(s === 'loading' ? 'none' : s);
        setDetails({
          category: data.category,
          region: data.region,
          date: data.date,
          state: data.state,
          curatorNotes: data.curatorNotes || user?.applicationNotes,
          reviewedAt: data.reviewedAt,
        });
      })
      .catch(() => setStatus('none'));
  }, [user?.applicationNotes]);

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending' || status === 'loading';

  return (
    <div className="page-root">
      {/* Banner */}
      <div className="status-banner">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhGZ6Iz6bRdVJPoBMcq8UEY3HoQVzTz0vN2BsE1SEYf5N-7o-1Ow-nUhrqxYYIQr3znLmr9-v84pOYUA6D4U3zJ1vX0BzuN8mvdMpEjKaDTJTnsKgweO5ffgffcebSbhiy-xPVqplKM6MWQ1Ym1fMCXzUL7MrzzfoCWUjxan8NuMVGCZ6X183Pd8eqPFW7FdPUJ6XZfsPuRmQLbaYOg011BIJV2LnDNfhlTQJmfWBLsDUivc9IAqhHkvRIu2bdVzW7T9qkTVndGk"
          className="status-banner-img"
          alt="Heritage Background"
        />
        <div className="status-banner-overlay" />
        <button onClick={() => onNavigate('profile-settings')} className="status-back-btn">
          <ArrowLeft size={16} />
        </button>
      </div>

      <section className="status-content">
        <span className={`status-badge ${isApproved ? 'status-badge--ok' : isRejected ? 'status-badge--err' : 'status-badge--pending'}`}>
          {status === 'loading' ? 'Checking...' : isApproved ? 'Application Approved' : isRejected ? 'Application Rejected' : 'Pending Curation'}
        </span>

        <h2 className="status-heading">
          {isApproved
            ? 'Your artisan credentials are verified and active.'
            : isRejected
              ? 'Your application was not approved.'
              : 'Your journey as a guardian of heritage is beginning.'}
        </h2>

        <p className="text-muted-sm text-center max-w-sm mx-auto">
          {isApproved
            ? `Approved on ${details.reviewedAt || details.date || 'recently'}. You can access your artisan studio dashboard.`
            : isRejected
              ? 'Review the curator feedback below. You can update your portfolio and reapply.'
              : 'We are carefully calibrating your credentials. Estimated review: 3-5 days.'}
        </p>

        {isRejected && details.curatorNotes && (
          <div className="curator-feedback">
            <p className="curator-feedback-label">Curator feedback</p>
            <p className="text-sm">{details.curatorNotes}</p>
            {details.reviewedAt && <p className="text-tiny mt-1">Reviewed {details.reviewedAt}</p>}
          </div>
        )}

        {(details.category || details.region) && (
          <p className="text-muted-sm text-center">
            {details.category && <strong>{details.category}</strong>}
            {details.category && details.region && ' · '}
            {details.region || details.state}
            {details.date && !isApproved && ` · Submitted ${details.date}`}
          </p>
        )}

        {/* Status checklist */}
        <div className="status-checklist">
          <div className="status-step">
            <div className="status-step-icon status-step-icon--ok"><ShieldCheck size={20} /></div>
            <div>
              <div className="status-step-title-row">
                <h4>Identity Validation</h4>
                <span className="badge badge-green">Passed</span>
              </div>
              <p className="text-muted-sm">We have verified your government credentials and regional coordinates.</p>
            </div>
          </div>

          <div className={`status-step ${isApproved ? 'status-step--ok' : isRejected ? 'status-step--err' : 'status-step--pending'}`}>
            <div className={`status-step-icon ${isApproved ? 'status-step-icon--ok' : isRejected ? 'status-step-icon--err' : 'status-step-icon--spin'}`}>
              {isApproved ? <CheckCircle size={18} /> : isRejected ? <XCircle size={18} /> : <Hourglass size={18} className="spin" />}
            </div>
            <div>
              <div className="status-step-title-row">
                <h4>Admin Review</h4>
                <span className={`badge ${isApproved ? 'badge-green' : isRejected ? 'badge-red' : 'badge-amber'}`}>
                  {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Evaluating'}
                </span>
              </div>
              <p className="text-muted-sm">
                {isApproved
                  ? 'Your application has been approved.'
                  : isRejected
                    ? 'Your application was reviewed and not approved at this time.'
                    : 'Curator committee is evaluating your submitted portfolio.'}
              </p>
            </div>
          </div>

          <div className={`status-step ${isApproved ? '' : 'status-step--disabled'}`}>
            <div className={`status-step-icon ${isApproved ? 'status-step-icon--ok' : 'status-step-icon--gray'}`}>
              <Mail size={16} />
            </div>
            <div>
              <div className="status-step-title-row">
                <h4>Custodian Credentials</h4>
                <span className={`badge ${isApproved ? 'badge-green' : 'badge-gray'}`}>
                  {isApproved ? 'Issued' : 'Queued'}
                </span>
              </div>
              <p className="text-muted-sm">
                {isApproved
                  ? 'Your artisan credentials are active. Access your studio from the dashboard.'
                  : 'You will receive confirmation in your verified email.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer actions */}
      <div className="status-actions">
        {isRejected && (
          <button onClick={() => onNavigate('artisan-application')} className="btn-outline btn-full">
            Reapply with updated portfolio
          </button>
        )}
        <button
          onClick={async () => {
            if (isApproved) { await refreshUser(); onNavigate('artisan-dashboard'); }
            else onNavigate('personalized-dashboard');
          }}
          className="btn-primary btn-full"
        >
          {isApproved ? 'Go to Artisan Studio' : isPending ? 'Browse as Explorer' : 'Back to Dashboard'}
        </button>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} showSaved={false} />
    </div>
  );
}
