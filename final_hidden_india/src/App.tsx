/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScreenId, Applicant } from './types';
import { useAuth } from './context/AuthContext';
import * as api from './api';

import JoinHeritage from './components/JoinHeritage';
import ArtisticEchoesQuiz from './components/ArtisticEchoesQuiz';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import ExploreMap from './components/ExploreMap';
import ProfileSettings from './components/ProfileSettings';
import ArtisanApplication from './components/ArtisanApplication';
import ArtisanApplicationStatus from './components/ArtisanApplicationStatus';
import ArtisanDashboard from './components/ArtisanDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import WorkshopDetail from './components/WorkshopDetail';
import WorkshopConfirmation from './components/WorkshopConfirmation';
import { DEFAULT_AVATAR } from './lib/utils';

export default function App() {
  const { user, loading, logout, refreshUser } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('join-heritage');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [bookedWorkshop, setBookedWorkshop] = useState({
    title: '',
    instructor: '',
    date: '',
    time: '',
    venue: '',
  });

  const userName = user?.name || 'Explorer';
  const userEmail = user?.email || '';
  const userAvatar = user?.avatar || DEFAULT_AVATAR;

  const resolveScreenForUser = useCallback((screen: ScreenId): ScreenId => {
    if (!user) return 'join-heritage';
    const home = api.homeScreenForUser(user) as ScreenId;
    if (screen === 'join-heritage') return home;
    if (screen === 'artistic-echoes' && user.quizCompleted) return 'personalized-dashboard';
    if (user.role === 'artisan' && screen === 'supervisor-dashboard') return 'artisan-dashboard';
    if (
      user.role === 'admin' &&
      ['artisan-dashboard', 'personalized-dashboard', 'artistic-echoes'].includes(screen)
    ) {
      return 'supervisor-dashboard';
    }
    if (user.role === 'user' && ['supervisor-dashboard', 'artisan-dashboard'].includes(screen)) {
      return home;
    }
    return screen;
  }, [user]);

  const activeScreen = loading ? currentScreen : resolveScreenForUser(currentScreen);

  useEffect(() => {
    if (loading) return;
    setCurrentScreen((prev) => resolveScreenForUser(prev));
  }, [loading, user, resolveScreenForUser]);

  const loadApplicants = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const apps = await api.getAdminApplications('all');
      setApplicants(apps);
    } catch {
      /* admin endpoints unavailable */
    }
  }, [user?.role]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const handleDecision = async (appId: string, status: 'approved' | 'rejected', curatorNotes?: string) => {
    try {
      await api.reviewApplication(appId, status, curatorNotes);
      setApplicants((prev) => prev.map((app) => (app.id === appId ? { ...app, status } : app)));
      await loadApplicants();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Review failed');
    }
  };

  const handleApplicantSubmit = () => {
    loadApplicants();
  };

  const handleSetBookedWorkshop = (
    title: string,
    instructor: string,
    date: string,
    time: string,
    venue: string
  ) => {
    setBookedWorkshop({ title, instructor, date, time, venue });
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('join-heritage');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f3]">
        <p className="font-serif text-[#8c2d0f] text-lg animate-pulse">Loading Hidden India Explorer...</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'join-heritage':
        return <JoinHeritage onNextScreen={setCurrentScreen} />;
      case 'artistic-echoes':
        return (
          <ArtisticEchoesQuiz
            onNextScreen={setCurrentScreen}
            userAvatar={userAvatar}
            onQuizSaved={refreshUser}
          />
        );
      case 'personalized-dashboard':
        return (
          <PersonalizedDashboard onNavigate={setCurrentScreen} userName={userName} />
        );
      case 'explore-map':
        return <ExploreMap onNavigate={setCurrentScreen} />;
      case 'profile-settings':
        return (
          <ProfileSettings
            onNavigate={setCurrentScreen}
            userName={userName}
            userEmail={userEmail}
            userAvatar={userAvatar}
            onLogout={handleLogout}
          />
        );
      case 'artisan-application':
        return <ArtisanApplication onNavigate={setCurrentScreen} onSubmitApplication={handleApplicantSubmit} />;
      case 'artisan-application-status':
        return <ArtisanApplicationStatus onNavigate={setCurrentScreen} />;
      case 'artisan-dashboard':
        return <ArtisanDashboard onNavigate={setCurrentScreen} />;
      case 'supervisor-dashboard':
        return (
          <SupervisorDashboard
            onNavigate={setCurrentScreen}
            applicantsList={applicants}
            onDecision={handleDecision}
            onLogout={handleLogout}
          />
        );
      case 'workshop-detail':
        return <WorkshopDetail onNavigate={setCurrentScreen} onSetBookedWorkshop={handleSetBookedWorkshop} />;
      case 'workshop-confirmation':
        return <WorkshopConfirmation onNavigate={setCurrentScreen} bookedInfo={bookedWorkshop} />;
      default:
        return <JoinHeritage onNextScreen={setCurrentScreen} />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-background text-on-surface relative ${
        activeScreen === 'join-heritage' ? '' : 'parchment-texture'
      }`}
    >
      {activeScreen !== 'join-heritage' && (
        <div className="absolute inset-0 pattern-overlay pointer-events-none -z-10"></div>
      )}
      <div className="animate-fade-in duration-300">{renderScreen()}</div>
    </div>
  );
}
