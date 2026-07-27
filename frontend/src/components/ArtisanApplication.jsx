import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, FileText, Upload, Trash2, ArrowRight, Info, ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ArtisanApplication({ onNavigate, onSubmitApplication }) {
  const { refreshUser } = useAuth();
  const [states, setStates] = useState([]);
  const [stateCrafts, setStateCrafts] = useState({});
  const [selectedState, setSelectedState] = useState('');
  const [craftInput, setCraftInput] = useState('');
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [regionValidation, setRegionValidation] = useState(null);
  const [govtFileName, setGovtFileName] = useState('');
  const [govtUploaded, setGovtUploaded] = useState(false);
  const [certFileName, setCertFileName] = useState('');
  const [certUploaded, setCertUploaded] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [govtFile, setGovtFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const govtInputRef = useRef(null);
  const certInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  useEffect(() => {
    api.getCatalogStates().then(c => { setStates(c.states); setStateCrafts(c.craftsByState); }).catch(() => {});
    api.getApplicationStatus()
      .then(data => { if (data.status === 'pending') onNavigate('artisan-application-status'); })
      .catch(() => {});
  }, [onNavigate]);

  useEffect(() => {
    if (!selectedState || selectedCrafts.length === 0) { setRegionValidation(null); return; }
    const t = setTimeout(() => {
      api.validateApplicationCrafts(selectedState, selectedCrafts)
        .then(setRegionValidation)
        .catch(() => setRegionValidation(null));
    }, 400);
    return () => clearTimeout(t);
  }, [selectedState, selectedCrafts]);

  const addCraft = (craft) => {
    const c = craft.trim();
    if (!c || selectedCrafts.includes(c)) return;
    setSelectedCrafts(prev => [...prev, c]);
    setCraftInput('');
  };

  const suggestedCrafts = selectedState
    ? (stateCrafts[selectedState] || []).filter(c => !selectedCrafts.includes(c)).slice(0, 8)
    : [];

  const handleGovtFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setGovtFileName(file.name); setGovtUploaded(true); setGovtFile(file); }
  };

  const handleCertFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setCertFileName(file.name); setCertUploaded(true); setCertFile(file); }
  };

  const handlePortfolioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortfolioFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setPortfolioPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedState) { alert('Please select your state'); return; }
    if (selectedCrafts.length === 0) { alert('Please add at least one craft'); return; }
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
      alert(err.message || 'Application failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-root">
      <input type="file" ref={govtInputRef} onChange={handleGovtFileChange} accept="image/*,application/pdf" className="hidden" />
      <input type="file" ref={certInputRef} onChange={handleCertFileChange} accept="image/*,application/pdf" className="hidden" />
      <input type="file" ref={portfolioInputRef} onChange={handlePortfolioFileChange} accept="image/*" className="hidden" />

      <header className="page-header page-header--centered">
        <button onClick={() => onNavigate('profile-settings')} className="icon-btn text-primary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="eyebrow">Artisan Journey</span>
          <h2 className="page-header-title">Portfolio &amp; Credentials</h2>
        </div>
      </header>

      <main className="page-main page-main--narrow">
        {/* Step indicator */}
        <div className="step-indicator">
          <div className="step-item step-item--active">
            <span className="step-dot step-dot--active">1</span>
            <span className="step-label">Credentials</span>
          </div>
          <div className="step-line" />
          <div className="step-item">
            <span className="step-dot">2</span>
            <span className="step-label step-label--muted">Agreement</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {/* State & Crafts */}
          <section className="form-section">
            <h3 className="section-title">State &amp; Craft Specializations</h3>
            <p className="text-muted-sm">Select your home state and the crafts you practice.</p>

            <div className="form-group">
              <label className="form-label">Home State / Region</label>
              <select
                value={selectedState}
                onChange={e => { setSelectedState(e.target.value); setSelectedCrafts([]); }}
                className="form-input"
                required
              >
                <option value="">Select your state</option>
                {states.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {selectedState && suggestedCrafts.length > 0 && (
              <div>
                <p className="form-label mb-2">Famous crafts in {selectedState}</p>
                <div className="tag-row">
                  {suggestedCrafts.map(craft => (
                    <button
                      key={craft}
                      type="button"
                      disabled={selectedCrafts.includes(craft)}
                      onClick={() => addCraft(craft)}
                      className="tag tag--suggest"
                    >
                      + {craft}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Your Crafts</label>
              <div className="input-row">
                <input
                  type="text"
                  value={craftInput}
                  onChange={e => setCraftInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCraft(craftInput); } }}
                  placeholder="e.g. Kerala Ceramics, Madhubani Painting"
                  className="form-input"
                />
                <button type="button" onClick={() => addCraft(craftInput)} className="btn-primary btn-sm">Add</button>
              </div>
              {selectedCrafts.length > 0 && (
                <div className="tag-row mt-3">
                  {selectedCrafts.map(craft => (
                    <span key={craft} className="tag tag--primary tag--removable">
                      {craft}
                      <button type="button" onClick={() => setSelectedCrafts(prev => prev.filter(c => c !== craft))}>
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {regionValidation && (
              <div className={`validation-box ${regionValidation.allVerified ? 'validation-box--ok' : 'validation-box--warn'}`}>
                <p className="fw-bold flex items-center gap-1">
                  {regionValidation.allVerified ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {regionValidation.message}
                </p>
                {regionValidation.checks?.map(check => (
                  <p key={check.craft} className="mt-1 pl-4">
                    {check.matchesRegion ? '✓' : '⚠'} <strong>{check.craft}</strong>
                    {check.knownStates?.length ? ` — known in: ${check.knownStates.join(', ')}` : ''}
                  </p>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">About your craft (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your heritage practice, lineage, and materials..."
                className="form-input"
              />
            </div>
          </section>

          {/* Documents */}
          <section className="form-section">
            <h3 className="section-title">Upload Proof Documents</h3>
            <p className="text-muted-sm">We verify craft guilds or national identity bounds securely.</p>

            <div className="upload-zone" onClick={() => govtInputRef.current?.click()}>
              <div className={`upload-icon ${govtUploaded ? 'upload-icon--ok' : ''}`}>
                {govtUploaded ? <CheckCircle2 size={20} /> : <Upload size={18} />}
              </div>
              <h4 className="upload-title">{govtUploaded ? 'Government ID Selected!' : 'Select Government Issued ID'}</h4>
              <p className="text-tiny">Accepts PDF, JPG, PNG</p>
              {govtUploaded && (
                <div className="upload-file-row">
                  <span><FileText size={14} /> {govtFileName}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setGovtUploaded(false); setGovtFileName(''); }} className="icon-btn text-error">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="upload-zone" onClick={() => certInputRef.current?.click()}>
              <div className={`upload-icon ${certUploaded ? 'upload-icon--ok' : ''}`}>
                {certUploaded ? <CheckCircle2 size={20} /> : <Upload size={18} />}
              </div>
              <h4 className="upload-title">{certUploaded ? 'Certificate Selected!' : 'Select Craft Guilds Certificate (Optional)'}</h4>
              <p className="text-tiny">National registries or regional master recognition docs.</p>
              {certUploaded && (
                <div className="upload-file-row">
                  <span><FileText size={14} /> {certFileName}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setCertUploaded(false); setCertFileName(''); }} className="icon-btn text-error">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Portfolio */}
          <section className="form-section">
            <div className="section-heading-row">
              <div>
                <h3 className="section-title">Upload Portfolio Images</h3>
                <p className="text-muted-sm">Select high-quality photos to showcase authentic practices.</p>
              </div>
              <span className="text-primary fw-bold text-sm">{portfolioPhotos.length} Listed</span>
            </div>
            <div className="portfolio-grid">
              {portfolioPhotos.map((photo, i) => (
                <div key={i} className="portfolio-item">
                  <img src={photo} alt={`Portfolio ${i + 1}`} className="portfolio-img" />
                  <button
                    type="button"
                    onClick={() => setPortfolioPhotos(portfolioPhotos.filter((_, idx) => idx !== i))}
                    className="portfolio-remove"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => portfolioInputRef.current?.click()} className="portfolio-add-btn">
                <Plus size={16} />
                <span>Browse</span>
              </button>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="info-box">
            <Info size={18} className="text-primary" />
            <p className="text-sm">
              By submitting, you certify that these submissions consist of handcraft compositions made by yourself, conforming to standard non-industrial methods.
            </p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => onNavigate('profile-settings')} className="btn-outline flex-1">
              Cancel Draft
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Securing...' : 'Submit App'} <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
