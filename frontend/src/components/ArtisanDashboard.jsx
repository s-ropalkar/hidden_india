import React, { useState, useRef, useEffect } from 'react';
import {
  Award, Plus, Calendar, TrendingUp, Users, ShoppingCart,
  Eye, ChevronRight, Sliders, LogOut, Edit3, Trash2,
  Upload, Save, Check, X, AlertCircle, RefreshCw
} from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ArtisanDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({ workshopRegistrations: 0, productsPurchased: 0, productsViewed: 0 });
  const [approvedCrafts, setApprovedCrafts] = useState([]);
  const [artisanState, setArtisanState] = useState('');
  const [portfolioImage, setPortfolioImage] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('loading');
  const [bookings, setBookings] = useState([]);
  const [studioName, setStudioName] = useState(user?.name || '');
  const [studioBio, setStudioBio] = useState('');
  const [payoutUPI, setPayoutUPI] = useState('');
  const [studioCategory, setStudioCategory] = useState('Weaving/Embroidery');
  const [workshops, setWorkshops] = useState([]);
  const portfolioInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const workshopFileInputRef = useRef(null);

  // Product form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingRef, setEditingRef] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState('In Stock');
  const [formDescription, setFormDescription] = useState('');
  const [formCraft, setFormCraft] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formImageName, setFormImageName] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Workshop form state
  const [isEditingWorkshop, setIsEditingWorkshop] = useState(false);
  const [editingWorkshopRef, setEditingWorkshopRef] = useState(null);
  const [formWTitle, setFormWTitle] = useState('');
  const [formWDate, setFormWDate] = useState('');
  const [formWTime, setFormWTime] = useState('');
  const [formWPrice, setFormWPrice] = useState('');
  const [formWCategory, setFormWCategory] = useState('Hands-on');
  const [formWThumbnail, setFormWThumbnail] = useState('');
  const [formWThumbnailName, setFormWThumbnailName] = useState('');
  const [formWVenue, setFormWVenue] = useState('');
  const [formWSeats, setFormWSeats] = useState(20);
  const [formWCraft, setFormWCraft] = useState('');

  const reloadProducts = () => {
    api.getArtisanProducts().then(list =>
      setProducts(list.map(p => ({ id: p.id, name: p.name, price: p.priceDisplay || `₹${p.price}`, status: p.status, image: p.image })))
    ).catch(() => {});
  };

  const reloadWorkshops = () => {
    api.getArtisanWorkshops().then(list =>
      setWorkshops(list.map(w => ({ id: w.id, title: w.title, instructor: w.instructor, date: w.date, time: w.time, price: w.price, category: w.category, thumbnail: w.thumbnail, venue: w.venue, seats: 20 })))
    ).catch(() => {});
  };

  useEffect(() => {
    reloadProducts();
    reloadWorkshops();
    api.getArtisanAnalytics().then(setAnalytics).catch(() => {});
    api.getArtisanRegistrations().then(list =>
      setBookings(list.map(b => ({
        id: b.id, student: b.student, course: b.course,
        date: b.date, time: b.time, seats: b.seats,
        status: b.status === 'Completed' ? 'Completed' : b.status === 'Registration Submitted' ? 'Pending' : 'Confirmed',
      })))
    ).catch(() => setBookings([]));
    api.getArtisanProfile().then(p => {
      setApprovedCrafts(p.approvedCrafts || []);
      setArtisanState(p.state || '');
      if (p.name) setStudioName(p.name);
      if (p.bio) setStudioBio(p.bio);
      if (p.highlightImage) setPortfolioImage(p.highlightImage);
    }).catch(() => {});
    api.getApplicationStatus()
      .then(d => setApplicationStatus(d.status || 'none'))
      .catch(() => setApplicationStatus('approved'));
  }, []);

  useEffect(() => {
    if (user?.name && !studioName) setStudioName(user.name);
  }, [user?.name, studioName]);

  const startEditProduct = (prod) => {
    setEditingRef(prod); setFormName(prod.name); setFormPrice(prod.price);
    setFormStatus(prod.status); setFormImage(prod.image); setFormImageName(''); setIsEditing(true);
  };

  const handlePhotoUpload = (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'product') { setFormImage(reader.result); setFormImageName(file.name); }
        else { setFormWThumbnail(reader.result); setFormWThumbnailName(file.name); }
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProductEdits = async () => {
    if (!formName || !formPrice || !formCraft) { alert('Name, price, and craft required'); return; }
    setSavingProduct(true);
    try {
      const payload = { name: formName, price: formPrice.startsWith('₹') ? formPrice : `₹${formPrice}`, status: formStatus, description: formDescription, craft: formCraft, image: formImage || '' };
      if (editingRef) await api.updateArtisanProduct(editingRef.id, payload);
      else await api.createArtisanProduct(payload);
      reloadProducts(); setIsEditing(false); setEditingRef(null);
    } catch (err) { alert(err.message || 'Could not save product'); }
    finally { setSavingProduct(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.deleteArtisanProduct(id); reloadProducts(); }
    catch (err) { alert(err.message || 'Delete failed'); }
  };

  const saveWorkshopEdits = async () => {
    if (!formWTitle || !formWPrice || !formWCraft) { alert('Title, price, and craft required'); return; }
    try {
      const payload = { title: formWTitle, date: formWDate, time: formWTime, price: formWPrice, category: formWCategory, craft: formWCraft, thumbnail: formWThumbnail || '', venue: formWVenue, seats: Number(formWSeats) };
      if (editingWorkshopRef) await api.updateArtisanWorkshop(editingWorkshopRef.id, payload);
      else await api.createArtisanWorkshop(payload);
      reloadWorkshops(); setIsEditingWorkshop(false); setEditingWorkshopRef(null);
    } catch (err) { alert(err.message || 'Could not save workshop'); }
  };

  const deleteWorkshop = async (id) => {
    if (!window.confirm('Delete this workshop?')) return;
    try { await api.deleteArtisanWorkshop(id); reloadWorkshops(); }
    catch (err) { alert(err.message || 'Delete failed'); }
  };

  const changeBookingStatus = async (id, newStatus) => {
    try { await api.updateArtisanRegistration(id, newStatus); setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b)); }
    catch (err) { alert(err.message || 'Could not update status'); }
  };

  const artisanInitials = (studioName || 'Artisan').split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const menuItems = [
    { name: 'Dashboard', icon: TrendingUp },
    { name: 'My Products', icon: ShoppingCart },
    { name: 'My Workshops', icon: Award },
    { name: 'Bookings', icon: Calendar },
    { name: 'Studio Settings', icon: Sliders },
  ];

  return (
    <div className="dashboard-split">
      {/* Sidebar */}
      <aside className="artisan-sidebar">
        <div className="artisan-sidebar-top">
          <div className="artisan-profile-row">
            <div className="artisan-initials">{artisanInitials}</div>
            <div>
              <h1 className="artisan-name">{studioName}</h1>
              <div className="artisan-status-row">
                <Award size={13} />
                <span className="artisan-status-label">
                  {applicationStatus === 'approved' ? 'Application Approved'
                    : applicationStatus === 'pending' ? 'Awaiting Approval'
                    : applicationStatus === 'rejected' ? 'Application Rejected'
                    : 'Verified Artisan'}
                </span>
              </div>
            </div>
          </div>
          <div className="sidebar-menu">
            {menuItems.map(m => {
              const Icon = m.icon;
              const isActive = activeMenu === m.name;
              return (
                <button key={m.name} onClick={() => { setActiveMenu(m.name); setIsEditing(false); }}
                  className={`sidebar-btn ${isActive ? 'sidebar-btn--active' : ''}`}>
                  <span className="sidebar-btn-inner"><Icon size={14} /><span>{m.name}</span></span>
                  {isActive && <ChevronRight size={12} />}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => { logout(); onNavigate('join-heritage'); }} className="sidebar-btn sidebar-btn--red">
          <span className="sidebar-btn-inner"><LogOut size={14} /><span>Exit Studio</span></span>
        </button>
      </aside>

      {/* Main content */}
      <main className="artisan-main">
        {applicationStatus !== 'loading' && applicationStatus !== 'none' && (
          <div className={`app-status-banner ${applicationStatus === 'approved' ? 'app-status-banner--ok' : applicationStatus === 'rejected' ? 'app-status-banner--err' : 'app-status-banner--warn'}`}>
            <AlertCircle size={18} />
            <div>
              <p className="fw-bold text-xs uppercase tracking-wide">
                {applicationStatus === 'approved' && 'Application Approved by Admin'}
                {applicationStatus === 'pending' && 'Application Pending Admin Review'}
                {applicationStatus === 'rejected' && 'Application Not Approved'}
              </p>
              <p className="text-muted-sm">
                {applicationStatus === 'approved' && 'Your artisan profile is live. Manage products, workshops, and bookings.'}
                {applicationStatus === 'pending' && 'Your application is under curator review.'}
                {applicationStatus === 'rejected' && 'Please reapply with updated portfolio materials.'}
              </p>
            </div>
          </div>
        )}

        {activeMenu === 'Dashboard' && (
          <div className="form-stack">
            <section>
              <p className="eyebrow">Master Dashboard</p>
              <h2 className="page-title">Namaste, {studioName.split(' ')[0]}.</h2>
              <p className="text-muted-sm">Your heritage craft reached new admirers across India.</p>
            </section>
            <section className="stats-grid">
              <div className="stat-card">
                <div><span className="stat-label">Workshops Registered</span><span className="stat-value">{analytics.workshopRegistrations}</span><span className="stat-sub text-green">Live from database</span></div>
                <div className="stat-icon stat-icon--indigo"><Calendar size={18} /></div>
              </div>
              <div className="stat-card">
                <div><span className="stat-label">Products Purchased</span><span className="stat-value">{analytics.productsPurchased}</span><span className="stat-sub text-green">Orders on your crafts</span></div>
                <div className="stat-icon stat-icon--green"><ShoppingCart size={18} /></div>
              </div>
              <div className="stat-card">
                <div><span className="stat-label">Products Viewed</span><span className="stat-value">{analytics.productsViewed}</span><span className="stat-sub text-amber">Explorer impressions</span></div>
                <div className="stat-icon stat-icon--amber"><Eye size={18} /></div>
              </div>
            </section>
          </div>
        )}

        {activeMenu === 'My Products' && (
          <div className="form-stack">
            <section className="section-heading-row border-bottom pb-4">
              <div>
                <p className="eyebrow">Catalog Hub</p>
                <h2 className="page-title">My Products</h2>
                <p className="text-muted-sm">Manage your digital heritage catalog.</p>
              </div>
              <button onClick={() => { setEditingRef(null); setFormName(''); setFormPrice(''); setFormStatus('In Stock'); setFormDescription(''); setFormCraft(approvedCrafts[0] || ''); setFormImage(''); setFormImageName(''); setIsEditing(true); }} className="btn-primary">
                <Plus size={16} /> Add New Craft
              </button>
            </section>
            <section className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-img-wrap">
                    <img src={p.image} alt={p.name} className="product-img" />
                    <span className={`badge ${p.status === 'In Stock' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{p.name}</h4>
                    <div className="product-footer">
                      <span className="product-price">{p.price}</span>
                      <div className="product-actions">
                        <button onClick={() => startEditProduct(p)} className="link-btn-small"><Edit3 size={11} /> Edit</button>
                        <button onClick={() => deleteProduct(p.id)} className="link-btn-small text-error">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeMenu === 'My Workshops' && (
          <div className="form-stack">
            <section className="section-heading-row border-bottom pb-4">
              <div>
                <p className="eyebrow">Academy Hub</p>
                <h2 className="page-title">My Workshops</h2>
                <p className="text-muted-sm">Schedule masterclasses and manage registrations.</p>
              </div>
              <button onClick={() => { setEditingWorkshopRef(null); setFormWTitle(''); setFormWDate('15 July 2026'); setFormWTime('10:00 AM - 01:00 PM'); setFormWPrice('₹1,500'); setFormWCategory('Hands-on'); setFormWCraft(approvedCrafts[0] || ''); setFormWThumbnail(''); setFormWVenue(artisanState ? `${artisanState} Studio` : 'Heritage Studio'); setFormWSeats(20); setIsEditingWorkshop(true); }} className="btn-primary">
                <Plus size={16} /> Schedule Workshop
              </button>
            </section>
            <section className="workshops-grid">
              {workshops.map(ws => (
                <div key={ws.id} className="workshop-card">
                  <div className="workshop-img-wrap">
                    <img src={ws.thumbnail} alt={ws.title} className="workshop-img" />
                    <span className="badge badge-primary">{ws.category}</span>
                  </div>
                  <div className="workshop-info">
                    <h4 className="workshop-title">{ws.title}</h4>
                    <p className="text-muted-sm">Venue: <strong>{ws.venue}</strong></p>
                    <p className="eyebrow">{ws.date} | {ws.time}</p>
                    <div className="workshop-footer">
                      <span className="workshop-price">{ws.price}</span>
                      <div className="product-actions">
                        <button onClick={() => { setEditingWorkshopRef(ws); setFormWTitle(ws.title); setFormWDate(ws.date); setFormWTime(ws.time); setFormWPrice(ws.price); setFormWCategory(ws.category); setFormWThumbnail(ws.thumbnail); setFormWVenue(ws.venue); setFormWSeats(ws.seats); setIsEditingWorkshop(true); }} className="link-btn-small"><Edit3 size={11} /> Edit</button>
                        <button onClick={() => deleteWorkshop(ws.id)} className="link-btn-small text-error">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeMenu === 'Bookings' && (
          <div className="form-stack">
            <section className="border-bottom pb-4">
              <p className="eyebrow">Classroom Oversight</p>
              <h2 className="page-title">Workshop Registrations</h2>
              <p className="text-muted-sm">Verify students, manage slots, and mark sessions complete.</p>
            </section>
            <section>
              {bookings.length === 0
                ? <div className="empty-state">No workshop registrations yet.</div>
                : <div className="bookings-list">
                    {bookings.map(b => (
                      <div key={b.id} className="booking-row">
                        <div className="booking-row-left">
                          <div className="booking-initials">{b.student.charAt(0)}</div>
                          <div>
                            <div className="booking-name-row">
                              <h4>{b.student}</h4>
                              <span className={`badge ${b.status === 'Confirmed' ? 'badge-green' : b.status === 'Completed' ? 'badge-indigo' : 'badge-amber'}`}>{b.status}</span>
                            </div>
                            <p className="text-muted-sm">{b.course} · <strong>{b.seats} Seat(s)</strong></p>
                            <p className="text-tiny">{b.date} at {b.time}</p>
                          </div>
                        </div>
                        <div className="booking-actions">
                          {b.status === 'Pending' && <button onClick={() => changeBookingStatus(b.id, 'Confirmed')} className="btn-primary btn-sm">Approve</button>}
                          {b.status === 'Confirmed' && <button onClick={() => changeBookingStatus(b.id, 'Completed')} className="btn-outline btn-sm">Mark Complete</button>}
                          {b.status === 'Completed' && <span className="badge badge-indigo">In attendee history</span>}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </section>
          </div>
        )}

        {activeMenu === 'Studio Settings' && (
          <div className="form-stack">
            <section className="border-bottom pb-4">
              <p className="eyebrow">Branding specifications</p>
              <h2 className="page-title">Studio Settings</h2>
              <p className="text-muted-sm">Configure your public-facing shop profile and upload artisan bio.</p>
            </section>
            <section className="panel">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Studio Brand Name</label>
                  <input type="text" value={studioName} onChange={e => setStudioName(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Craft Category Tag</label>
                  <input type="text" value={studioCategory} onChange={e => setStudioCategory(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">UPI ID For Patrons</label>
                  <input type="text" value={payoutUPI} onChange={e => setPayoutUPI(e.target.value)} className="form-input" />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Artisan Portfolio Image</label>
                  <input type="file" ref={portfolioInputRef} accept="image/*" className="hidden" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    try { const res = await api.uploadArtisanPortfolio(file); setPortfolioImage(res.url); }
                    catch (err) { alert(err.message || 'Upload failed'); }
                  }} />
                  <div className="portfolio-upload-row">
                    <div className="portfolio-preview">
                      {portfolioImage ? <img src={portfolioImage} alt="Portfolio" className="portfolio-preview-img" /> : <span className="text-muted-sm">No image</span>}
                    </div>
                    <button type="button" onClick={() => portfolioInputRef.current?.click()} className="btn-outline btn-sm">
                      <Upload size={12} /> Upload portfolio
                    </button>
                  </div>
                  {artisanState && <p className="text-tiny mt-2">Registered state: <strong>{artisanState}</strong></p>}
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Artisan Bio</label>
                  <textarea value={studioBio} onChange={e => setStudioBio(e.target.value)} rows={3} className="form-input" />
                </div>
              </div>
              <div className="form-footer">
                <button onClick={async () => {
                  try { await api.updateArtisanProfile({ name: studioName, bio: studioBio, category: studioCategory, payoutUPI, studioName, studioBio }); alert('Studio profile saved!'); }
                  catch (err) { alert(err.message || 'Save failed'); }
                }} className="btn-primary">
                  <Check size={14} /> Update Branded Identity
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Product edit modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <header className="edit-modal-header">
              <div>
                <h4 className="edit-modal-title">{editingRef ? 'Edit Craft' : 'Upload New Craft'}</h4>
                <p className="text-tiny">Update item specifications below.</p>
              </div>
              <button onClick={() => { setIsEditing(false); setEditingRef(null); }} className="icon-btn"><X size={18} /></button>
            </header>
            <div className="edit-modal-body">
              <div className="form-group">
                <label className="form-label">Approved Craft</label>
                {approvedCrafts.length === 0
                  ? <p className="alert alert-warning">No approved crafts — contact admin after application approval.</p>
                  : <select value={formCraft} onChange={e => setFormCraft(e.target.value)} className="form-input" required>
                      <option value="">Select craft</option>
                      {approvedCrafts.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>}
                {artisanState && <p className="text-tiny mt-1">Products listed under: <strong>{artisanState}</strong></p>}
              </div>
              <div className="form-group">
                <label className="form-label">Craft Title</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="form-input" required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Price (INR)</label>
                  <input type="text" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="form-input">
                    <option value="In Stock">In Stock</option>
                    <option value="Archive">Archive</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Craft Artwork Photo</label>
                <input type="file" ref={fileInputRef} onChange={e => handlePhotoUpload(e, 'product')} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="upload-preview-btn">
                  {formImage ? <><img src={formImage} alt="preview" className="upload-preview-img" /><span className="upload-preview-label"><Upload size={12} /> {formImageName || 'Change Photo'}</span></> : <><Upload size={16} /><span>Select Local File</span></>}
                </button>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button type="button" onClick={() => { setIsEditing(false); setEditingRef(null); }} className="btn-outline flex-1">Cancel</button>
              <button type="button" onClick={saveProductEdits} disabled={savingProduct || approvedCrafts.length === 0} className="btn-primary flex-1">
                <Save size={13} /> {savingProduct ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workshop edit modal */}
      {isEditingWorkshop && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <header className="edit-modal-header">
              <div>
                <h4 className="edit-modal-title">{editingWorkshopRef ? 'Edit Workshop' : 'Schedule Masterclass'}</h4>
                <p className="text-tiny">Enter class enrollment details below.</p>
              </div>
              <button onClick={() => { setIsEditingWorkshop(false); setEditingWorkshopRef(null); }} className="icon-btn"><X size={18} /></button>
            </header>
            <div className="edit-modal-body">
              <div className="form-group">
                <label className="form-label">Approved Craft</label>
                <select value={formWCraft} onChange={e => setFormWCraft(e.target.value)} className="form-input" required>
                  <option value="">Select craft</option>
                  {approvedCrafts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Workshop Title</label>
                <input type="text" value={formWTitle} onChange={e => setFormWTitle(e.target.value)} className="form-input" required placeholder="e.g. Traditional Warli Handpainting" />
              </div>
              <div className="form-group">
                <label className="form-label">Venue Address</label>
                <input type="text" value={formWVenue} onChange={e => setFormWVenue(e.target.value)} className="form-input" required placeholder="Heritage Studio Hall A" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="text" value={formWDate} onChange={e => setFormWDate(e.target.value)} className="form-input" placeholder="15 July 2026" />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="text" value={formWTime} onChange={e => setFormWTime(e.target.value)} className="form-input" placeholder="10:00 AM - 01:00 PM" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fee</label>
                  <input type="text" value={formWPrice} onChange={e => setFormWPrice(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Seats</label>
                  <input type="number" value={formWSeats} onChange={e => setFormWSeats(Number(e.target.value))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Method</label>
                  <select value={formWCategory} onChange={e => setFormWCategory(e.target.value)} className="form-input">
                    <option value="Hands-on">Hands-on</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Workshop Banner Photo</label>
                <input type="file" ref={workshopFileInputRef} onChange={e => handlePhotoUpload(e, 'workshop')} accept="image/*" className="hidden" />
                <button type="button" onClick={() => workshopFileInputRef.current?.click()} className="upload-preview-btn">
                  {formWThumbnail ? <><img src={formWThumbnail} alt="banner" className="upload-preview-img" /><span className="upload-preview-label"><Upload size={12} /> {formWThumbnailName || 'Change Banner'}</span></> : <><Upload size={14} /><span>Select Cover File</span></>}
                </button>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button type="button" onClick={() => { setIsEditingWorkshop(false); setEditingWorkshopRef(null); }} className="btn-outline flex-1">Cancel</button>
              <button type="button" onClick={saveWorkshopEdits} className="btn-primary flex-1">
                <Save size={12} /> Publish Masterclass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
