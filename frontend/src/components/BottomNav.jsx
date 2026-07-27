import React from 'react';
import { Home, Map, Bookmark, User } from 'lucide-react';

export default function BottomNav({ active, onNavigate, showSaved = true }) {
  const cls = (tab) =>
    `bottom-nav-btn ${active === tab ? 'bottom-nav-btn--active' : ''}`;

  return (
    <nav className="bottom-nav">
      <button type="button" onClick={() => onNavigate('personalized-dashboard')} className={cls('home')}>
        <Home size={16} />
        <span>Home</span>
      </button>
      <button type="button" onClick={() => onNavigate('explore-map')} className={cls('explore')}>
        <Map size={16} />
        <span>Explore</span>
      </button>
      {showSaved && (
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('profileTab', 'Saved Artifacts');
            onNavigate('profile-settings');
          }}
          className={cls('saved')}
        >
          <Bookmark size={16} />
          <span>Saved</span>
        </button>
      )}
      <button type="button" onClick={() => onNavigate('profile-settings')} className={cls('profile')}>
        <User size={16} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
