/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Hourglass, ShieldCheck, Mail, ArrowLeft, Compass, XCircle, CheckCircle } from 'lucide-react';
import { ScreenId } from '../types';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

interface ArtisanApplicationStatusProps {
  onNavigate: (screen: ScreenId) => void;
}

export default function ArtisanApplicationStatus({ onNavigate }: ArtisanApplicationStatusProps) {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'none' | 'pending' | 'approved' | 'rejected'>('loading');
  const [details, setDetails] = useState<{
    category?: string;
    region?: string;
    date?: string;
    state?: string;
    curatorNotes?: string;
    reviewedAt?: string;
  }>({});

  useEffect(() => {
    api.getApplicationStatus()
      .then((data) => {
        const s = (data.status || 'none') as typeof status;
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
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-28 w-full flex flex-col justify-between">
      
      {/* Dynamic Status Banner */}
      <div>
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img 
            className="w-full h-full object-cover select-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhGZ6Iz6bRdVJPoBMcq8UEY3HoQVzTz0vN2BsE1SEYf5N-7o-1Ow-nUhrqxYYIQr3znLmr9-v84pOYUA6D4U3zJ1vX0BzuN8mvdMpEjKaDTJTnsKgweO5ffgffcebSbhiy-xPVqplKM6MWQ1Ym1fMCXzUL7MrzzfoCWUjxan8NuMVGCZ6X183Pd8eqPFW7FdPUJ6XZfPsPuRmQLbaYOg011BIJV2LnDNfhlTQJmfWBLsDUivc9IAqhHkvRIu2bdVzW7T9qkTVndGk" 
            alt="Scenic Background Temple" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent"></div>
          <button 
            type="button"
            onClick={() => onNavigate('profile-settings')}
            className="absolute top-4 left-4 p-2 bg-white/90 text-primary hover:bg-[#a33d1f] hover:text-white rounded-full transition-all cursor-pointer shadow"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Narrative text intro */}
        <section className="px-4 md:px-12 pt-6 max-w-lg mx-auto text-center space-y-3">
          <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold inline-block border ${
            isApproved
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isRejected
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-tertiary-container text-amber-900 border-yellow-700/20 bg-[#f6be39]/10'
          }`}>
            {status === 'loading' ? 'Checking status...' : isApproved ? 'Application Approved' : isRejected ? 'Application Rejected' : 'Pending Boarding Curation'}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold leading-tight text-on-surface">
            {isApproved
              ? <>Your artisan credentials are <br /> verified and active.</>
              : isRejected
                ? <>Your application was not approved.</>
                : <>Your journey as a guardian <br /> of heritage is beginning.</>}
          </h2>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed max-w-[340px] mx-auto">
            {isApproved
              ? `Approved on ${details.reviewedAt || details.date || 'recently'}. You can access your artisan studio dashboard.`
              : isRejected
                ? 'Review the curator feedback below. You can update your portfolio and submit a new application.'
                : <>We are carefully calibrating your credentials against artisan clusters. <span className="font-bold">Estimated review: 3-5 days.</span></>}
          </p>
          {isRejected && details.curatorNotes && (
            <div className="text-left bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-[340px] mx-auto">
              <p className="text-[10px] font-bold uppercase text-red-800 tracking-wider mb-1">Curator feedback</p>
              <p className="font-sans text-xs text-red-900 leading-relaxed">{details.curatorNotes}</p>
              {details.reviewedAt && (
                <p className="text-[10px] text-red-700/80 mt-2">Reviewed {details.reviewedAt}</p>
              )}
            </div>
          )}
          {(details.category || details.region) && (
            <p className="font-sans text-[11px] text-on-surface-variant">
              {details.category && <span className="font-bold">{details.category}</span>}
              {details.category && details.region && ' · '}
              {details.region || details.state}
              {details.date && !isApproved && ` · Submitted ${details.date}`}
            </p>
          )}
        </section>

        {/* Status Checklist list cards */}
        <section className="px-4 md:px-12 pt-8 max-w-lg mx-auto space-y-4">
          {/* Item 1 */}
          <div className="flex bg-surface border border-outline-variant/30 p-4 rounded-xl items-start gap-4 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-[15px] font-bold text-on-surface">Identity Validation</h4>
                <span className="text-[9px] font-sans font-extrabold uppercase bg-emerald-500/10 text-emerald-800 px-1.5 py-0.5 rounded leading-none">Passed</span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                We have verified your government credentials and regional coordinates.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className={`flex border p-4 rounded-xl items-start gap-4 shadow-sm relative overflow-hidden ${
            isApproved ? 'bg-emerald-50 border-emerald-200' : isRejected ? 'bg-red-50 border-red-200' : 'bg-surface-container-low border-primary/25'
          }`}>
            {!isApproved && !isRejected && <div className="absolute top-0 right-0 w-1 bg-primary h-full"></div>}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isApproved ? 'bg-emerald-100 text-emerald-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700 animate-pulse'
            }`}>
              {isApproved ? <CheckCircle size={18} /> : isRejected ? <XCircle size={18} /> : <Hourglass size={18} className="animate-spin" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif text-[15px] font-bold text-on-surface">Admin Review</h4>
                <span className={`text-[9px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded leading-none ${
                  isApproved ? 'bg-emerald-500/10 text-emerald-800' : isRejected ? 'bg-red-500/10 text-red-800' : 'bg-orange-500/10 text-orange-850'
                }`}>
                  {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Evaluating'}
                </span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                {isApproved
                  ? 'Your application has been approved by the admin curator team.'
                  : isRejected
                    ? 'Your application was reviewed and not approved at this time.'
                    : 'Curator committee is evaluating your submitted catalog compositions against regional legacy tags.'}
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className={`flex border p-4 rounded-xl items-start gap-4 ${isApproved ? 'bg-surface border-emerald-200' : 'bg-surface border-outline-variant/10 opacity-60'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <Mail size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-[15px] font-bold text-on-surface">Custodian Credentials</h4>
                <span className={`text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded leading-none ${
                  isApproved ? 'bg-emerald-500/10 text-emerald-800' : 'bg-gray-150 text-gray-600'
                }`}>
                  {isApproved ? 'Issued' : 'Queued'}
                </span>
              </div>
              <p className="font-sans text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                {isApproved
                  ? 'Your artisan credentials are active. Access your studio from the dashboard.'
                  : 'You will receive confirmation details directly here and in your verified email.'}
              </p>
            </div>
          </div>

        </section>
      </div>

      {/* Footer bottom controls */}
      <div className="max-w-lg mx-auto w-full px-4 mb-2 space-y-2">
        {isRejected && (
          <button
            type="button"
            onClick={() => onNavigate('artisan-application')}
            className="w-full border-2 border-primary text-primary py-3.5 rounded-lg font-sans font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
          >
            Reapply with updated portfolio
          </button>
        )}
        <button 
          type="button"
          onClick={async () => {
            if (isApproved) {
              await refreshUser();
              onNavigate('artisan-dashboard');
            } else {
              onNavigate('personalized-dashboard');
            }
          }}
          className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#a33d1f] active:scale-95 transition-all text-center cursor-pointer shadow"
        >
          {isApproved ? 'Go to Artisan Studio' : isPending ? 'Browse as Explorer' : 'Back to Dashboard'}
        </button>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} showSaved={false} />
    </div>
  );
}
