import React, { useState, useEffect } from 'react';
import { Search, Compass, SlidersHorizontal, Plus, Minus, X, ChevronDown } from 'lucide-react';
import * as api from '../api';
import CraftMultiFilter from './CraftMultiFilter';
import BrandLogo from './BrandLogo';
import BottomNav from './BottomNav';

export default function ExploreMap({ onNavigate }) {
  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.15;

  const [zoom, setZoom] = useState(1);
  const [regionPins, setRegionPins] = useState([]);
  const [nearbyArtisans, setNearbyArtisans] = useState([]);
  const [geoKm, setGeoKm] = useState(25);
  const [userCoords, setUserCoords] = useState({ lat: 26.91, lng: 75.79 });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [draftQuery, setDraftQuery] = useState('');
  const [draftState, setDraftState] = useState('All States');
  const [draftCrafts, setDraftCrafts] = useState([]);
  const [draftKm, setDraftKm] = useState(25);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');

  const [activeModalRegion, setActiveModalRegion] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [regionLoading, setRegionLoading] = useState(false);

  useEffect(() => {
    const craft = localStorage.getItem('mapCraftFilter');
    const stateFilter = localStorage.getItem('mapStateFilter');
    if (craft) { setDraftCrafts([craft]); setSelectedCrafts([craft]); localStorage.removeItem('mapCraftFilter'); }
    if (stateFilter) { setDraftState(stateFilter); setSelectedState(stateFilter); localStorage.removeItem('mapStateFilter'); }

    api.getMapRegions().then(setRegionPins).catch(() => setRegionPins([]));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserCoords({ lat: 26.91, lng: 75.79 })
      );
    }
  }, []);

  useEffect(() => {
    api.getNearbyArtisans(userCoords.lat, userCoords.lng, geoKm)
      .then(setNearbyArtisans)
      .catch(() => setNearbyArtisans([]));
  }, [geoKm, userCoords.lat, userCoords.lng]);

  const applyFilters = () => {
    setSearchQuery(draftQuery);
    setSelectedState(draftState);
    setSelectedCrafts(draftCrafts);
    setGeoKm(draftKm);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setDraftQuery(''); setDraftState('All States'); setDraftCrafts([]); setDraftKm(25);
    setSearchQuery(''); setSelectedState('All States'); setSelectedCrafts([]); setGeoKm(25);
  };

  const stateOptions = [...new Set(regionPins.map(p => p.state))].sort();

  const filteredPins = regionPins.filter(pin => {
    const matchesState = selectedState === 'All States' || pin.state === selectedState;
    const matchesCraft = api.matchesCraftFilter(selectedCrafts, { craft: pin.craft, category: pin.category });
    const matchesSearch =
      !searchQuery ||
      pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.craft.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCraft && matchesSearch;
  });

  const filteredArtisans = nearbyArtisans.filter(a => {
    const matchesState = selectedState === 'All States' || a.state === selectedState;
    const matchesCraft = api.matchesCraftFilter(selectedCrafts, { craft: a.craft, category: a.category });
    const matchesSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.craft.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCraft && matchesSearch;
  });

  const openRegion = async (pin) => {
    setSelectedRegionId(pin.id);
    setActiveModalRegion(pin);
    setRegionLoading(true);
    setRegionDetail(null);
    try {
      const detail = await api.getRegion(pin.state);
      setRegionDetail(detail);
    } catch {
      setRegionDetail(null);
    } finally {
      setRegionLoading(false);
    }
  };

  const goToWorkshop = (workshopId) => {
    localStorage.setItem('selectedWorkshopId', workshopId);
    setActiveModalRegion(null);
    setRegionDetail(null);
    onNavigate('workshop-detail');
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedState !== 'All States' ? 1 : 0) +
    selectedCrafts.length;

  return (
    <div className="map-root">
      {/* Top bar */}
      <div className="map-topbar">
        <BrandLogo size="sm" />
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="map-filter-toggle"
        >
          <SlidersHorizontal size={12} />
          {filtersOpen ? 'Hide' : 'Filters'}
          {!filtersOpen && activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <header className="map-filters-panel">
          <div className="map-filters-card">
            <div className="map-search-wrap">
              <Search size={18} className="map-search-icon" />
              <input
                type="text"
                placeholder="Search Kutch, Varanasi, Madhubani..."
                value={draftQuery}
                onChange={e => setDraftQuery(e.target.value)}
                className="map-search-input"
              />
            </div>
            <div className="map-filter-row">
              <div className="map-filter-col">
                <label className="filter-label">State</label>
                <select
                  value={draftState}
                  onChange={e => setDraftState(e.target.value)}
                  className="filter-select"
                >
                  <option value="All States">All States ({regionPins.length})</option>
                  {stateOptions.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="map-filter-col">
                <label className="filter-label">Crafts</label>
                <CraftMultiFilter selected={draftCrafts} onChange={setDraftCrafts} />
              </div>
              <div className="map-filter-col map-filter-col--full">
                <label className="filter-label">Nearby radius: {draftKm} km</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={draftKm}
                  onChange={e => setDraftKm(Number(e.target.value))}
                  className="range-input"
                />
              </div>
            </div>
            <div className="map-filter-actions">
              <button type="button" onClick={applyFilters} className="btn-primary flex-1">
                Apply &amp; View Map
              </button>
              <button type="button" onClick={clearFilters} className="btn-outline">
                Clear
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Map area */}
      <section className="map-area">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', position: 'relative', width: 'fit-content', margin: '0 auto' }}>
          <img
            src="/images/india-states-map.png"
            alt="India States Map"
            className="map-image"
            draggable={false}
          />
          {filteredPins.map(pin => {
            const isSel = selectedRegionId === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => openRegion(pin)}
                style={{ left: pin.x, top: pin.y }}
                className="map-pin"
              >
                <div
                  className={`map-pin-dot ${isSel ? 'map-pin-dot--selected' : ''}`}
                  style={{ backgroundColor: pin.color }}
                >
                  <Compass size={10} className={isSel ? 'spin' : ''} />
                </div>
                {isSel && (
                  <div className="map-pin-tooltip">
                    <span className="map-pin-name">{pin.name}</span>
                    <span className="map-pin-craft">{pin.craft}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div className="map-zoom-controls">
          <button
            type="button"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom(z => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
            className="zoom-btn"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom(z => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
            className="zoom-btn"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
        </div>

        {!filtersOpen && (
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="map-edit-filters-btn"
          >
            <ChevronDown size={12} style={{ transform: 'rotate(180deg)' }} />
            Edit filters · {filteredArtisans.length} nearby
          </button>
        )}
      </section>

      {/* Region modal */}
      {activeModalRegion && (
        <div className="modal-overlay">
          <div className="region-modal">
            <div className="region-modal-img-wrap">
              <img src={activeModalRegion.image} className="region-modal-img" alt={activeModalRegion.craft} />
              <div className="region-modal-img-overlay" />
              <button type="button" onClick={() => { setActiveModalRegion(null); setRegionDetail(null); }} className="region-modal-close">
                <X size={16} />
              </button>
              <div className="region-modal-img-info">
                <span className="region-modal-category">{activeModalRegion.category}</span>
                <h3 className="region-modal-name">{activeModalRegion.name}, {activeModalRegion.state}</h3>
              </div>
            </div>
            <div className="region-modal-body">
              <h4 className="region-modal-craft">{activeModalRegion.craft}</h4>
              <p className="region-modal-info">{activeModalRegion.info}</p>

              {regionLoading && <p className="text-muted-sm italic">Loading regional catalog...</p>}

              {!regionLoading && regionDetail?.products?.length > 0 && (
                <div className="region-detail-section">
                  <p className="region-detail-label">Featured artifacts</p>
                  <ul className="region-detail-list">
                    {regionDetail.products.slice(0, 3).map(p => (
                      <li key={p.id} className="region-detail-item">
                        <span>{p.name}</span>
                        <span className="text-primary fw-bold">{p.priceDisplay || p.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!regionLoading && regionDetail?.workshops?.length > 0 && (
                <div className="region-detail-section">
                  <p className="region-detail-label">Open workshops</p>
                  <ul className="region-workshop-list">
                    {regionDetail.workshops.slice(0, 3).map(w => (
                      <li key={w.id}>
                        <button type="button" onClick={() => goToWorkshop(w.id)} className="region-workshop-btn">
                          <span className="fw-bold">{w.title}</span>
                          <span className="text-muted-sm">{w.date}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="region-modal-actions">
                {regionDetail?.workshops?.[0] && (
                  <button type="button" onClick={() => goToWorkshop(regionDetail.workshops[0].id)} className="btn-primary flex-1">
                    View Workshop
                  </button>
                )}
                <button type="button" onClick={() => { setActiveModalRegion(null); setRegionDetail(null); }} className="btn-outline">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="explore" onNavigate={onNavigate} />
    </div>
  );
}
