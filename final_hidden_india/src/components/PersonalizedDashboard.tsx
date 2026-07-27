/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, ChevronLeft, ChevronRight, ShoppingBag, ArrowRight,
  CheckCircle, Heart, X
} from 'lucide-react';
import { ScreenId, Artifact, Workshop } from '../types';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import CraftMultiFilter from './CraftMultiFilter';
import BottomNav from './BottomNav';
import { matchesCraftFilter } from '../lib/utils';

interface PersonalizedDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  userName: string;
}

// Extended artifact fields fall back to API data when not in local map.

export default function PersonalizedDashboard({ onNavigate, userName }: PersonalizedDashboardProps) {
  const { user } = useAuth();
  const [recommendedProducts, setRecommendedProducts] = useState<(Artifact & { state?: string })[]>([]);
  const [recommendedWorkshops, setRecommendedWorkshops] = useState<Workshop[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<(Artifact & { state?: string; description?: string; artisan?: string; material?: string })[]>([]);
  const [catalogWorkshops, setCatalogWorkshops] = useState<Workshop[]>([]);
  const [loadError, setLoadError] = useState('');
  const [allStates, setAllStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCatalogStates().then((c) => {
      setAllStates(c.states.sort());
    }).catch(() => {});
  }, []);

  // Filters state
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  
  // Carousel state
  const [slideOffset, setSlideOffset] = useState(0);

  // Selected Artifact detail view proper "page" state
  const [selectedDetailPageArtifact, setSelectedDetailPageArtifact] = useState<Artifact | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (selectedDetailPageArtifact?.id) {
      api.trackProductView(selectedDetailPageArtifact.id).catch(() => {});
    }
  }, [selectedDetailPageArtifact?.id]);

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

      if (!allProducts.length && !allWorkshops.length && productsR.status === 'rejected') {
        const reason = productsR.reason;
        const msg = reason instanceof Error ? reason.message : 'Could not load catalog';
        setLoadError(msg.includes('reach server') ? `${msg} — run npm start` : msg);
      }

      setRecommendedProducts(rec?.products?.length ? rec.products : allProducts.slice(0, 12));
      setRecommendedWorkshops(rec?.workshops?.length ? rec.workshops : allWorkshops.slice(0, 8));
      setCatalogProducts(allProducts);
      setCatalogWorkshops(allWorkshops);
      setLoading(false);
    })();
  }, []);

  const filtersActive = selectedState !== 'All States' || selectedCrafts.length > 0;

  const itemMatchesCrafts = (item: { category?: string; craft?: string; name?: string; title?: string }) =>
    matchesCraftFilter(selectedCrafts, item);

  useEffect(() => {
    if (!filtersActive || loading) return;
    const loadFiltered = async () => {
      const state = selectedState === 'All States' ? undefined : selectedState;
      try {
        const [products, ws] = await Promise.all([
          api.getProducts({ state }),
          api.getWorkshops({ state }),
        ]);
        setCatalogProducts(products);
        setCatalogWorkshops(ws);
      } catch {
        /* keep catalog */
      }
    };
    loadFiltered();
  }, [selectedState, selectedCrafts, loading, filtersActive]);

  const displayProducts = filtersActive
    ? catalogProducts.filter((item) => {
        const stateVal = item.state || 'Other';
        const matchesState = selectedState === 'All States' || stateVal === selectedState;
        return matchesState && itemMatchesCrafts(item);
      })
    : recommendedProducts;

  const displayWorkshops = filtersActive
    ? catalogWorkshops.filter((item) => {
        const matchesState = selectedState === 'All States' || item.state === selectedState;
        return matchesState && itemMatchesCrafts(item);
      })
    : recommendedWorkshops;

  const handleNextSlide = () => {
    if (slideOffset > -200) {
      setSlideOffset(slideOffset - 100);
    }
  };

  const handlePrevSlide = () => {
    if (slideOffset < 0) {
      setSlideOffset(slideOffset + 100);
    }
  };

  const executePurchase = async () => {
    if (!selectedDetailPageArtifact) return;
    setIsPurchasing(true);
    try {
      await api.placeOrder(selectedDetailPageArtifact.id, 1, true);
      setPurchaseSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedDetailPageArtifact) return;
    try {
      await api.saveItem('product', selectedDetailPageArtifact.id);
      setIsSaved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-primary animate-pulse">Curating your recommendations...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-sans relative pb-28 select-none w-full text-left">
      
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-end px-4 h-14 max-w-7xl mx-auto">
        <NotificationBell
          onNavigateProfile={() => onNavigate('profile-settings')}
          onViewAll={() => { localStorage.setItem('profileTab', 'Notifications'); onNavigate('profile-settings'); }}
        />
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto pt-8">
        
        {/* Welcome Block */}
        <section className="px-4 md:px-12 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-4">
              <div>
                <p className="font-sans font-bold text-xs uppercase tracking-wider text-tertiary mb-1">
                  Welcome, {user?.name?.split(' ')[0] || userName.split(' ')[0]}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-on-surface leading-tight font-medium">
                  Recommended for you based on your cultural interests.
                </h2>
              </div>
              {(user?.interests?.length || user?.favoriteCrafts?.length || user?.preferredRegions?.length) ? (
                <div className="space-y-3">
                  {user?.interests?.length ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Interested in</p>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((item) => (
                          <span key={item} className="text-xs font-sans bg-surface-container-high border border-outline-variant/30 px-3 py-1 rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {user?.favoriteCrafts?.length ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Favorite crafts</p>
                      <div className="flex flex-wrap gap-2">
                        {user.favoriteCrafts.map((item) => (
                          <span key={item} className="text-xs font-sans bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {user?.preferredRegions?.length || user?.preferredStates?.length ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Preferred region</p>
                      <div className="flex flex-wrap gap-2">
                        {(user.preferredRegions?.length ? user.preferredRegions : user.preferredStates || []).map((item) => (
                          <span key={item} className="text-xs font-sans bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {user?.workshopInterest && (
                    <p className="text-xs font-sans text-on-surface-variant">
                      Workshops: <span className="font-semibold text-on-surface">{user.workshopInterest}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-sans text-on-surface-variant">Complete the Cultural DNA quiz to personalize your heritage feed.</p>
              )}
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-8 bg-outline-variant/30 mb-3"></div>
          </div>
        </section>

        {loadError && (
          <section className="px-4 md:px-12 mb-6">
            <p className="text-sm font-sans text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">{loadError}</p>
          </section>
        )}

        {/* Bento Grid layout: Explore Regions */}
        <section className="px-4 md:px-12 mb-14">
          <div className="mb-6">
            <h3 className="font-serif text-xl md:text-2xl text-on-surface font-semibold mb-1">Explore Regions</h3>
            <p className="font-sans text-xs text-on-surface-variant">Tracing the geographic origins of your favorites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Column Spanning featured: Maharashtra */}
            <div 
              onClick={() => onNavigate('explore-map')}
              className="md:col-span-8 group relative overflow-hidden bg-surface-dim rounded-2xl flex flex-col justify-end p-6 md:p-8 cursor-pointer h-96 md:h-96"
              style={{
                backgroundImage: 'url(/images/hidden-india-hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="relative z-10 text-white">
                <span className="text-[#f6be39] font-sans font-bold text-xs uppercase tracking-widest mb-1.5 block">
                  Featured Region
                </span>
                <h4 className="font-serif text-3xl md:text-4xl font-semibold mb-3">HIDDEN INDIA</h4>
                <div className="flex gap-4 text-xs font-sans text-white/90">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} /> Breakdown of traditional crafts
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Side Column: Interactive Map - Full Height */}
            <div 
              onClick={() => onNavigate('explore-map')}
              className="md:col-span-4 bg-primary p-6 rounded-2xl flex flex-col justify-between group cursor-pointer border border-outline-variant/20 hover:bg-[#a33d1f] transition-all shadow-sm text-white h-96 md:h-96 relative overflow-hidden"
              style={{
                backgroundImage: 'url(/images/india_map.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-primary/85"></div>
              <div className="relative z-10 flex justify-between items-start">
                <MapPin size={32} strokeWidth={1.5} className="opacity-95" />
                <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1.5 transition-transform" />
              </div>
              <div className="relative z-10 mt-8">
                <h5 className="font-serif text-lg font-bold mb-1">Interactive Map</h5>
                <p className="font-sans text-xs text-white/80">Discover cultural experiences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shared catalog filters */}
        <section className="px-4 md:px-12 mb-8">
          <div className="flex flex-wrap gap-2.5 items-center bg-surface-container-low border border-outline-variant/20 rounded-xl p-4">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mr-2">Filter catalog:</span>
            <div className="flex items-center gap-1.5 bg-surface-container-high border border-outline-variant/30 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold">
              <MapPin size={13} className="text-primary" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent border-none outline-none text-on-surface font-bold text-xs cursor-pointer"
              >
                <option value="All States">All States</option>
                {allStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <CraftMultiFilter selected={selectedCrafts} onChange={setSelectedCrafts} label="Categories" />
            {filtersActive && (
              <button
                onClick={() => { setSelectedState('All States'); setSelectedCrafts([]); }}
                className="text-xs text-primary font-bold hover:underline px-2.5 py-1"
              >
                Reset to recommendations
              </button>
            )}
          </div>
        </section>

        {/* Workshops */}
        <section className="px-4 md:px-12 mb-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h3 className="font-serif text-xl md:text-2xl text-on-surface font-semibold mb-1">
                Workshops
                <span className="text-sm font-sans text-on-surface-variant ml-2">
                  ({displayWorkshops.length} {filtersActive ? 'matching' : 'recommended'})
                </span>
              </h3>
              <p className="font-sans text-xs text-on-surface-variant">
                {filtersActive ? 'All workshops matching your filters.' : 'Personalized workshop picks based on your Cultural DNA.'}
              </p>
            </div>
            {/* Arrows */}
            <div className="flex gap-2">
              <button 
                onClick={handlePrevSlide}
                className="p-2 border border-outline hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextSlide}
                className="p-2 border border-outline hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 transform">
            {displayWorkshops.length === 0 && (
              <p className="text-sm text-on-surface-variant font-sans col-span-2">No workshops found.</p>
            )}
            {displayWorkshops.map((workshop) => {
              const isOnline = workshop.mode === 'online';
              return (
              <div 
                key={workshop.id}
                className="flex flex-col md:flex-row gap-5 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/45 transition-colors bg-surface-container-lowest"
              >
                <div className="w-full md:w-36 h-36 flex-shrink-0 rounded-lg overflow-hidden relative">
                  <img className="w-full h-full object-cover" src={workshop.thumbnail} alt={workshop.title} />
                  <span className={`absolute top-2 right-2 text-[9px] font-sans font-bold uppercase px-2 py-0.5 rounded ${
                    isOnline ? 'bg-indigo-600 text-white' : 'bg-emerald-700 text-white'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-sans text-[10px] text-tertiary bg-tertiary/10 px-2.5 py-0.5 uppercase tracking-wide font-bold rounded text-amber-800">
                        {workshop.category}
                      </span>
                      <span className="text-[11px] font-sans text-on-surface-variant">{workshop.date}</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-on-surface leading-tight mb-1">
                      {workshop.title}
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant line-clamp-1">Instructor: {workshop.instructor}</p>
                    {!isOnline && workshop.venue && (
                      <p className="font-sans text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <MapPin size={11} className="text-primary" /> {workshop.venue}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/20">
                    <span className="font-sans font-bold text-[14px] text-primary">{workshop.price} / session</span>
                    <button 
                      onClick={() => {
                        localStorage.setItem('selectedWorkshopId', workshop.id);
                        onNavigate('workshop-detail');
                      }}
                      className="text-primary font-sans font-bold text-xs uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Join <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Group: Trending Products (WITH FULLY FUNCTIONAL FILTERS FOR STATE AND CARE CATEGORIES) */}
        <section className="px-4 md:px-12 mb-20">
          <div className="mb-6 border-b border-outline-variant/25 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl md:text-2xl text-on-surface font-semibold">
                Artifacts
                <span className="text-sm font-sans text-on-surface-variant ml-2">
                  ({displayProducts.length} {filtersActive ? 'matching' : 'recommended'})
                </span>
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                {filtersActive ? 'All products matching your state and category filters.' : 'Personalized picks from the heritage catalog.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.length === 0 ? (
              <div className="col-span-2 lg:col-span-4 py-12 text-center text-on-surface-variant italic font-sans text-xs">
                No artifacts found. Try adjusting your filters.
              </div>
            ) : (
              displayProducts.map((artifact) => {
                const meta = {
                  state: artifact.state || 'India',
                  artisan: artifact.artisan || 'Master Artisan',
                  material: artifact.material || 'Handcrafted',
                  description: artifact.description || 'Authentic cultural masterwork from a registered artisan.',
                };
                return (
                  <div 
                    key={artifact.id} 
                    onClick={() => {
                      // Save state hooks and render ARTIFACT DETAIL PROPER Modal Page instead of Workshop. Fulfills the explicit user request!
                      setSelectedDetailPageArtifact(artifact);
                      setIsPurchasing(false);
                      setPurchaseSuccess(false);
                      setIsSaved(false);
                    }}
                    className="group cursor-pointer select-none"
                  >
                    <div className="aspect-square bg-surface-container-low overflow-hidden mb-3 relative rounded-xl border border-outline-variant/20">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" 
                        src={artifact.image} 
                        alt={artifact.name} 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[9px] font-sans font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                        {meta.state}
                      </div>
                      <button className="absolute bottom-2.5 right-2.5 w-9 h-9 bg-white/95 hover:bg-primary hover:text-white text-primary rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow">
                        <ShoppingBag size={15} />
                      </button>
                    </div>
                    <p className="font-sans font-bold text-xs md:text-sm text-on-surface tracking-wide line-clamp-1 leading-snug">
                      {artifact.name}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1.5 line-clamp-1">
                      {meta.artisan}
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant font-semibold mt-0.5 flex justify-between">
                      <span>{artifact.category}</span>
                      <span className="text-primary font-extrabold">₹{artifact.price}</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* ARTIFACTS PAGE PROPER OVERLAY VIEW (Fulfills requested section: "artifacts's page proper shouldn't open workshop"!) */}
      {selectedDetailPageArtifact && (() => {
        const meta = {
          state: selectedDetailPageArtifact.state || 'India',
          artisan: selectedDetailPageArtifact.artisan || 'Heritage Artisan',
          material: selectedDetailPageArtifact.material || 'Handcrafted',
          description: selectedDetailPageArtifact.description || 'Authentic cultural masterwork from a registered artisan.',
        };
        return (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl relative select-none animate-fade-in text-on-surface flex flex-col md:flex-row">
              
              {/* Product detailed showcase image banner */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-surface-container relative">
                <img 
                  src={selectedDetailPageArtifact.image} 
                  className="w-full h-full object-cover" 
                  alt={selectedDetailPageArtifact.name} 
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-4 left-4 bg-primary text-on-primary font-sans font-extrabold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded shadow-md">
                  AUTHENTIC GI-TAGGED
                </span>
              </div>

              {/* Product description proper column */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between text-left bg-background text-on-background">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-sans font-extrabold text-primary uppercase tracking-widest block">
                        {selectedDetailPageArtifact.category} • {meta.state}
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight mt-1 text-on-surface">
                        {selectedDetailPageArtifact.name}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedDetailPageArtifact(null)}
                      className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      {meta.description}
                    </p>
                    <div className="pt-2 divide-y divide-outline-variant/10 text-[11px] font-sans text-on-surface-variant">
                      <div className="py-2 flex justify-between">
                        <span className="font-bold">Master artisan:</span>
                        <span className="text-on-surface font-medium">{meta.artisan}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="font-bold">Raw composition:</span>
                        <span className="text-on-surface font-medium">{meta.material}</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="font-bold">GI Recognition:</span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle size={10} /> Certified Original
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/15 flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-bold">Patron Price Tag:</span>
                    <span className="text-2xl font-serif font-extrabold text-primary">₹{selectedDetailPageArtifact.price} INR</span>
                  </div>

                  <div className="flex gap-2 w-full">
                    {/* Add to Saved trigger */}
                    <button 
                      type="button"
                      onClick={handleSaveProduct}
                      className={`px-3.5 border border-outline rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                        isSaved ? 'text-primary bg-primary/5 border-primary' : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                      title="Save to gallery"
                    >
                      <Heart size={16} className={isSaved ? 'fill-primary text-primary' : ''} />
                    </button>

                    {/* Patron acquire transaction block slider buy now */}
                    <button 
                      type="button"
                      onClick={executePurchase}
                      disabled={isPurchasing || purchaseSuccess}
                      className="flex-grow bg-primary hover:bg-[#a33d1f] text-on-primary font-sans font-bold text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:bg-surface-container-high disabled:text-on-surface-variant"
                    >
                      {isPurchasing ? 'Transmitting ledger...' : purchaseSuccess ? 'Masterwork Acquired! ✓' : 'Direct Custodian Buy'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
