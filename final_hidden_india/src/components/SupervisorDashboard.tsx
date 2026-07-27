/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Eye,
  RefreshCw, Layers, X, 
  CheckCircle, Star,
  FileText, ArrowLeft, LogOut
} from 'lucide-react';
import { ScreenId, Applicant } from '../types';
import * as api from '../api';

interface SupervisorDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  applicantsList: Applicant[];
  onDecision?: (appId: string, status: 'approved' | 'rejected', curatorNotes?: string) => void;
  onLogout?: () => void;
}

interface ActiveArtisan {
  id: string;
  name: string;
  region: string;
  category: string;
  status: 'Active' | 'Suspended';
  sales: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  interests: string;
  status: 'Active' | 'Blocked';
  joined: string;
}

export default function SupervisorDashboard({ onNavigate, applicantsList, onDecision, onLogout }: SupervisorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'Platform Analytics'>('Platform Analytics');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [analytics, setAnalytics] = useState<api.AdminAnalytics | null>(null);

  const [selectedReviewApp, setSelectedReviewApp] = useState<Applicant | null>(null);
  const [showAllApprovedArtisans, setShowAllApprovedArtisans] = useState(false);
  const [curatorNotes, setCuratorNotes] = useState('Excellent traditional craft background validated against local archives.');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [artisans, setArtisans] = useState<ActiveArtisan[]>([]);

  const loadAdminData = async () => {
    try {
      const [a, u, ar] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminUsers(),
        api.getAdminArtisans(),
      ]);
      setAnalytics(a);
      setUsers(u.map((x) => ({ ...x, status: x.status as 'Active' | 'Blocked' })));
      setArtisans(ar.map((x) => ({ ...x, status: x.status as 'Active' | 'Suspended' })));
    } catch {
      /* backend offline or not admin */
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [applicantsList.length]);

  const pendingApps = applicantsList.filter(a => a.status === 'pending');
  const pendingCount = analytics?.pendingApplications ?? pendingApps.length;
  const monthlyTrends = analytics?.monthlyTrends?.length
    ? analytics.monthlyTrends
    : [{ label: '—', value: 0, heightPct: 0 }];
  const approvedArtisansList = analytics?.approvedArtisans ?? [];
  const visibleApprovedArtisans = showAllApprovedArtisans
    ? approvedArtisansList
    : approvedArtisansList.slice(0, 5);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setSyncDone(false);
    try {
      await loadAdminData();
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const nextStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    try {
      await api.setUserStatus(id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const toggleArtisanStatus = async (id: string) => {
    const artisan = artisans.find((a) => a.id === id);
    if (!artisan) return;
    const nextStatus = artisan.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.setArtisanStatus(id, nextStatus);
      setArtisans((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-20 w-full flex flex-col md:flex-row">
      
      {/* Sidebar for Curator Headquarter */}
      <aside className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant/35 shrink-0 px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#4f5e81] text-white rounded-full flex items-center justify-center font-serif text-lg font-bold">
              HQ
            </div>
            <div>
              <h1 className="font-serif text-[15px] font-bold leading-none text-on-surface">Curator Wing</h1>
              <span className="font-sans text-[10px] text-on-surface-variant tracking-wider uppercase opacity-80 block mt-1.5">System Supervisor</span>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { id: 'Platform Analytics', name: 'Platform Analytics', icon: Layers }
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-primary text-on-primary' 
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} />
                    <span>{menu.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 space-y-3">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-high hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              Log Out
            </button>
          )}
          <p className="text-xs text-on-surface-variant/60 font-mono tracking-wider">Platform Admin v1.0.4</p>
        </div>
      </aside>

      {/* Main Board contents */}
      <main className="flex-grow p-4 md:p-10 space-y-8 max-w-5xl text-left bg-background text-on-background">
        
        {/* Welcome and dynamic quick parameters refresh */}
        <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">System Headquarter</p>
            <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">Oversight Panel</h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Managing artisan registries, on-chain catalogs, and curator reviews.</p>
          </div>
          <button 
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="flex items-center gap-2 border border-outline px-4 py-2 rounded-lg font-sans text-[11px] font-bold uppercase tracking-wider text-secondary bg-surface hover:bg-surface-container transition-colors cursor-pointer select-none"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin text-primary' : ''} />
            {isSyncing ? 'Refreshing...' : syncDone ? 'Data Refreshed!' : 'Refresh Data'}
          </button>
        </section>

        {/* Dynamic Display sections depending on the activeTab left menu */}


        {activeTab === 'Platform Analytics' && (
          <div className="space-y-6">
            
            {/* Heritage-focused KPIs */}
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Most Explored State</span>
                <span className="text-xl font-serif font-bold text-on-surface mt-1 block">{analytics?.mostExploredState ?? '—'}</span>
                <span className="text-[10px] font-sans text-primary font-bold block mt-1">Highest explorer activity</span>
              </div>

              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Most Explored Cultural Region</span>
                <span className="text-xl font-serif font-bold text-on-surface mt-1 block">{analytics?.mostExploredRegion ?? '—'}</span>
                <span className="text-[10px] font-sans text-secondary font-bold block mt-1">Regional heritage zone</span>
              </div>

              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Most Liked Product Category</span>
                <span className="text-xl font-serif font-bold text-on-surface mt-1 block">{analytics?.mostLikedCategory ?? '—'}</span>
                <span className="text-[10px] font-sans text-emerald-600 font-bold block mt-1">By saves & orders</span>
              </div>

              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Most Registered Workshop</span>
                <span className="text-lg font-serif font-bold text-on-surface mt-1 block line-clamp-2">{analytics?.mostRegisteredWorkshop ?? '—'}</span>
                <span className="text-[10px] font-sans text-on-surface-variant font-medium block mt-1">
                  {analytics?.totalWorkshopRegistrations ?? 0} total registrations
                </span>
              </div>

              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm relative">
                {pendingCount > 0 && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-primary animate-ping"></span>
                )}
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pending Applications</span>
                <span className="text-2xl font-serif font-bold text-primary mt-1 block">{pendingCount}</span>
                <span className="text-[10px] font-sans text-red-600 font-bold block mt-1">Awaiting curator review</span>
              </div>

              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Approved Artisans</span>
                <span className="text-2xl font-serif font-bold text-on-surface mt-1 block">{analytics?.approvedArtisans?.length ?? analytics?.totalArtisans ?? '—'}</span>
                <span className="text-[10px] font-sans text-emerald-600 font-bold block mt-1">Active on platform</span>
              </div>
            </section>

            {/* Heritage insight cards */}
            {(analytics?.insightCards?.length ?? 0) > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics!.insightCards!.map((card) => (
                  <div key={card} className="bg-primary-container/15 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                    <Star size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="font-sans text-xs font-semibold text-on-surface leading-relaxed">{card}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Approved artisans list */}
            {(approvedArtisansList.length > 0) && (
              <div className="bg-surface border border-outline-variant/20 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-serif text-sm font-bold text-on-surface flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" /> Recent Approved Artisans
                  </h4>
                  {approvedArtisansList.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllApprovedArtisans((v) => !v)}
                      className="text-[10px] font-bold uppercase text-primary hover:underline"
                    >
                      {showAllApprovedArtisans ? 'Show less' : `View all (${approvedArtisansList.length})`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleApprovedArtisans.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl">
                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-serif text-sm font-bold shrink-0">
                        {a.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-sm font-bold text-on-surface truncate">{a.name}</p>
                        <p className="font-sans text-[10px] text-on-surface-variant truncate">
                          {a.state} · {(a.crafts?.length ? a.crafts : [a.category]).filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <CheckCircle size={14} className="text-emerald-600 shrink-0 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy summary row */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active Artisans</span>
                <span className="text-2xl font-serif font-bold text-on-surface mt-1 block">{analytics?.totalArtisans ?? '—'}</span>
              </div>
              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Live Products</span>
                <span className="text-2xl font-serif font-bold text-on-surface mt-1 block">{analytics?.totalProducts ?? '—'}</span>
              </div>
              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Workshops</span>
                <span className="text-2xl font-serif font-bold text-on-surface mt-1 block">{analytics?.totalWorkshops ?? '—'}</span>
              </div>
              <div className="bg-surface border border-outline-variant/35 p-4 rounded-xl shadow-sm">
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Orders</span>
                <span className="text-2xl font-serif font-bold text-on-surface mt-1 block">{analytics?.totalOrders ?? '—'}</span>
              </div>
            </section>

            {/* Custom Visual Bar chart: Platform workshop Volume */}
            <div className="bg-surface-container-low border border-outline-variant/20 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-on-surface">Platform Trends</h3>
                  <p className="font-sans text-[11px] text-on-surface-variant">Monthly workshop registrations totals across clusters.</p>
                </div>
                <span className="text-xs font-bold text-primary font-sans bg-primary/10 px-2.5 py-0.5 rounded">2026 Live Log</span>
              </div>

              <div className="grid grid-cols-6 gap-3 items-end h-40 pt-4 border-b border-outline-variant/20">
                {monthlyTrends.map((bar, idx) => {
                  const isActive = idx === monthlyTrends.length - 1;
                  return (
                  <div key={bar.label} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className={`text-[10px] font-sans font-bold transition-all opacity-0 group-hover:opacity-100 ${isActive ? 'text-primary scale-110 opacity-100' : ''}`}>
                      {bar.value}
                    </span>
                    <div 
                      className={`w-full max-w-[40px] rounded-t-lg transition-transform hover:scale-[1.03] duration-500 cursor-pointer ${
                        isActive ? 'bg-[#ac4425]' : 'bg-secondary'
                      }`}
                      style={{ height: `${Math.max(bar.heightPct, 4)}%` }}
                    ></div>
                    <span className="font-sans text-[10px] font-bold text-on-surface-variant tracking-wider mt-1">{bar.label}</span>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Curator Applications for Curation Review (Joined as requested!) */}
            <div className="bg-surface border border-[#ac4425]/15 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <h4 className="font-serif text-base font-bold text-on-surface flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> Pending Curator Applications ({pendingApps.length})
                </h4>
                <span className="text-[9px] uppercase font-sans font-extrabold tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full"> Curation Queue </span>
              </div>
              
              {pendingApps.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-emerald-700 font-serif font-bold">✨ Curation Clear</p>
                  <p className="text-xs text-on-surface-variant font-sans">All outstanding artisan platform applications have been parsed, certified, and saved.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {pendingApps.map((app) => (
                    <div 
                      key={app.id} 
                      className="border border-outline-variant/20 p-5 rounded-2xl hover:border-primary/40 transition-colors bg-surface-container-lowest flex flex-col justify-between shadow-xs relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-serif text-base font-bold border border-primary/15">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-serif text-sm font-bold text-on-surface leading-tight">{app.name}</h5>
                            <span className="text-[10px] text-on-surface-variant font-mono tracking-wider">{app.email}</span>
                          </div>
                        </div>
                        <div className="text-xs font-sans text-on-surface-variant pt-2.5 border-t border-outline-variant/5 space-y-1">
                          <p><strong>State:</strong> {app.state || app.region}</p>
                          <p><strong>Crafts:</strong> {(app.crafts?.length ? app.crafts : [app.category]).join(', ')}</p>
                          {app.regionValidation && (
                            <p className={app.regionValidation.allVerified ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                              {app.regionValidation.allVerified ? '✓ Region verified' : `⚠ ${app.regionValidation.message}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReviewApp(app);
                          setCuratorNotes('Verified original cluster credentials and authentic hand-weaving loops against regional GI registers.');
                        }}
                        className="w-full mt-4 bg-primary hover:bg-[#a33d1f] text-on-primary py-2 rounded-lg font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer text-center"
                      >
                        Review Application
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* JOINT: Interactive overlay for in-place curator application reviews! */}
      {selectedReviewApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-background text-on-background h-screen overflow-y-auto shadow-2xl p-6 md:p-8 flex flex-col justify-between border-l border-outline-variant/25 relative">
            
            {/* Review Header */}
            <div>
              <div className="flex justify-between items-start border-b border-outline-variant/25 pb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedReviewApp(null)}
                    className="p-1.5 text-primary hover:bg-surface-container rounded-full transition-transform shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <span className="block font-sans font-bold text-[9px] text-[#4f5e81] uppercase tracking-widest leading-none">Integrated Curation Review</span>
                    <h3 className="font-serif text-lg font-bold text-on-surface mt-1"> Curation Status: {selectedReviewApp.name} </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReviewApp(null)}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Review Workspace Panels */}
              <div className="space-y-6 pt-6">
                
                {/* Profile Grid */}
                <div className="bg-surface border border-outline-variant/20 p-5 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-on-surface border-b border-outline-variant/10 pb-2 flex items-center gap-2">
                    👤 Profile details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-sans uppercase tracking-wider block">Full Name</span>
                      <span className="text-sm font-bold text-on-surface font-serif block mt-1">{selectedReviewApp.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-sans uppercase tracking-wider block">Email Address</span>
                      <span className="text-xs font-mono text-on-surface block mt-1.5">{selectedReviewApp.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-sans uppercase tracking-wider block">Territory cluster</span>
                      <span className="text-xs font-bold text-on-surface block mt-1">{selectedReviewApp.region}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant font-sans uppercase tracking-wider block">Methodology taxonomies</span>
                      <span className="text-xs font-extrabold text-primary block mt-1 leading-none">{selectedReviewApp.category}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Documents */}
                <div className="bg-surface border border-outline-variant/20 p-5 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-on-surface border-b border-outline-variant/10 pb-2">
                    📁 Verification credentials
                  </h4>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-primary" />
                        <div>
                          <span className="font-bold text-on-surface block">Government photo ID card</span>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5">NATIONAL_IDENTIFICATION_PROOF.PNG</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActivePhoto(selectedReviewApp.govtIdUrl)}
                        className="flex items-center gap-1.5 border border-outline px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface cursor-pointer"
                      >
                        <Eye size={11} /> Inspect ID
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant/15 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-primary" />
                        <div>
                          <span className="font-bold text-on-surface block">Ancestral Craft certification</span>
                          <span className="text-[10px] text-on-surface-variant block mt-0.5">MASTERS_LEGACY_COMMUNION.PDF</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActivePhoto(selectedReviewApp.certUrl)}
                        className="flex items-center gap-1.5 border border-outline px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface cursor-pointer"
                      >
                        <Eye size={11} /> Inspect License
                      </button>
                    </div>
                  </div>
                </div>

                {/* Portfolio Pieces */}
                <div className="bg-surface border border-outline-variant/20 p-5 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-on-surface border-b border-outline-variant/10 pb-2">
                    🖼️ Curated Masterpieces portfolio ({selectedReviewApp.portfolio.length} pieces)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedReviewApp.portfolio.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActivePhoto(img)}
                        className="aspect-square bg-surface-container rounded-xl overflow-hidden border border-outline-variant/15 relative group cursor-pointer"
                      >
                        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img} alt="Tapestry" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={14} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation notes */}
                <div className="bg-surface border border-outline-variant/20 p-5 rounded-2xl shadow-xs space-y-3.5">
                  <h4 className="font-serif text-sm font-bold text-[#4c5b7e] leading-snug">
                    📝 Curation evaluation commentary notes
                  </h4>
                  <textarea 
                    rows={3}
                    value={curatorNotes}
                    onChange={(e) => setCuratorNotes(e.target.value)}
                    placeholder="Enter notes about verified ancestral tools, heritage materials, and GI protection registry matches..."
                    className="w-full p-4 bg-surface border border-outline-variant text-[#4c5b7e] rounded-xl outline-none focus:border-[#ac4425] text-xs font-sans placeholder-on-surface-variant/40"
                  />
                </div>

              </div>
            </div>

            {/* Sticky Actions bar for decision */}
            <div className="border-t border-outline-variant/25 pt-5 pb-2 flex gap-4 pr-1">
              <button 
                onClick={() => {
                  if (onDecision) onDecision(selectedReviewApp.id, 'rejected', curatorNotes);
                  setSelectedReviewApp(null);
                }}
                className="flex-1 bg-outline-variant/40 hover:bg-red-50 text-red-600 border border-red-200 font-sans font-bold text-xs uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-all"
              >
                Reject Application
              </button>
              <button 
                onClick={() => {
                  if (onDecision) onDecision(selectedReviewApp.id, 'approved', curatorNotes);
                  setSelectedReviewApp(null);
                }}
                className="flex-1 bg-[#ac4425] hover:bg-[#a33d1f] text-on-primary font-sans font-bold text-xs uppercase tracking-widest py-3 rounded-xl cursor-pointer transition-all shadow"
              >
                Approve Application
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pop-up high quality document review zoom overlay */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl relative shadow-2xl">
            <img className="w-full h-auto max-h-[80vh] object-contain" src={activePhoto} alt="Document viewer" />
            <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white font-sans text-[10px] px-4 py-1.5 rounded-full select-none font-bold uppercase tracking-wider">
              Click anywhere to exit review
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
