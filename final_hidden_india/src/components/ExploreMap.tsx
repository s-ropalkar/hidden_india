/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search, Compass, SlidersHorizontal,
  Plus, Minus, X, ChevronDown,
} from 'lucide-react';
import { ScreenId, Artifact, Workshop } from '../types';
import * as api from '../api';
import type { MapRegionPin, NearbyArtisan } from '../api';
import CraftMultiFilter from './CraftMultiFilter';
import BrandLogo from './BrandLogo';
import BottomNav from './BottomNav';
import { matchesCraftFilter } from '../lib/utils';

interface ExploreMapProps {
  onNavigate: (screen: ScreenId) => void;
}

export default function ExploreMap({ onNavigate }: ExploreMapProps) {
  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.15;

  const [zoom, setZoom] = useState(1);
  const [regionPins, setRegionPins] = useState<MapRegionPin[]>([]);
  const [nearbyArtisans, setNearbyArtisans] = useState<NearbyArtisan[]>([]);
  const [geoKm, setGeoKm] = useState(25);
  const [userCoords, setUserCoords] = useState({ lat: 26.91, lng: 75.79 });

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [draftQuery, setDraftQuery] = useState('');
  const [draftState, setDraftState] = useState('All States');
  const [draftCrafts, setDraftCrafts] = useState<string[]>([]);
  const [draftKm, setDraftKm] = useState(25);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('');

  const [activeModalRegion, setActiveModalRegion] = useState<MapRegionPin | null>(null);
  const [regionDetail, setRegionDetail] = useState<{
    products: Artifact[];
    workshops: Workshop[];
    artisans: Array<{ id: string; name: string }>;
  } | null>(null);
  const [regionLoading, setRegionLoading] = useState(false);

  useEffect(() => {
    const craft = localStorage.getItem('mapCraftFilter');
    const stateFilter = localStorage.getItem('mapStateFilter');
    if (craft || stateFilter) {
      if (craft) {
        setDraftCrafts([craft]);
        setSelectedCrafts([craft]);
      }
      if (stateFilter) {
        setDraftState(stateFilter);
        setSelectedState(stateFilter);
      }
      localStorage.removeItem('mapCraftFilter');
      localStorage.removeItem('mapStateFilter');
    }
    api.getMapRegions().then(setRegionPins).catch(() => setRegionPins([]));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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

  const handleClearFilters = () => {
    setDraftQuery('');
    setDraftState('All States');
    setDraftCrafts([]);
    setDraftKm(25);
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedCrafts([]);
    setGeoKm(25);
  };

  const stateOptions = [...new Set(regionPins.map((p) => p.state))].sort();

  const matchesCrafts = (craft: string, category: string) =>
    matchesCraftFilter(selectedCrafts, { craft, category });

  const filteredPins = regionPins.filter((pin) => {
    const matchesState = selectedState === 'All States' || pin.state === selectedState;
    const matchesCategory = matchesCrafts(pin.craft, pin.category);
    const matchesSearch =
      searchQuery === '' ||
      pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.craft.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  const filteredArtisans = nearbyArtisans.filter((artisan) => {
    const matchesState = selectedState === 'All States' || artisan.state === selectedState;
    const matchesCategory = matchesCrafts(artisan.craft, artisan.category);
    const matchesSearch =
      searchQuery === '' ||
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.craft.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesCategory && matchesSearch;
  });

  const openRegion = async (pin: MapRegionPin) => {
    setSelectedRegion(pin.id);
    setActiveModalRegion(pin);
    setRegionLoading(true);
    setRegionDetail(null);
    try {
      const detail = await api.getRegion(pin.state);
      setRegionDetail({
        products: detail.products,
        workshops: detail.workshops,
        artisans: detail.artisans.map((a) => ({ id: a.id, name: a.name })),
      });
    } catch {
      setRegionDetail(null);
    } finally {
      setRegionLoading(false);
    }
  };

  const goToWorkshop = (workshopId: string) => {
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
    <div className="bg-background text-on-background font-sans relative min-h-screen select-none w-full flex flex-col">
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-outline-variant/20 px-4 py-2 flex items-center justify-between">
        <BrandLogo size="sm" />
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-primary/30 text-primary px-3 py-1.5 rounded-full"
        >
          <SlidersHorizontal size={12} />
          {filtersOpen ? 'Hide' : 'Filters'}
          {!filtersOpen && activeFilterCount > 0 && (
            <span className="bg-primary text-on-primary w-4 h-4 rounded-full text-[9px] flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <header className="z-40 px-4 pt-2 pb-3 pointer-events-auto border-b border-outline-variant/15 bg-surface/98">
          <div className="max-w-lg mx-auto bg-surface-container-low border border-outline-variant/25 p-3.5 rounded-2xl shadow-lg flex flex-col gap-3 card-3d">
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-3.5 py-1.5 input-well">
              <Search size={18} className="text-outline shrink-0" />
              <input
                type="text"
                placeholder="Search Kutch, Varanasi, Madhubani..."
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                className="bg-transparent text-sm w-full font-sans font-medium placeholder-on-surface-variant/50 outline-none border-none py-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <label className="text-[9px] font-sans font-extrabold uppercase text-primary tracking-wider mb-1">State</label>
                <select
                  value={draftState}
                  onChange={(e) => setDraftState(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-sans px-2.5 py-2 rounded-lg outline-none cursor-pointer font-semibold"
                >
                  <option value="All States">All States ({regionPins.length})</option>
                  {stateOptions.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <label className="text-[9px] font-sans font-extrabold uppercase text-primary tracking-wider mb-1">Crafts</label>
                <CraftMultiFilter selected={draftCrafts} onChange={setDraftCrafts} />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-[9px] font-sans font-extrabold uppercase text-primary tracking-wider mb-1">
                  Nearby radius: {draftKm} km
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={draftKm}
                  onChange={(e) => setDraftKm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#a33d1f] transition-colors"
              >
                Apply & View Map
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 border border-outline-variant/40 rounded-xl text-xs font-bold uppercase text-on-surface-variant"
              >
                Clear
              </button>
            </div>
          </div>
        </header>
      )}

      <section className={`flex-grow relative map-container overflow-hidden flex items-center justify-center p-2 md:p-4 transition-all ${filtersOpen ? 'pt-2' : 'pt-0'}`}>
        <div
          className="relative w-fit max-w-full mx-auto"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <img
            className="block max-w-full w-auto h-auto max-h-[min(72vh,680px)] opacity-95 drop-shadow-xl select-none"
            src="/images/india-states-map.png"
            alt="India States Map"
            draggable={false}
          />

          {filteredPins.map((pin) => {
            const isSelected = selectedRegion === pin.id;
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => openRegion(pin)}
                style={{ left: pin.x, top: pin.y }}
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              >
                <div className="relative">
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white border-2 shadow-lg transition-transform duration-300 ${
                      isSelected ? 'scale-125 map-glow-pin' : 'scale-100 group-hover:scale-110'
                    }`}
                    style={{ backgroundColor: pin.color, borderColor: '#ffffff' }}
                  >
                    <Compass size={10} className={isSelected ? 'animate-spin' : ''} />
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute bottom-9 bg-surface-container border border-outline/25 px-2.5 py-1.5 rounded-xl shadow-md min-w-28">
                    <span className="font-serif text-[11px] font-bold text-on-surface block">{pin.name}</span>
                    <span className="text-[9px] font-sans text-primary font-bold">{pin.craft}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute right-2 md:right-4 bottom-36 md:bottom-44 flex flex-col gap-2 z-20">
          <button
            type="button"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
            className="w-9 h-9 md:w-10 md:h-10 bg-white border border-outline-variant rounded-xl flex items-center justify-center shadow card-3d disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
            className="w-9 h-9 md:w-10 md:h-10 bg-white border border-outline-variant rounded-xl flex items-center justify-center shadow card-3d disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
        </div>

        {!filtersOpen && (
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="absolute left-4 bottom-36 md:bottom-44 z-20 bg-surface/95 border border-outline-variant/30 px-3 py-2 rounded-xl shadow-lg text-[10px] font-bold uppercase text-primary flex items-center gap-1 card-3d"
          >
            <ChevronDown size={12} className="rotate-180" /> Edit filters · {filteredArtisans.length} nearby
          </button>
        )}
      </section>

      {activeModalRegion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl card-3d text-on-surface">
            <div className="relative h-44 bg-surface-container">
              <img src={activeModalRegion.image} className="w-full h-full object-cover" alt={activeModalRegion.craft} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button type="button" onClick={() => { setActiveModalRegion(null); setRegionDetail(null); }} className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full"><X size={16} /></button>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-[9px] font-extrabold uppercase bg-primary px-2 py-0.5 rounded">{activeModalRegion.category}</span>
                <h3 className="font-serif text-lg font-bold mt-1">{activeModalRegion.name}, {activeModalRegion.state}</h3>
              </div>
            </div>
            <div className="p-5 space-y-4 text-left">
              <h4 className="font-serif font-bold">{activeModalRegion.craft}</h4>
              <p className="text-xs text-on-surface-variant">{activeModalRegion.info}</p>

              {regionLoading && (
                <p className="text-xs text-on-surface-variant italic">Loading regional catalog...</p>
              )}

              {!regionLoading && regionDetail && regionDetail.products.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Featured artifacts</p>
                  <ul className="text-xs space-y-1">
                    {regionDetail.products.slice(0, 3).map((p) => (
                      <li key={p.id} className="flex justify-between gap-2">
                        <span className="line-clamp-1">{p.name}</span>
                        <span className="text-primary font-bold shrink-0">{p.priceDisplay || p.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!regionLoading && regionDetail && regionDetail.workshops.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Open workshops</p>
                  <ul className="text-xs space-y-2">
                    {regionDetail.workshops.slice(0, 3).map((w) => (
                      <li key={w.id}>
                        <button
                          type="button"
                          onClick={() => goToWorkshop(w.id)}
                          className="w-full text-left px-2 py-1.5 rounded-lg border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        >
                          <span className="font-bold block line-clamp-1">{w.title}</span>
                          <span className="text-on-surface-variant">{w.date} · {w.host}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!regionLoading && regionDetail && regionDetail.products.length === 0 && regionDetail.workshops.length === 0 && (
                <p className="text-xs text-on-surface-variant italic border-t pt-3">No catalog items in this region yet.</p>
              )}

              <div className="flex gap-2">
                {regionDetail?.workshops?.[0] && (
                  <button
                    type="button"
                    onClick={() => goToWorkshop(regionDetail.workshops[0].id)}
                    className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl text-xs font-bold uppercase"
                  >
                    View Workshop
                  </button>
                )}
                <button type="button" onClick={() => { setActiveModalRegion(null); setRegionDetail(null); }} className="px-4 border rounded-xl text-xs font-bold uppercase">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="explore" onNavigate={onNavigate} />
    </div>
  );
}
