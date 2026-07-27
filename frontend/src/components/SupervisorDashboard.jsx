import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, RefreshCw, Layers, X, CheckCircle, Star, FileText, ArrowLeft, LogOut } from 'lucide-react';
import * as api from '../api';

export default function SupervisorDashboard({ onNavigate, applicantsList, onDecision, onLogout }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAllArtisans, setShowAllArtisans] = useState(false);
  const [curatorNotes, setCuratorNotes] = useState('');
  const [activePhoto, setActivePhoto] = useState(null);

  const loadData = async () => {
    try {
      const a = await api.getAdminAnalytics();
      setAnalytics(a);
    } catch {}
  };

  useEffect(() => { loadData(); }, [applicantsList.length]);

  const handleSync = async () => {
    setIsSyncing(true); setSyncDone(false);
    try { await loadData(); setSyncDone(true); setTimeout(() => setSyncDone(false), 2000); }
    finally { setIsSyncing(false); }
  };

  const pendingApps = applicantsList.filter(a => a.status === 'pending');
  const pendingCount = analytics?.pendingApplications ?? pendingApps.length;
  const approvedArtisansList = analytics?.approvedArtisans ?? [];
  const visibleArtisans = showAllArtisans ? approvedArtisansList : approvedArtisansList.slice(0, 5);

  const monthlyTrends = analytics?.monthlyTrends?.length
    ? analytics.monthlyTrends
    : [{ label: '—', value: 0, heightPct: 0 }];

  return (
    <div className="dashboard-split">
      {/* Sidebar */}
      <aside className="artisan-sidebar">
        <div className="artisan-sidebar-top">
          <div className="artisan-profile-row">
            <div className="artisan-initials">HQ</div>
            <div>
              <h1 className="artisan-name">Curator Wing</h1>
              <span className="eyebrow">System Supervisor</span>
            </div>
          </div>
          <div className="sidebar-menu">
            <button className="sidebar-btn sidebar-btn--active">
              <span className="sidebar-btn-inner"><Layers size={14} /><span>Platform Analytics</span></span>
            </button>
          </div>
        </div>
        <div>
          {onLogout && (
            <button onClick={onLogout} className="sidebar-btn sidebar-btn--red">
              <span className="sidebar-btn-inner"><LogOut size={14} /><span>Log Out</span></span>
            </button>
          )}
          <p className="text-tiny px-4 pb-4 opacity-60">Platform Admin v1.0.4</p>
        </div>
      </aside>

      {/* Main */}
      <main className="artisan-main">
        <section className="section-heading-row mb-6">
          <div>
            <p className="eyebrow">System Headquarter</p>
            <h2 className="page-title">Oversight Panel</h2>
            <p className="text-muted-sm">Managing artisan registries, catalogs, and curator reviews.</p>
          </div>
          <button onClick={handleSync} disabled={isSyncing} className="btn-outline">
            <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Refreshing...' : syncDone ? 'Data Refreshed!' : 'Refresh Data'}
          </button>
        </section>

        {/* KPI grid */}
        <section className="kpi-grid">
          {[
            { label: 'Most Explored State', value: analytics?.mostExploredState ?? '—', sub: 'Highest explorer activity' },
            { label: 'Most Explored Region', value: analytics?.mostExploredRegion ?? '—', sub: 'Regional heritage zone' },
            { label: 'Most Liked Category', value: analytics?.mostLikedCategory ?? '—', sub: 'By saves & orders' },
            { label: 'Most Registered Workshop', value: analytics?.mostRegisteredWorkshop ?? '—', sub: `${analytics?.totalWorkshopRegistrations ?? 0} total registrations` },
            { label: 'Pending Applications', value: pendingCount, sub: 'Awaiting curator review', highlight: true },
            { label: 'Approved Artisans', value: analytics?.approvedArtisans?.length ?? analytics?.totalArtisans ?? '—', sub: 'Active on platform' },
          ].map(kpi => (
            <div key={kpi.label} className={`kpi-card ${kpi.highlight ? 'kpi-card--highlight' : ''}`}>
              <span className="kpi-label">{kpi.label}</span>
              <span className={`kpi-value ${kpi.highlight ? 'text-primary' : ''}`}>{kpi.value}</span>
              <span className={`kpi-sub ${kpi.highlight ? 'text-error' : 'text-green'}`}>{kpi.sub}</span>
              {kpi.highlight && pendingCount > 0 && <span className="kpi-ping" />}
            </div>
          ))}
        </section>

        {/* Insight cards */}
        {analytics?.insightCards?.length > 0 && (
          <section className="insight-cards">
            {analytics.insightCards.map(card => (
              <div key={card} className="insight-card">
                <Star size={16} className="text-primary" />
                <p className="text-sm fw-semi">{card}</p>
              </div>
            ))}
          </section>
        )}

        {/* Approved artisans list */}
        {approvedArtisansList.length > 0 && (
          <div className="panel">
            <div className="panel-title-row">
              <h4 className="panel-title"><ShieldCheck size={14} className="text-primary" /> Recent Approved Artisans</h4>
              {approvedArtisansList.length > 5 && (
                <button type="button" onClick={() => setShowAllArtisans(v => !v)} className="link-btn-small">
                  {showAllArtisans ? 'Show less' : `View all (${approvedArtisansList.length})`}
                </button>
              )}
            </div>
            <div className="approved-artisans-grid">
              {visibleArtisans.map(a => (
                <div key={a.id} className="approved-artisan-row">
                  <div className="booking-initials">{a.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="fw-bold text-sm truncate">{a.name}</p>
                    <p className="text-muted-sm truncate">{a.state} · {(a.crafts?.length ? a.crafts : [a.category]).filter(Boolean).join(', ')}</p>
                  </div>
                  <CheckCircle size={14} className="text-green ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary row */}
        <section className="kpi-grid kpi-grid--4">
          {[
            { label: 'Active Artisans', value: analytics?.totalArtisans ?? '—' },
            { label: 'Live Products', value: analytics?.totalProducts ?? '—' },
            { label: 'Workshops', value: analytics?.totalWorkshops ?? '—' },
            { label: 'Total Orders', value: analytics?.totalOrders ?? '—' },
          ].map(s => (
            <div key={s.label} className="kpi-card">
              <span className="kpi-label">{s.label}</span>
              <span className="kpi-value">{s.value}</span>
            </div>
          ))}
        </section>

        {/* Bar chart */}
        <div className="panel">
          <div className="chart-header">
            <div>
              <h3 className="fw-bold">Platform Trends</h3>
              <p className="text-muted-sm">Monthly workshop registrations across clusters.</p>
            </div>
            <span className="badge badge-primary">2026 Live Log</span>
          </div>
          <div className="bar-chart">
            {monthlyTrends.map((bar, idx) => {
              const isActive = idx === monthlyTrends.length - 1;
              return (
                <div key={bar.label} className="bar-col">
                  <span className={`bar-value ${isActive ? 'bar-value--active' : ''}`}>{bar.value}</span>
                  <div className={`bar-fill ${isActive ? 'bar-fill--active' : ''}`} style={{ height: `${Math.max(bar.heightPct, 4)}%` }} />
                  <span className="bar-label">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending applications */}
        <div className="panel">
          <div className="panel-title-row border-bottom pb-3">
            <h4 className="panel-title"><ShieldCheck size={16} className="text-primary" /> Pending Applications ({pendingApps.length})</h4>
            <span className="badge badge-primary">Curation Queue</span>
          </div>
          {pendingApps.length === 0
            ? <div className="empty-state"><p className="text-green fw-bold">✨ Curation Clear</p><p>All applications have been reviewed.</p></div>
            : <div className="applicants-grid">
                {pendingApps.map(app => (
                  <div key={app.id} className="applicant-card">
                    <div className="applicant-card-info">
                      <div className="booking-initials">{app.name.charAt(0)}</div>
                      <div>
                        <h5 className="fw-bold text-sm">{app.name}</h5>
                        <span className="text-tiny font-mono">{app.email}</span>
                      </div>
                    </div>
                    <div className="text-muted-sm text-xs">
                      <p><strong>State:</strong> {app.state || app.region}</p>
                      <p><strong>Crafts:</strong> {(app.crafts?.length ? app.crafts : [app.category]).join(', ')}</p>
                      {app.regionValidation && (
                        <p className={app.regionValidation.allVerified ? 'text-green fw-bold' : 'text-amber fw-bold'}>
                          {app.regionValidation.allVerified ? '✓ Region verified' : `⚠ ${app.regionValidation.message}`}
                        </p>
                      )}
                    </div>
                    <button onClick={() => { setSelectedApp(app); setCuratorNotes('Verified original credentials against regional GI registers.'); }} className="btn-primary btn-sm btn-full">
                      Review Application
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>
      </main>

      {/* Review panel */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-overlay flex items-end justify-end">
          <div className="review-panel">
            <div className="review-panel-header">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedApp(null)} className="icon-btn text-primary"><ArrowLeft size={18} /></button>
                <div>
                  <span className="eyebrow">Integrated Curation Review</span>
                  <h3 className="fw-bold">Curation Status: {selectedApp.name}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="icon-btn"><X size={18} /></button>
            </div>

            <div className="review-panel-body">
              <div className="panel">
                <h4 className="panel-title">👤 Profile details</h4>
                <div className="form-grid">
                  <div><span className="label-xs">Full Name</span><span className="fw-bold block mt-1">{selectedApp.name}</span></div>
                  <div><span className="label-xs">Email Address</span><span className="font-mono text-xs block mt-1">{selectedApp.email}</span></div>
                  <div><span className="label-xs">Territory</span><span className="fw-bold text-xs block mt-1">{selectedApp.region}</span></div>
                  <div><span className="label-xs">Category</span><span className="fw-bold text-xs text-primary block mt-1">{selectedApp.category}</span></div>
                </div>
              </div>

              <div className="panel">
                <h4 className="panel-title">📁 Verification credentials</h4>
                <div className="credentials-list">
                  <div className="credential-item">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <div>
                        <span className="fw-bold text-sm block">Government photo ID</span>
                        <span className="text-tiny">NATIONAL_ID_PROOF.PNG</span>
                      </div>
                    </div>
                    <button onClick={() => setActivePhoto(selectedApp.govtIdUrl)} className="btn-outline btn-sm">
                      <Eye size={11} /> Inspect
                    </button>
                  </div>
                  <div className="credential-item">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <div>
                        <span className="fw-bold text-sm block">Craft certification</span>
                        <span className="text-tiny">CRAFT_REGISTRY.PDF</span>
                      </div>
                    </div>
                    <button onClick={() => setActivePhoto(selectedApp.certUrl)} className="btn-outline btn-sm">
                      <Eye size={11} /> Inspect
                    </button>
                  </div>
                </div>
              </div>

              {selectedApp.portfolio.length > 0 && (
                <div className="panel">
                  <h4 className="panel-title">🖼️ Portfolio ({selectedApp.portfolio.length} pieces)</h4>
                  <div className="portfolio-grid">
                    {selectedApp.portfolio.map((img, i) => (
                      <div key={i} onClick={() => setActivePhoto(img)} className="portfolio-item cursor-pointer">
                        <img src={img} alt="Portfolio" className="portfolio-img" />
                        <div className="portfolio-overlay"><Eye size={14} className="text-white" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="panel">
                <h4 className="panel-title fw-bold text-secondary">📝 Curation evaluation notes</h4>
                <textarea
                  rows={3}
                  value={curatorNotes}
                  onChange={e => setCuratorNotes(e.target.value)}
                  placeholder="Enter notes about verified credentials..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="review-panel-footer">
              <button onClick={() => { if (onDecision) onDecision(selectedApp.id, 'rejected', curatorNotes); setSelectedApp(null); }} className="btn-outline flex-1 text-error border-error">
                Reject Application
              </button>
              <button onClick={() => { if (onDecision) onDecision(selectedApp.id, 'approved', curatorNotes); setSelectedApp(null); }} className="btn-primary flex-1">
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo viewer */}
      {activePhoto && (
        <div onClick={() => setActivePhoto(null)} className="photo-viewer">
          <div className="photo-viewer-inner">
            <img src={activePhoto} alt="Document" className="photo-viewer-img" />
            <span className="photo-viewer-hint">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
