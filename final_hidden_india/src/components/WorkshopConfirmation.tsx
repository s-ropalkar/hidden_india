/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Calendar, MapPin, User, ChevronRight, Home, Sparkles } from 'lucide-react';
import { ScreenId } from '../types';

interface BookedWorkshop {
  title: string;
  instructor: string;
  date: string;
  time: string;
  venue: string;
}

interface WorkshopConfirmationProps {
  onNavigate: (screen: ScreenId) => void;
  bookedInfo: BookedWorkshop;
}

export default function WorkshopConfirmation({ onNavigate, bookedInfo }: WorkshopConfirmationProps) {
  return (
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-20 w-full flex flex-col justify-center px-4">
      {/* Subtle paper background overlay */}
      <div className="absolute inset-0 parchment-texture opacity-30 pointer-events-none -z-10"></div>
      
      {/* Glowing check circle icon container */}
      <div className="max-w-md mx-auto w-full text-center space-y-10 py-8">
        
        {/* Animated Check circle mark */}
        <div className="space-y-4">
          <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto shadow-xl shadow-primary/10 relative overflow-hidden">
            <CheckCircle2 size={44} className="text-[#a33d1f] scale-100 rotate-0" />
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping"></div>
          </div>
          <div className="flex items-center justify-center gap-1 text-primary">
            <Sparkles size={14} />
            <span className="font-sans font-extrabold text-[10px] uppercase tracking-widest">Custodian Confirmed</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-on-surface">
            Your space in <br /> the lineage is secured.
          </h2>
          <p className="font-sans text-xs text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
            You are now officially a custodian of this ancestral craft. Full entrance credentials have been encrypted.
          </p>
        </div>

        {/* Structured Booking details layout */}
        <div className="bg-surface border border-primary/20 p-5 rounded-2xl shadow-sm text-left relative overflow-hidden warli-pattern">
          {/* Edge border tag */}
          <div className="absolute left-0 top-0 w-1 bg-primary h-full"></div>
          
          <h3 className="font-serif text-[17px] font-bold text-on-surface border-b border-outline-variant/25 pb-3">
            {bookedInfo.title}
          </h3>

          <div className="space-y-3.5 pt-3.5">
            {/* Instructor */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4j93Z4oxaP_4lpblntiom2aeXeu0KcsxtjvI9UNg3j2wiX588u0GLQ90IFO7Gqq-rewXgpFDlE1Ia0CTL23Qs3lUg6TOiwKUj_-yLJxRpHyXDgsmsyUW561XlVFlj-5NKOpK9fGH7EOgTefThy8KUnmX7B_HOIA2RHxFJ0r7-E8JujEDDnAyAtemUEeYYN_W7_vZ50uuprPlMQP3dk2o1rlUnHNWZjophVQZ2MIjC9c5_tRFOHGheW0BHwtkK79esU8kk4H_6_j8" 
                  alt="Instructor" 
                />
              </div>
              <div>
                <span className="block font-sans text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Led by Master</span>
                <span className="font-sans text-xs font-bold text-on-surface block leading-tight mt-0.5">{bookedInfo.instructor}</span>
              </div>
            </div>

            {/* Date time details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary border">
                <Calendar size={14} />
              </div>
              <div>
                <span className="block font-sans text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Session Period</span>
                <span className="font-sans text-xs font-bold text-on-surface block leading-tight mt-0.5">{bookedInfo.date} • {bookedInfo.time}</span>
              </div>
            </div>

            {/* Address venue details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary border">
                <MapPin size={14} />
              </div>
              <div>
                <span className="block font-sans text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Venue Center</span>
                <span className="font-sans text-xs font-bold text-on-surface block leading-tight mt-0.5">{bookedInfo.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button layout */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => onNavigate('personalized-dashboard')}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#a33d1f] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
          >
            Back to Dashboard <ChevronRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
