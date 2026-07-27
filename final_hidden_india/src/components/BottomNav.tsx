import { Bookmark, Home, Map, User } from 'lucide-react';
import { ScreenId } from '../types';

export type BottomNavTab = 'home' | 'explore' | 'saved' | 'profile';

interface BottomNavProps {
  active: BottomNavTab;
  onNavigate: (screen: ScreenId) => void;
  /** ProfileSettings omits the Saved tab. */
  showSaved?: boolean;
}

export default function BottomNav({ active, onNavigate, showSaved = true }: BottomNavProps) {
  const tabClass = (tab: BottomNavTab) =>
    active === tab
      ? 'flex flex-col items-center justify-center bg-primary-container/20 text-primary rounded-full px-4 py-1.5 cursor-pointer font-sans text-[11px] font-bold gap-0.5'
      : 'flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer font-sans text-[11px] font-bold gap-0.5';

  const iconClass = (tab: BottomNavTab) => (active === tab ? 'fill-primary' : '');

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 pb-safe bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 shadow-md">
      <button type="button" onClick={() => onNavigate('personalized-dashboard')} className={tabClass('home')}>
        <Home size={16} className={iconClass('home')} />
        <span>Home</span>
      </button>
      <button type="button" onClick={() => onNavigate('explore-map')} className={tabClass('explore')}>
        <Map size={16} className={iconClass('explore')} />
        <span>Explore</span>
      </button>
      {showSaved && (
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('profileTab', 'Saved Artifacts');
            onNavigate('profile-settings');
          }}
          className={tabClass('saved')}
        >
          <Bookmark size={16} className={iconClass('saved')} />
          <span>Saved</span>
        </button>
      )}
      <button type="button" onClick={() => onNavigate('profile-settings')} className={tabClass('profile')}>
        <User size={16} className={iconClass('profile')} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
