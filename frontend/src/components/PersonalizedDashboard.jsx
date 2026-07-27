import React, { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, CheckCircle, Heart, X } from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import CraftMultiFilter from './CraftMultiFilter';
import BottomNav from './BottomNav';

export default function PersonalizedDashboard({ onNavigate, userName }) {
  const { user } = useAuth();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedWorkshops, setRecommendedWorkshops] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogWorkshops, setCatalogWorkshops] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [allStates, setAllStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.getCatalogStates().then(c => setAllStates(c.states.sort())).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedArtifact?.id) {
      api.trackProductView(selectedArtifact.id).catch(() => {});
    }
  }, [selectedArtifact?.id]);

  useEffect(() => {
    (async () => {
      const [workshopsR, productsR, recR] = await Promise.allSettled([
        api.getWorkshops(),
        api.getProducts(),
        api.getRecommendations(),
      ]);
      const allWorkshops = workshopsR.status === 'fulfilled' ? workshopsR.value : [];
      const allProducts = productsR.status === 'fulfilled' ? productsR.value : [];
      const rec = recR.status === 'fulfilled' ? recR.value : null;

      if (!allProducts.length && productsR.status === 'rejected') {
        const msg = productsR.reason?.message || 'Could not load catalog';
        setLoadError(msg.includes('reach server') ? `${msg} — run python app.py` : msg);
      }

      setRecommendedProducts(rec?.products?.length ? rec.products : allProducts.slice(0, 12));
      setRecommendedWorkshops(rec?.workshops?.length ? rec.workshops : allWorkshops.slice(0, 8));
      setCatalogProducts(allProducts);
      setCatalogWorkshops(allWorkshops);
      setLoading(false);
    })();
  }, []);

  const filtersActive = selectedState !== 'All States' || selectedCrafts.length > 0;

  const itemMatchesCrafts = (item) =>
    api.matchesCraftFilter(selectedCrafts, item);

  useEffect(() => {
    if (!filtersActive || loading) return;
    const state = selectedState === 'All States' ? undefined : selectedState;
    Promise.all([api.getProducts({ state }), api.getWorkshops({ state })])
      .then(([products, ws]) => { setCatalogProducts(products); setCatalogWorkshops(ws); })
      .catch(() => {});
  }, [selectedState, selectedCrafts, loading, filtersActive]);

  const displayProducts = filtersActive
    ? catalogProducts.filter(item => {
        const matchesState = selectedState === 'All States' || item.state === selectedState;
        return matchesState && itemMatchesCrafts(item);
      })
    : recommendedProducts;

  const displayWorkshops = filtersActive
    ? catalogWorkshops.filter(item => {
        const matchesState = selectedState === 'All States' || item.state === selectedState;
        return matchesState && itemMatchesCrafts(item);
      })
    : recommendedWorkshops;

  const executePurchase = async () => {
    if (!selectedArtifact) return;
    setIsPurchasing(true);
    try {
      await api.placeOrder(selectedArtifact.id, 1, true);
      setPurchaseSuccess(true);
    } catch (err) {
      alert(err.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedArtifact) return;
    try {
      await api.saveItem('product', selectedArtifact.id);
      setIsSaved(true);
    } catch (err) {
      alert(err.message || 'Could not save item');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-text">Curating your recommendations...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* TopBar */}
      <header className="topbar">
        <NotificationBell
          onNavigateProfile={() => onNavigate('profile-settings')}
          onViewAll={() => { localStorage.setItem('profileTab', 'Notifications'); onNavigate('profile-settings'); }}
        />
      </header>

      <main className="dashboard-main">
        {/* Welcome */}
        <section className="section-pad mb-section">
          <p className="section-eyebrow">Welcome, {user?.name?.split(' ')[0] || userName.split(' ')[0]}</p>
          <h2 className="section-heading">Recommended for you based on your cultural interests.</h2>

          {(user?.interests?.length || user?.favoriteCrafts?.length || user?.preferredRegions?.length) ? (
            <div className="tag-groups">
              {user?.interests?.length > 0 && (
                <div>
                  <p className="tag-group-label">Interested in</p>
                  <div className="tag-row">
                    {user.interests.map(i => <span key={i} className="tag">{i}</span>)}
                  </div>
                </div>
              )}
              {user?.favoriteCrafts?.length > 0 && (
                <div>
                  <p className="tag-group-label">Favorite crafts</p>
                  <div className="tag-row">
                    {user.favoriteCrafts.map(i => <span key={i} className="tag tag--primary">{i}</span>)}
                  </div>
                </div>
              )}
              {(user?.preferredRegions?.length || user?.preferredStates?.length) ? (
                <div>
                  <p className="tag-group-label">Preferred region</p>
                  <div className="tag-row">
                    {(user.preferredRegions?.length ? user.preferredRegions : user.preferredStates || []).map(i => (
                      <span key={i} className="tag tag--secondary">{i}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-muted-sm">Complete the Cultural DNA quiz to personalize your heritage feed.</p>
          )}
        </section>

        {loadError && (
          <section className="section-pad mb-section">
            <p className="alert alert-warning">{loadError}</p>
          </section>
        )}

        {/* Explore Regions */}
        <section className="section-pad mb-section">
          <h3 className="card-heading">Explore Regions</h3>
          <p className="text-muted-sm mb-4">Tracing the geographic origins of your favorites.</p>
          <div className="regions-bento">
            <div
              onClick={() => onNavigate('explore-map')}
              className="regions-featured"
              style={{ backgroundImage: 'url(/images/hidden-india-hero.png)' }}
            >
              <div className="regions-featured-overlay" />
              <div className="regions-featured-content">
                <span className="regions-featured-eyebrow">Featured Region</span>
                <h4 className="regions-featured-title">HIDDEN INDIA</h4>
                <div className="regions-featured-meta">
                  <span><MapPin size={14} /> Breakdown of traditional crafts</span>
                </div>
              </div>
            </div>
            <div
              onClick={() => onNavigate('explore-map')}
              className="regions-map-card"
              style={{ backgroundImage: 'url(/images/india_map.png)' }}
            >
              <div className="regions-map-overlay" />
              <div className="regions-map-top">
                <MapPin size={32} />
                <ArrowRight size={18} />
              </div>
              <div className="regions-map-bottom">
                <h5>Interactive Map</h5>
                <p>Discover cultural experiences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="section-pad mb-section">
          <div className="catalog-filter-bar">
            <span className="filter-bar-label">Filter catalog:</span>
            <div className="filter-select-wrap">
              <MapPin size={13} className="text-primary" />
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="filter-select"
              >
                <option value="All States">All States</option>
                {allStates.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <CraftMultiFilter selected={selectedCrafts} onChange={setSelectedCrafts} label="Categories" />
            {filtersActive && (
              <button
                onClick={() => { setSelectedState('All States'); setSelectedCrafts([]); }}
                className="link-btn-small"
              >
                Reset to recommendations
              </button>
            )}
          </div>
        </section>

        {/* Workshops */}
        <section className="section-pad mb-section">
          <div className="section-heading-row">
            <div>
              <h3 className="card-heading">
                Workshops
                <span className="count-badge">({displayWorkshops.length} {filtersActive ? 'matching' : 'recommended'})</span>
              </h3>
              <p className="text-muted-sm">
                {filtersActive ? 'All workshops matching your filters.' : 'Personalized workshop picks based on your Cultural DNA.'}
              </p>
            </div>
            <div className="carousel-arrows">
              <button className="carousel-arrow"><ChevronLeft size={16} /></button>
              <button className="carousel-arrow"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="workshops-grid">
            {displayWorkshops.length === 0 && (
              <p className="text-muted-sm">No workshops found.</p>
            )}
            {displayWorkshops.map(ws => (
              <div key={ws.id} className="workshop-card">
                <div className="workshop-img-wrap">
                  <img src={ws.thumbnail} alt={ws.title} className="workshop-img" />
                  <span className={`workshop-mode-badge ${ws.mode === 'online' ? 'badge-indigo' : 'badge-green'}`}>
                    {ws.mode === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="workshop-info">
                  <div>
                    <div className="workshop-meta-row">
                      <span className="workshop-category">{ws.category}</span>
                      <span className="workshop-date">{ws.date}</span>
                    </div>
                    <h4 className="workshop-title">{ws.title}</h4>
                    <p className="workshop-instructor">Instructor: {ws.instructor}</p>
                    {ws.mode !== 'online' && ws.venue && (
                      <p className="workshop-venue"><MapPin size={11} /> {ws.venue}</p>
                    )}
                  </div>
                  <div className="workshop-footer">
                    <span className="workshop-price">{ws.price} / session</span>
                    <button
                      onClick={() => { localStorage.setItem('selectedWorkshopId', ws.id); onNavigate('workshop-detail'); }}
                      className="workshop-join-btn"
                    >
                      Join <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Artifacts */}
        <section className="section-pad mb-section">
          <div className="section-heading-row mb-4">
            <div>
              <h3 className="card-heading">
                Artifacts
                <span className="count-badge">({displayProducts.length} {filtersActive ? 'matching' : 'recommended'})</span>
              </h3>
              <p className="text-muted-sm">
                {filtersActive ? 'All products matching your filters.' : 'Personalized picks from the heritage catalog.'}
              </p>
            </div>
          </div>
          <div className="artifacts-grid">
            {displayProducts.length === 0 ? (
              <div className="empty-state">No artifacts found. Try adjusting your filters.</div>
            ) : (
              displayProducts.map(artifact => (
                <div
                  key={artifact.id}
                  onClick={() => { setSelectedArtifact(artifact); setIsPurchasing(false); setPurchaseSuccess(false); setIsSaved(false); }}
                  className="artifact-card"
                >
                  <div className="artifact-img-wrap">
                    <img src={artifact.image} alt={artifact.name} className="artifact-img" referrerPolicy="no-referrer" />
                    <div className="artifact-state-badge">{artifact.state || 'India'}</div>
                    <button className="artifact-cart-btn"><ShoppingBag size={15} /></button>
                  </div>
                  <p className="artifact-name">{artifact.name}</p>
                  <p className="artifact-artisan">{artifact.artisan || 'Master Artisan'}</p>
                  <p className="artifact-bottom">
                    <span>{artifact.category}</span>
                    <span className="artifact-price">₹{artifact.price}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Artifact detail modal */}
      {selectedArtifact && (
        <div className="modal-overlay">
          <div className="artifact-modal">
            <div className="artifact-modal-img-col">
              <img src={selectedArtifact.image} className="artifact-modal-img" alt={selectedArtifact.name} referrerPolicy="no-referrer" />
              <span className="artifact-modal-badge">AUTHENTIC GI-TAGGED</span>
            </div>
            <div className="artifact-modal-info">
              <div>
                <div className="artifact-modal-header">
                  <div>
                    <span className="artifact-modal-category">
                      {selectedArtifact.category} • {selectedArtifact.state || 'India'}
                    </span>
                    <h3 className="artifact-modal-title">{selectedArtifact.name}</h3>
                  </div>
                  <button onClick={() => setSelectedArtifact(null)} className="icon-btn">
                    <X size={18} />
                  </button>
                </div>
                <p className="artifact-modal-desc">
                  {selectedArtifact.description || 'Authentic cultural masterwork from a registered artisan.'}
                </p>
                <div className="artifact-modal-details">
                  <div className="detail-row">
                    <span>Master artisan:</span>
                    <span>{selectedArtifact.artisan || 'Heritage Artisan'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Raw composition:</span>
                    <span>{selectedArtifact.material || 'Handcrafted'}</span>
                  </div>
                  <div className="detail-row">
                    <span>GI Recognition:</span>
                    <span className="text-green"><CheckCircle size={10} /> Certified Original</span>
                  </div>
                </div>
              </div>
              <div className="artifact-modal-footer">
                <div className="artifact-modal-price-row">
                  <span className="label-xs">Patron Price Tag:</span>
                  <span className="artifact-modal-price">₹{selectedArtifact.price} INR</span>
                </div>
                <div className="artifact-modal-actions">
                  <button
                    onClick={handleSaveProduct}
                    className={`icon-btn-bordered ${isSaved ? 'icon-btn-bordered--saved' : ''}`}
                    title="Save to gallery"
                  >
                    <Heart size={16} className={isSaved ? 'fill-primary' : ''} />
                  </button>
                  <button
                    onClick={executePurchase}
                    disabled={isPurchasing || purchaseSuccess}
                    className="btn-primary flex-1"
                  >
                    {isPurchasing ? 'Placing order...' : purchaseSuccess ? 'Acquired! ✓' : 'Direct Custodian Buy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
