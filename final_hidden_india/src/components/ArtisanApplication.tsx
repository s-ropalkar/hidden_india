/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, FileText, Upload, Trash2, ArrowRight, Save, Info, ArrowLeft, Image as ImageIcon, Plus, AlertTriangle } from 'lucide-react';
import { ScreenId, RegionValidation } from '../types';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

interface ArtisanApplicationProps {
  onNavigate: (screen: ScreenId) => void;
  onSubmitApplication: () => void;
}

// const CATEGORIES = [
//   { id: 'weave', name: 'Handloom Weaving', icon: '🧶' },
//   { id: 'ceramic', name: 'Ceramic Arts', icon: '🏺' },
//   { id: 'metal', name: 'Metal Craft', icon: '🛠️' },
//   { id: 'wood', name: 'Wood Carving', icon: '🪵' }
// ];

export default function ArtisanApplication({ onNavigate, onSubmitApplication }: ArtisanApplicationProps) {
  const { refreshUser } = useAuth();
  const [states, setStates] = useState<string[]>([]);
  const [stateCrafts, setStateCrafts] = useState<Record<string, string[]>>({});
  const [selectedState, setSelectedState] = useState('');
  const [craftInput, setCraftInput] = useState('');
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [regionValidation, setRegionValidation] = useState<RegionValidation | null>(null);
  const [govtFileName, setGovtFileName] = useState('');
  const [govtUploaded, setGovtUploaded] = useState(false);
  
  const [certFileName, setCertFileName] = useState('');
  const [certUploaded, setCertUploaded] = useState(false);

  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [govtFile, setGovtFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const govtInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCatalogStates().then((c) => {
      setStates(c.states);
      setStateCrafts(c.craftsByState);
    }).catch(() => {});
    api.getApplicationStatus()
      .then((data) => {
        if (data.status === 'pending') {
          onNavigate('artisan-application-status');
        }
      })
      .catch(() => {});
  }, [onNavigate]);

  useEffect(() => {
    if (!selectedState || selectedCrafts.length === 0) {
      setRegionValidation(null);
      return;
    }
    const t = setTimeout(() => {
      api.validateApplicationCrafts(selectedState, selectedCrafts)
        .then(setRegionValidation)
        .catch(() => setRegionValidation(null));
    }, 400);
    return () => clearTimeout(t);
  }, [selectedState, selectedCrafts]);

  const addCraft = (craft: string) => {
    const c = craft.trim();
    if (!c || selectedCrafts.includes(c)) return;
    setSelectedCrafts((prev) => [...prev, c]);
    setCraftInput('');
  };

  const removeCraft = (craft: string) => {
    setSelectedCrafts((prev) => prev.filter((c) => c !== craft));
  };

  const suggestedCrafts = selectedState
    ? (stateCrafts[selectedState] || []).filter((c) => !selectedCrafts.includes(c)).slice(0, 8)
    : [];

  // File Change Handlers using standard FileReader for instant browser rendering
  const handleGovtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGovtFileName(file.name);
      setGovtUploaded(true);
      setGovtFile(file);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFileName(file.name);
      setCertUploaded(true);
      setCertFile(file);
    }
  };

  const handlePortfolioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolioFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPortfolioPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState) {
      alert('Please select your state');
      return;
    }
    if (selectedCrafts.length === 0) {
      alert('Please add at least one craft specialization');
      return;
    }
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append('state', selectedState);
      form.append('region', `${selectedState}, India`);
      form.append('crafts', JSON.stringify([...new Set(selectedCrafts)]));
      form.append('craftCategory', [...new Set(selectedCrafts)].join(', '));
      form.append('description', description);
      if (govtFile) form.append('govtId', govtFile);
      if (certFile) form.append('cert', certFile);
      portfolioFiles.forEach((f, i) => form.append(`portfolio${i}`, f));
      await api.submitArtisanApplication(form);
      await refreshUser();
      onSubmitApplication();
      onNavigate('artisan-application-status');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Application failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-32 w-full text-left">
      {/* Hidden inputs to trigger real browser selection dialogues */}
      <input 
        type="file" 
        ref={govtInputRef} 
        onChange={handleGovtFileChange} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={certInputRef} 
        onChange={handleCertFileChange} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={portfolioInputRef} 
        onChange={handlePortfolioFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Step Header */}
      <header className="w-full sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center h-16 px-4 max-w-lg mx-auto">
        <button 
          onClick={() => onNavigate('profile-settings')}
          className="p-2 text-primary hover:bg-surface-container rounded-full active:scale-95 transition-transform mr-2 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="block font-sans font-bold text-[10px] text-tertiary uppercase tracking-wider">Artisan Journey</span>
          <h2 className="font-serif text-[16px] font-bold text-on-surface">Portfolio & Credentials</h2>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg mx-auto px-4 pt-8">
        {/* Step Indicator Dot row */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-sans font-bold text-[11px] flex items-center justify-center">1</span>
            <span className="font-sans font-extrabold text-[10px] text-on-surface uppercase tracking-wider">Credentials</span>
          </div>
          <div className="h-[2px] w-8 bg-outline-variant"></div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-surface-container-high border border-outline text-on-surface-variant font-sans font-bold text-[11px] flex items-center justify-center">2</span>
            <span className="font-sans font-bold text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Agreement</span>
          </div>
        </div>

        <form onSubmit={handleApplySubmit} className="space-y-8">
          
          {/* State & Crafts */}
          <section className="space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">State & Craft Specializations</h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Select your home state and the crafts you practice. Admin will verify regional heritage alignment.
              </p>
            </div>

            <div>
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                Home State / Region
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCrafts([]);
                }}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select your state</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {selectedState && suggestedCrafts.length > 0 && (
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Famous crafts in {selectedState}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedCrafts.map((craft) => (
                    <button
                      key={craft}
                      type="button"
                      disabled={selectedCrafts.includes(craft)}
                      onClick={() => addCraft(craft)}
                      className={`text-[10px] font-sans font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                        selectedCrafts.includes(craft)
                          ? 'border-outline-variant/30 text-on-surface-variant opacity-50 cursor-not-allowed'
                          : 'border-primary/30 text-primary hover:bg-primary/10'
                      }`}
                    >
                      + {craft}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                Your Crafts (add one or more)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={craftInput}
                  onChange={(e) => setCraftInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCraft(craftInput);
                    }
                  }}
                  placeholder="e.g. Kerala Ceramics, Madhubani Painting"
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => addCraft(craftInput)}
                  className="px-4 py-3 bg-primary text-on-primary rounded-xl font-sans text-xs font-bold uppercase"
                >
                  Add
                </button>
              </div>
              {selectedCrafts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedCrafts.map((craft) => (
                    <span
                      key={craft}
                      className="inline-flex items-center gap-1.5 bg-primary-container/20 text-primary px-3 py-1 rounded-full text-xs font-bold"
                    >
                      {craft}
                      <button type="button" onClick={() => removeCraft(craft)} className="hover:text-error">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {regionValidation && (
              <div className={`p-4 rounded-xl border text-xs font-sans ${
                regionValidation.allVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <p className="font-bold flex items-center gap-1.5">
                  {regionValidation.allVerified ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {regionValidation.message}
                </p>
                {regionValidation.checks?.map((check) => (
                  <p key={check.craft} className="mt-1.5 pl-5">
                    {check.matchesRegion ? '✓' : '⚠'} <strong>{check.craft}</strong>
                    {check.knownStates?.length
                      ? ` — known in: ${check.knownStates.join(', ')}`
                      : ''}
                  </p>
                ))}
              </div>
            )}

            <div>
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                About your craft (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your heritage practice, lineage, and materials..."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </section>

          {/* Section: Credentials upload */}
          <section className="space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">Upload Proof Documents</h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">We verify craft guilds or national identity bounds securely.</p>
            </div>

            {/* Document 1: Government ID */}
            <div className="border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low p-5 text-center transition-colors">
              <div 
                onClick={() => govtInputRef.current?.click()}
                className="cursor-pointer space-y-2 select-none group"
              >
                <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center mx-auto text-primary shadow-sm group-hover:bg-primary-container/20 transition-all">
                  {govtUploaded ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Upload size={18} />}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">
                    {govtUploaded ? 'Government Issued ID Selected!' : 'Select Government Issued ID'}
                  </h4>
                  <p className="font-sans text-[10px] text-on-surface-variant mt-1">Accepts PDF, JPG, PNG or High-Res Photos from block.</p>
                </div>
              </div>

              {govtUploaded && (
                <div className="mt-3.5 bg-surface-container-high py-2 px-3 rounded flex items-center justify-between">
                  <span className="font-sans text-xs font-bold text-primary flex items-center gap-1.5 leading-none truncate max-w-[80%]">
                    <FileText size={14} /> {govtFileName || 'ID_VERIFICATION_CERT.PNG'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setGovtUploaded(false); setGovtFileName(''); }} 
                    className="text-error hover:bg-error-container/20 p-1 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Document 2: Craft guilds certificate */}
            <div className="border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low p-5 text-center transition-colors">
              <div 
                onClick={() => certInputRef.current?.click()}
                className="cursor-pointer space-y-2 select-none group"
              >
                <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center mx-auto text-primary shadow-sm group-hover:bg-primary-container/20 transition-all">
                  {certUploaded ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Upload size={18} />}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">
                    {certUploaded ? 'Craft Certificate Selected!' : 'Select Craft Guilds Certificate (Optional)'}
                  </h4>
                  <p className="font-sans text-[10px] text-on-surface-variant mt-1">National registries or regional master recognition docs.</p>
                </div>
              </div>

              {certUploaded && (
                <div className="mt-3.5 bg-surface-container-high py-2 px-3 rounded flex items-center justify-between">
                  <span className="font-sans text-xs font-bold text-primary flex items-center gap-1.5 leading-none truncate max-w-[80%]">
                    <FileText size={14} /> {certFileName || 'CRAFT_REGISTRY.PDF'}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setCertUploaded(false); setCertFileName(''); }} 
                    className="text-error hover:bg-error-container/20 p-1 rounded transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section: Upload portfolio */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-serif text-lg font-bold text-on-surface">Upload Portfolio Images</h3>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">Select high-quality photos to showcase authentic practices.</p>
              </div>
              <span className="font-sans text-xs font-bold text-primary">{portfolioPhotos.length} Listed</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {portfolioPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                  <img className="w-full h-full object-cover" src={photo} alt={`Item ${index+1}`} />
                  <button 
                    type="button" 
                    onClick={() => setPortfolioPhotos(portfolioPhotos.filter((p, i) => i !== index))}
                    className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-error hover:text-white text-on-surface p-1 rounded transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => portfolioInputRef.current?.click()}
                className="aspect-square border border-dashed border-outline-variant hover:border-primary rounded-lg flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-all text-outline hover:text-primary gap-1 cursor-pointer"
              >
                <Plus size={16} />
                <span className="font-sans text-[9px] font-bold uppercase tracking-wider">Browse</span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant italic">Select file to connect locally and render your photo into the portfolio display above.</p>
          </section>

          {/* Security alerts checkmark label */}
          <div className="bg-surface-container border border-outline/10 p-4 rounded-xl space-y-2 flex items-start gap-3">
            <Info size={18} className="text-[#8c2d0f] shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-xs text-on-surface font-medium leading-relaxed">
                By submitting, you certify that these submissions consist of handcraft compositions made by yourself, conforming to standard non-industrial methods.
              </p>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={() => onNavigate('profile-settings')}
              className="flex-1 border border-outline py-3.5 rounded-lg font-sans font-semi tracking-wider text-xs uppercase text-on-surface-variant hover:bg-surface-container cursor-pointer text-center"
            >
              Cancel Draft
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-on-primary py-3.5 rounded-lg font-sans font-bold text-xs uppercase tracking-widest hover:bg-[#a33d1f] transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer text-center"
            >
              {isSubmitting ? 'Securing...' : 'Submit App'} <ArrowRight size={13} />
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
