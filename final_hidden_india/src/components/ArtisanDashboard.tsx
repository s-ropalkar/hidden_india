/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Award, Plus, Calendar, TrendingUp, Users, ShoppingCart, 
  Eye, Star, ChevronRight, Sliders, LogOut, Edit3, Trash2, 
  Upload, Tag, Save, Check, X, AlertCircle, RefreshCw 
} from 'lucide-react';
import { ScreenId } from '../types';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

interface ArtisanDashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

interface ProductItem {
  id: string;
  name: string;
  price: string;
  status: 'In Stock' | 'Archive' | 'Sold';
  image: string;
}

interface BookingItem {
  id: string;
  student: string;
  course: string;
  date: string;
  time: string;
  seats: number;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

interface WorkshopItem {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  price: string;
  category: 'Hands-on' | 'Masterclass' | 'Seminar';
  thumbnail: string;
  venue: string;
  seats: number;
}

export default function ArtisanDashboard({ onNavigate }: ArtisanDashboardProps) {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [analytics, setAnalytics] = useState({ workshopRegistrations: 0, productsPurchased: 0, productsViewed: 0 });
  const [approvedCrafts, setApprovedCrafts] = useState<string[]>([]);
  const [artisanState, setArtisanState] = useState('');
  const [portfolioImage, setPortfolioImage] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<'approved' | 'pending' | 'rejected' | 'none' | 'loading'>('loading');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [studioName, setStudioName] = useState(user?.name || '');
  const [studioBio, setStudioBio] = useState('');
  const [payoutUPI, setPayoutUPI] = useState('');
  const [studioCategory, setStudioCategory] = useState('Weaving/Embroidery');
  const [studioLocation, setStudioLocation] = useState('');
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const reloadProducts = () => {
    api.getArtisanProducts().then((list) =>
      setProducts(
        list.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.priceDisplay || `₹${p.price}`,
          status: p.status,
          image: p.image,
        }))
      )
    ).catch(() => {});
  };

  const reloadWorkshops = () => {
    api.getArtisanWorkshops().then((list) =>
      setWorkshops(
        list.map((w) => ({
          id: w.id,
          title: w.title,
          instructor: w.instructor,
          date: w.date,
          time: w.time,
          price: w.price,
          category: w.category,
          thumbnail: w.thumbnail,
          venue: w.venue,
          seats: 20,
        }))
      )
    ).catch(() => {});
  };

  useEffect(() => {
    reloadProducts();
    reloadWorkshops();
    api.getArtisanAnalytics().then(setAnalytics).catch(() => {});
    api.getArtisanRegistrations().then((list) =>
      setBookings(
        list.map((b) => ({
          id: b.id,
          student: b.student,
          course: b.course,
          date: b.date,
          time: b.time,
          seats: b.seats,
          status: (b.status === 'Completed' ? 'Completed' : b.status === 'Registration Submitted' ? 'Pending' : 'Confirmed') as BookingItem['status'],
        }))
      )
    ).catch(() => setBookings([]));
    api.getArtisanProfile().then((p) => {
      setApprovedCrafts(p.approvedCrafts || []);
      setArtisanState(p.state || '');
      if (p.name) setStudioName(String(p.name));
      if (p.bio) setStudioBio(String(p.bio));
      if (p.highlightImage) setPortfolioImage(String(p.highlightImage));
    }).catch(() => {});
    api.getApplicationStatus()
      .then((data) => setApplicationStatus((data.status as typeof applicationStatus) || 'none'))
      .catch(() => setApplicationStatus('approved'));
  }, []);

  useEffect(() => {
    if (user?.name && !studioName) setStudioName(user.name);
  }, [user?.name, studioName]);

  // Edit / Add product states
  const [isEditing, setIsEditing] = useState(false);
  const [editingRef, setEditingRef] = useState<ProductItem | null>(null);
  
  // Adding modal fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState<'In Stock' | 'Archive' | 'Sold'>('In Stock');
  const [formDescription, setFormDescription] = useState('');
const [formRawComposition, setFormRawComposition] = useState('');
const [formState, setFormState] = useState('');
  const [formCraft, setFormCraft] = useState('');
  const [formWCraft, setFormWCraft] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [formImage, setFormImage] = useState('');
  const [formImageName, setFormImageName] = useState('');

  // Edit / Add workshop states
  const [isEditingWorkshop, setIsEditingWorkshop] = useState(false);
  const [editingWorkshopRef, setEditingWorkshopRef] = useState<WorkshopItem | null>(null);
  const [formWTitle, setFormWTitle] = useState('');
  const [formWDate, setFormWDate] = useState('');
  const [formWTime, setFormWTime] = useState('');
  const [formWPrice, setFormWPrice] = useState('');
  const [formWCategory, setFormWCategory] = useState<'Hands-on' | 'Masterclass' | 'Seminar'>('Hands-on');
  const [formWThumbnail, setFormWThumbnail] = useState('');
  const [formWThumbnailName, setFormWThumbnailName] = useState('');
  const [formWVenue, setFormWVenue] = useState('');
  const [formWSeats, setFormWSeats] = useState<number>(20);

  // Local browser connection file input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workshopFileInputRef = useRef<HTMLInputElement>(null);

  // Load selected product info into editing modal state
  const startEditProduct = (prod: ProductItem) => {
    setEditingRef(prod);
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormStatus(prod.status);
    setFormImage(prod.image);
    setFormImageName('');
    setIsEditing(true);
  };

  // Process the photo uploaded through local browser connection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'workshop') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'product') {
            setFormImage(reader.result);
            setFormImageName(file.name);
          } else {
            setFormWThumbnail(reader.result);
            setFormWThumbnailName(file.name);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving the edited product back to React states
  const saveProductEdits = async () => {
    if (!formName || !formPrice || !formCraft) {
      alert('Name, price, and approved craft are required');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        name: formName,
        price: formPrice.startsWith('₹') ? formPrice : `₹${formPrice}`,
        status: formStatus,
        description: formDescription,
        craft: formCraft,
        image: formImage || '',
      };
      if (editingRef) {
        await api.updateArtisanProduct(editingRef.id, payload);
      } else {
        await api.createArtisanProduct(payload);
      }
      reloadProducts();
      setIsEditing(false);
      setEditingRef(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCreateProductInit = () => {
    setEditingRef(null);
    setFormName('');
    setFormPrice('');
    setFormStatus('In Stock');
    setFormDescription('');
    setFormCraft(approvedCrafts[0] || '');
    setFormImage('');
    setFormImageName('');
    setIsEditing(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product catalog listing?')) return;
    try {
      await api.deleteArtisanProduct(id);
      reloadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Workshop management operations
  const startEditWorkshop = (ws: WorkshopItem) => {
    setEditingWorkshopRef(ws);
    setFormWTitle(ws.title);
    setFormWDate(ws.date);
    setFormWTime(ws.time);
    setFormWPrice(ws.price);
    setFormWCategory(ws.category);
    setFormWThumbnail(ws.thumbnail);
    setFormWThumbnailName('');
    setFormWVenue(ws.venue);
    setFormWSeats(ws.seats);
    setIsEditingWorkshop(true);
  };

  const handleCreateWorkshopInit = () => {
    setEditingWorkshopRef(null);
    setFormWTitle('');
    setFormWDate('15 July 2026');
    setFormWTime('10:00 AM - 01:00 PM');
    setFormWPrice('₹1,500');
    setFormWCategory('Hands-on');
    setFormWCraft(approvedCrafts[0] || '');
    setFormWThumbnail('');
    setFormWThumbnailName('');
    setFormWVenue(artisanState ? `${artisanState} Studio` : 'Heritage Studio');
    setFormWSeats(20);
    setIsEditingWorkshop(true);
  };

  const saveWorkshopEdits = async () => {
    if (!formWTitle || !formWPrice || !formWCraft) {
      alert('Title, price, and approved craft are required');
      return;
    }
    try {
      const payload = {
        title: formWTitle,
        date: formWDate,
        time: formWTime,
        price: formWPrice,
        category: formWCategory,
        craft: formWCraft,
        thumbnail: formWThumbnail || '',
        venue: formWVenue,
        seats: Number(formWSeats),
      };
      if (editingWorkshopRef) {
        await api.updateArtisanWorkshop(editingWorkshopRef.id, payload);
      } else {
        await api.createArtisanWorkshop(payload);
      }
      reloadWorkshops();
      setIsEditingWorkshop(false);
      setEditingWorkshopRef(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not save workshop');
    }
  };

  const deleteWorkshop = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and delete this workshop event?')) return;
    try {
      await api.deleteArtisanWorkshop(id);
      reloadWorkshops();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // Bookings actions
  const changeBookingStatus = async (id: string, newStatus: 'Confirmed' | 'Pending' | 'Completed') => {
    try {
      await api.updateArtisanRegistration(id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update booking status');
    }
  };

  const artisanInitials = (studioName || 'Artisan')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-background text-on-background font-sans relative min-h-screen pb-20 w-full flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant/35 shrink-0 px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary-container text-primary rounded-full flex items-center justify-center font-serif text-lg font-bold">
              {artisanInitials}
            </div>
            <div>
              <h1 className="font-serif text-[15px] font-bold leading-tight">{studioName}</h1>
              <div className="flex items-center gap-1.5 text-primary mt-1">
                <Award size={13} />
                <span className="font-sans text-[10px] uppercase tracking-wider font-extrabold text-[#7c2d12]">
                  {applicationStatus === 'approved' ? 'Application Approved' : applicationStatus === 'pending' ? 'Awaiting Approval' : applicationStatus === 'rejected' ? 'Application Rejected' : 'Verified Artisan'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { name: 'Dashboard', icon: TrendingUp },
              { name: 'My Products', icon: ShoppingCart },
              { name: 'My Workshops', icon: Award },
              { name: 'Bookings', icon: Calendar },
              { name: 'Studio Settings', icon: Sliders }
            ].map((menu) => {
              const Icon = menu.icon;
              const isActive = activeMenu === menu.name;
              return (
                <button
                  key={menu.name}
                  onClick={() => {
                    setActiveMenu(menu.name);
                    setIsEditing(false);
                  }}
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
                  {isActive && <ChevronRight size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => { logout(); onNavigate('join-heritage'); }}
          className="w-full text-left flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-error font-sans text-xs font-bold uppercase tracking-wider hover:bg-error-container/20 cursor-pointer mt-8 md:mt-0"
        >
          <LogOut size={14} />
          <span>Exit Studio</span>
        </button>
      </aside>

      {/* Main Content Workspace Viewport */}
      <main className="flex-grow p-4 md:p-10 space-y-8 max-w-5xl text-left bg-background text-on-background">

        {applicationStatus !== 'loading' && applicationStatus !== 'none' && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${
            applicationStatus === 'approved'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : applicationStatus === 'rejected'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-wider">
                {applicationStatus === 'approved' && 'Application Approved by Admin'}
                {applicationStatus === 'pending' && 'Application Pending Admin Review'}
                {applicationStatus === 'rejected' && 'Application Not Approved'}
              </p>
              <p className="font-sans text-[11px] mt-1 leading-relaxed opacity-90">
                {applicationStatus === 'approved' && 'Your artisan profile is live. You can manage products, workshops, and bookings from this studio.'}
                {applicationStatus === 'pending' && 'Your application is under curator review. You will be notified once a decision is made.'}
                {applicationStatus === 'rejected' && 'Please contact support or reapply with updated portfolio materials.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Dynamic renders based on activeMenu */}
        {activeMenu === 'Dashboard' && (
          <div className="space-y-8">
            {/* Welcome block */}
            <section>
              <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">Master Dashboard</p>
              <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">
                Namaste, {studioName.split(' ')[0]}.
              </h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed mt-1">
                Your heritage craft reached <span className="text-primary font-bold">new admirers </span> across India. Excellent velocity!
              </p>
            </section>

            {/* Stats row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-surface border border-outline-variant/30 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Workshops Registered</span>
                  <span className="text-2xl font-serif font-bold text-on-surface mt-1.5 block">{analytics.workshopRegistrations}</span>
                  <span className="text-[10px] font-sans text-emerald-600 font-bold block mt-1">Live from database</span>
                </div>
                <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                  <Calendar size={18} />
                </div>
              </div>

              <div className="bg-surface border border-outline-variant/30 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Products Purchased</span>
                  <span className="text-2xl font-serif font-bold text-on-surface mt-1.5 block">{analytics.productsPurchased}</span>
                  <span className="text-[10px] font-sans text-emerald-600 font-bold block mt-1">Orders on your crafts</span>
                </div>
                <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                  <ShoppingCart size={18} />
                </div>
              </div>

              <div className="bg-surface border border-outline-variant/30 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Products Viewed</span>
                  <span className="text-2xl font-serif font-bold text-on-surface mt-1.5 block">{analytics.productsViewed}</span>
                  <span className="text-[10px] font-sans text-amber-700 font-bold block mt-1">Explorer impressions</span>
                </div>
                <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                  <Eye size={18} />
                </div>
              </div>
            </section>

            {/* Quick Actions / Guidelines */}
            <section className="bg-surface-container border border-outline/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <Award className="text-primary shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-base font-bold text-on-surface">Verified Master Patron Guidelines</h4>
                  <p className="font-sans text-xs text-on-surface-variant">Conforming to standard hand-loomed and natural non-industrial block procedures.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans text-xs">
                <div className="p-3 bg-surface/50 border rounded-xl">
                  <span className="font-bold text-primary block">AUTHENTIC PRICING</span>
                  <span className="text-on-surface-variant block mt-0.5">Ensure pricing reflects hours of handwork. Commission to platform is 0% to directly empower you.</span>
                </div>
                <div className="p-3 bg-surface/50 border rounded-xl">
                  <span className="font-bold text-primary block">WORLDWIDE COURIER</span>
                  <span className="text-on-surface-variant block mt-0.5">We handle custom clearing and export packages. Pack carefully into the specified fiber containers.</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeMenu === 'My Products' && (
          <div className="space-y-8">
            {/* Header with quick creation trigger */}
            <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b pb-4">
              <div>
                <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">Catalog Hub</p>
                <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">My Products</h2>
                <p className="font-sans text-xs text-on-surface-variant">Manage your digital heritage catalog, prices, and upload genuine artifact photographs.</p>
              </div>
              <button 
                onClick={handleCreateProductInit}
                className="bg-primary text-on-primary px-5 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#a33d1f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow shrink-0"
              >
                <Plus size={16} /> Add New Craft
              </button>
            </section>

            {/* Grid display with functional Edit trigger */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map((p) => {
                const inStock = p.status === 'In Stock';
                return (
                  <div key={p.id} className="bg-surface border border-outline-variant/25 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="aspect-[4/3] relative bg-surface-container overflow-hidden">
                      <img className="w-full h-full object-cover" src={p.image} alt={p.name} />
                      <span className={`absolute top-2.5 right-2.5 text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        inStock ? 'bg-emerald-100 text-emerald-800 border border-emerald-500/10' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h4 className="font-serif text-sm font-semibold text-on-surface leading-snug line-clamp-2">{p.name}</h4>
                      <div className="flex justify-between items-end mt-4">
                        <span className="font-sans font-bold text-sm text-primary">{p.price}</span>
                        <div className="flex gap-2.5">
                          <button 
                            onClick={() => startEditProduct(p)}
                            className="text-primary text-xs hover:underline uppercase tracking-wide font-sans font-bold cursor-pointer flex items-center gap-0.5"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="text-error text-xs hover:underline uppercase tracking-wide font-sans font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Craft Product Interaction & Edit Modal Form */}
            {isEditing && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-outline-variant/30 rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-on-surface animate-fade-in select-none">
                  <header className="bg-primary/5 p-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
                    <div>
                      <h4 className="font-serif text-sm font-extrabold text-[#ac4425]">
                        {editingRef ? 'Edit Craft Specifications' : 'Upload New Traditional Craft'}
                      </h4>
                      <p className="font-sans text-[10px] text-on-surface-variant">Update item specifications below.</p>
                    </div>
                    <button 
                      onClick={() => { setIsEditing(false); setEditingRef(null); }}
                      className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </header>

                  <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 min-h-0">
                    {/* Craft (approved only) */}
                    <div>
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Approved Craft
                      </label>
                      {approvedCrafts.length === 0 ? (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">No approved crafts on profile — contact admin after application approval.</p>
                      ) : (
                        <select
                          value={formCraft}
                          onChange={(e) => setFormCraft(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/30 text-xs font-sans p-2.5 rounded-lg outline-none cursor-pointer"
                          required
                        >
                          <option value="">Select craft</option>
                          {approvedCrafts.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                      {artisanState && (
                        <p className="text-[10px] text-on-surface-variant mt-1">Products are listed under state: <strong>{artisanState}</strong></p>
                      )}
                    </div>

                    {/* Item Name */}
                    <div>
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Craft Title</label>
                      <input 
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-xs font-sans p-2.5 rounded-lg text-on-surface outline-none"
                        required
                      />
                    </div>

                    {/* Item Price and Status */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Price (INR)</label>
                        <input 
                          type="text"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-xs font-sans p-2.5 rounded-lg text-on-surface outline-none font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-sans font-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Availability Status</label>
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-surface-container border border-outline-variant/30 text-xs font-sans p-2.5 rounded-lg outline-none cursor-pointer"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Archive">Archive</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </div>
                    </div>

                    {/* Product Description */}
<div>
  <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
    Product Description
  </label>

  <textarea
    value={formDescription}
    onChange={(e) => setFormDescription(e.target.value)}
    rows={4}
    placeholder="Describe the craft, its history, uniqueness and cultural significance..."
    className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary text-xs font-sans p-2.5 rounded-lg text-on-surface outline-none resize-none"
  />
</div>



                    {/* Image Upload and Local Browser Connection */}
                    <div>
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Craft Artwork Photo
                      </label>
                      <div className="border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low p-4 text-center">
                        <input 
                          type="file" 
                          id="edit-photo-file" 
                          ref={fileInputRef}
                          onChange={(e) => handlePhotoUpload(e, 'product')}
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-24 bg-surface rounded-lg overflow-hidden border flex flex-col items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors group relative cursor-pointer"
                        >
                          {formImage ? (
                            <>
                              <img className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-60" src={formImage} alt="Uploaded base" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 text-white p-2">
                                <Upload size={14} className="mb-0.5 text-white" />
                                <span className="font-sans text-[9px] font-bold uppercase tracking-wider truncate max-w-xs">{formImageName || 'Change Photograph'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-sans text-[10px] text-on-surface font-semibold">Select Local File</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-on-surface-variant italic mt-1.5">Connects with your browser filesystem to load your photographs.</p>
                    </div>
                  </div>

                  <div className="shrink-0 p-5 pt-3 border-t border-outline-variant/20 bg-white">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setEditingRef(null); }}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-copy text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveProductEdits}
                        disabled={savingProduct || approvedCrafts.length === 0}
                        className="flex-1 py-2.5 bg-primary hover:bg-[#a33d1f] text-on-primary font-sans text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors cursor-pointer select-none shadow text-center flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Save size={13} /> {savingProduct ? 'Saving...' : 'Save Metadata'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'My Workshops' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with quick creation trigger */}
            <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b pb-4">
              <div>
                <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">Academy Hub</p>
                <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">My Workshops</h2>
                <p className="font-sans text-xs text-on-surface-variant">Schedule interactive masterclasses, set registration fees, and review seat parameters.</p>
              </div>
              <button 
                onClick={handleCreateWorkshopInit}
                className="bg-primary text-on-primary px-5 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:bg-[#a33d1f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow shrink-0"
              >
                <Plus size={16} /> Schedule Workshop
              </button>
            </section>

            {/* List of active workshops */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workshops.map((ws) => (
                <div key={ws.id} className="bg-surface border border-outline-variant/25 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="aspect-[2.1/1] relative bg-surface-container overflow-hidden">
                    <img className="w-full h-full object-cover" src={ws.thumbnail} alt={ws.title} />
                    <span className="absolute top-2.5 right-2.5 bg-primary/95 text-on-primary text-[8px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded leading-none shadow-sm">
                      {ws.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-on-surface leading-tight line-clamp-2">{ws.title}</h4>
                      <p className="font-sans text-[11px] text-on-surface-variant mt-1.5 font-medium">Venue: <span className="text-on-surface font-semibold">{ws.venue}</span></p>
                      <p className="font-sans text-[10px] text-[#8c2d0f] font-bold mt-1.5 uppercase tracking-wide">
                        {ws.date} | {ws.time}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                      <div>
                        <span className="block font-sans text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Registration fee</span>
                        <span className="font-sans font-extrabold text-[#7c2d12] text-sm">{ws.price}</span>
                      </div>
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => startEditWorkshop(ws)}
                          className="text-primary text-xs hover:underline uppercase tracking-wide font-sans font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button 
                          onClick={() => deleteWorkshop(ws.id)}
                          className="text-error text-xs hover:underline uppercase tracking-wide font-sans font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Editing / Creating Workshop modal form */}
            {isEditingWorkshop && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-outline-variant/30 rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-on-surface animate-fade-in select-none">
                  <header className="bg-primary/5 p-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
                    <div>
                      <h4 className="font-serif text-sm font-extrabold text-[#ac4425]">
                        {editingWorkshopRef ? 'Edit Workshop Schedule' : 'Schedule Custom Masterclass'}
                      </h4>
                      <p className="font-sans text-[10px] text-on-surface-variant font-medium">Enter traditional class enrollment details below.</p>
                    </div>
                    <button 
                      onClick={() => { setIsEditingWorkshop(false); setEditingWorkshopRef(null); }}
                      className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </header>

                  <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 text-xs font-sans min-h-0">
                    {/* Approved craft */}
                    <div>
                      <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Approved Craft</label>
                      <select
                        value={formWCraft}
                        onChange={(e) => setFormWCraft(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 p-2.5 rounded-lg outline-none cursor-pointer"
                        required
                      >
                        <option value="">Select craft</option>
                        {approvedCrafts.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {artisanState && (
                        <p className="text-[10px] text-on-surface-variant mt-1">Workshop region: <strong>{artisanState}</strong></p>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Workshop Title</label>
                      <input 
                        type="text"
                        value={formWTitle}
                        onChange={(e) => setFormWTitle(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none"
                        required
                        placeholder="e.g. Traditional Warli Handpainting"
                      />
                    </div>

                    {/* Venue */}
                    <div>
                      <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Studio / Venue Address</label>
                      <input 
                        type="text"
                        value={formWVenue}
                        onChange={(e) => setFormWVenue(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none"
                        required
                        placeholder="e.g. Heritage Weaving Studio Hall A"
                      />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Workshop Date</label>
                        <input 
                          type="text"
                          value={formWDate}
                          onChange={(e) => setFormWDate(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none"
                          required
                          placeholder="e.g. 15 July 2026"
                        />
                      </div>
                      <div>
                        <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Schedules (Time)</label>
                        <input 
                          type="text"
                          value={formWTime}
                          onChange={(e) => setFormWTime(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none"
                          required
                          placeholder="e.g. 10:00 AM - 01:00 PM"
                        />
                      </div>
                    </div>

                    {/* Category, Seats and Fee */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Fee</label>
                        <input 
                          type="text"
                          value={formWPrice}
                          onChange={(e) => setFormWPrice(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none font-bold text-center"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Max Seats</label>
                        <input 
                          type="number"
                          value={formWSeats}
                          onChange={(e) => setFormWSeats(Number(e.target.value))}
                          className="w-full bg-surface-container border border-outline-variant/30 focus:border-primary p-2.5 rounded-lg text-on-surface outline-none text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">Method</label>
                        <select 
                          value={formWCategory}
                          onChange={(e) => setFormWCategory(e.target.value as any)}
                          className="w-full bg-surface-container border border-outline-variant/30 p-2.5 rounded-lg outline-none cursor-pointer text-center"
                        >
                          <option value="Hands-on">Hands-on</option>
                          <option value="Masterclass">Masterclass</option>
                          <option value="Seminar">Seminar</option>
                        </select>
                      </div>
                    </div>

                    {/* Local File Browser image connector */}
                    <div>
                      <label className="block font-extrabold text-[10px] uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Workshop Banner Cover Photo
                      </label>
                      <div className="border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low p-3.5 text-center">
                        <input 
                          type="file" 
                          id="edit-workshop-photo-file" 
                          ref={workshopFileInputRef}
                          onChange={(e) => handlePhotoUpload(e, 'workshop')}
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={() => workshopFileInputRef.current?.click()}
                          className="w-full h-20 bg-surface rounded-lg overflow-hidden border flex flex-col items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors group relative cursor-pointer"
                        >
                          {formWThumbnail ? (
                            <>
                              <img className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-60" src={formWThumbnail} alt="Uploaded base" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover:bg-black/40 text-white p-2">
                                <Upload size={14} className="mb-0.5 text-white" />
                                <span className="font-sans text-[9px] font-bold uppercase tracking-wider truncate max-w-xs">{formWThumbnailName || 'Change Banner'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload size={14} className="text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-sans text-[9px] text-on-surface font-semibold">Select Local Cover File</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-on-surface-variant italic mt-1.5 text-center">Connects directly with your local browser configuration to process photographs.</p>
                    </div>
                  </div>

                  <div className="shrink-0 p-5 pt-3 border-t border-outline-variant/20 bg-white">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsEditingWorkshop(false); setEditingWorkshopRef(null); }}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-on-surface-variant font-bold uppercase tracking-wider rounded-xl cursor-copy text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveWorkshopEdits}
                        className="flex-grow py-2.5 bg-primary hover:bg-[#a33d1f] text-on-primary font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer select-none shadow text-center flex items-center justify-center gap-1"
                      >
                        <Save size={12} /> Publish Masterclass
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'Bookings' && (
          <div className="space-y-8">
            <section className="border-b pb-4">
              <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">Classroom oversight</p>
              <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">Workshop Registrations</h2>
              <p className="font-sans text-xs text-on-surface-variant">Verify students, manage slots, and mark sessions complete so they appear in the attendee&apos;s profile history.</p>
            </section>

            <section className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic text-center py-8">No workshop registrations yet.</p>
              ) : (
              <div className="divide-y divide-outline-variant/15 border border-outline-variant/20 rounded-xl bg-surface-container-low overflow-hidden">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-[#8c2d0f]/10 text-primary font-serif font-bold rounded-full flex items-center justify-center text-sm">
                        {booking.student.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-[15px] font-bold text-on-surface">{booking.student}</h4>
                          <span className={`text-[8px] font-sans font-extrabold uppercase px-1.5 rounded ${
                            booking.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-on-surface-variant mt-0.5">{booking.course} • <span className="font-semibold text-[#8c2d0f]">{booking.seats} Seat(s) Booked</span></p>
                        <p className="font-sans text-[10px] text-on-surface-variant">{booking.date} at {booking.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center">
                      {booking.status === 'Pending' && (
                        <button 
                          onClick={() => changeBookingStatus(booking.id, 'Confirmed')}
                          className="bg-primary hover:bg-[#a33d1f] text-on-primary text-[10px] font-sans font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => changeBookingStatus(booking.id, 'Completed')}
                          className="border border-primary text-primary hover:bg-primary hover:text-on-primary text-[10px] font-sans font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      {booking.status === 'Completed' && (
                        <span className="text-[10px] font-sans font-bold uppercase text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                          In attendee history
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </section>
          </div>
        )}

        {activeMenu === 'Studio Settings' && (
          <div className="space-y-8">
            <section className="border-b pb-4">
              <p className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-primary">Branding specifications</p>
              <h2 className="font-serif text-3xl font-semibold text-on-surface mt-1 tracking-tight">Studio Settings</h2>
              <p className="font-sans text-xs text-on-surface-variant">Configure your public-facing shop profile, upload artisan bio, and set UPI details to collect payouts directly.</p>
            </section>

            <section className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8c2d0f] mb-1.5">Studio Brand Name</label>
                  <input 
                    type="text" 
                    value={studioName} 
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full bg-surface-container border border-outline focus:border-primary text-xs p-3 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8c2d0f] mb-1.5">Craft Category Tag</label>
                  <input 
                    type="text" 
                    value={studioCategory} 
                    onChange={(e) => setStudioCategory(e.target.value)}
                    className="w-full bg-surface-container border border-outline focus:border-primary text-xs p-3 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8c2d0f] mb-1.5">Direct UPI ID For Patrons</label>
                  <input 
                    type="text" 
                    value={payoutUPI} 
                    onChange={(e) => setPayoutUPI(e.target.value)}
                    className="w-full bg-surface-container border border-outline focus:border-primary text-xs p-3 rounded-xl outline-none font-bold text-emerald-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8c2d0f] mb-1.5">Artisan Portfolio Image</label>
                  <input type="file" ref={portfolioInputRef} accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await api.uploadArtisanPortfolio(file);
                      setPortfolioImage(res.url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Upload failed');
                    }
                  }} />
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30">
                      {portfolioImage ? (
                        <img src={portfolioImage} alt="Portfolio" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-[10px]">No image</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => portfolioInputRef.current?.click()}
                      className="text-xs font-bold uppercase text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/10"
                    >
                      <Upload size={12} className="inline mr-1" /> Upload portfolio
                    </button>
                  </div>
                  {artisanState && (
                    <p className="text-[10px] text-on-surface-variant mt-2">Registered state: <span className="font-bold text-primary">{artisanState}</span> (set during application)</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#8c2d0f] mb-1.5">Artisan Bio Ledger</label>
                  <textarea 
                    value={studioBio} 
                    onChange={(e) => setStudioBio(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container border border-outline focus:border-primary text-xs p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-4 flex justify-end">
                <button 
                  onClick={async () => {
                    try {
                      await api.updateArtisanProfile({
                        name: studioName,
                        bio: studioBio,
                        category: studioCategory,
                        payoutUPI,
                        studioName,
                        studioBio,
                      });
                      alert('Studio profile saved successfully!');
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Save failed');
                    }
                  }}
                  className="bg-primary hover:bg-[#a33d1f] text-on-primary font-sans font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl cursor-pointer shadow flex items-center gap-1.5"
                >
                  <Check size={14} /> Update Branded Identity
                </button>
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
