import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Music, Home, BookOpen, Image, User, Moon, Sun, Crown, Share2, Heart, MessageSquare, Bell, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';
import { analytics } from './lib/analytics';
import { useAuthStore } from './store/authStore';
import { useSubscriptionStore } from './store/subscriptionStore';
import { AuthModal } from './components/auth/AuthModal';
import { EncouragingMessage } from './components/shared/EncouragingMessage';

// Lazy load components
const Library = lazy(() => import('./components/library/Library'));
const GreetingCardEditor = lazy(() => import('./components/cards/GreetingCardEditor'));
const ExampleCards = lazy(() => import('./components/cards/ExampleCards'));
const Genesis = lazy(() => import('./components/genesis/Genesis'));
const SubscriptionPlans = lazy(() => import('./components/subscription/SubscriptionPlans'));

const themeColors = {
  light: {
    bg: 'bg-[#F9F9F9]',
    text: 'text-gray-900',
    header: 'bg-white',
    nav: 'bg-white',
    card: 'bg-white',
    accent: 'text-emerald-500'
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    header: 'bg-gray-800',
    nav: 'bg-gray-800',
    card: 'bg-gray-800',
    accent: 'text-emerald-400'
  }
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [currentView, setCurrentView] = useState<'home' | 'library' | 'cards' | 'genesis' | 'profile'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const { user, isGuest } = useAuthStore();
  const { subscription } = useSubscriptionStore();

  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour >= 6 && hour < 18 ? 'morning' : 'evening');
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    analytics.trackEvent('theme_toggled', { newTheme: theme === 'light' ? 'dark' : 'light' });
  };

  const handleNavigation = (view: typeof currentView) => {
    if (!user && !isGuest) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
    analytics.trackEvent('navigation', { view });
  };

  const handlePremiumClick = () => {
    if (!user && !isGuest) {
      setShowAuthModal(true);
      return;
    }
    setShowSubscriptionModal(true);
    analytics.trackEvent('premium_modal_opened');
  };

  const handleTodaysReading = async () => {
    if (!user && !isGuest) {
      setShowAuthModal(true);
      return;
    }
    setCurrentView('library');
    analytics.trackEvent('todays_reading_clicked');
  };

  const renderContent = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      }>
        {currentView === 'library' ? (
          <Library />
        ) : currentView === 'cards' ? (
          <>
            <GreetingCardEditor />
            <ExampleCards />
          </>
        ) : currentView === 'genesis' ? (
          <Genesis />
        ) : currentView === 'profile' ? (
          <div className={`${themeColors[theme].card} rounded-lg shadow-lg p-8`}>
            <h2 className={`text-2xl font-bold ${themeColors[theme].text} mb-4`}>Profile</h2>
            {user ? (
              <div>
                <p className={themeColors[theme].text}>Email: {user.email}</p>
                <p className={`${themeColors[theme].text} mt-2`}>
                  Plan: {subscription?.planType || 'Basic'}
                </p>
              </div>
            ) : (
              <p className={themeColors[theme].text}>Please sign in to view your profile</p>
            )}
          </div>
        ) : (
          <>
            <div className={`${themeColors[theme].card} rounded-lg shadow-lg p-8 mb-8 text-center animate-fade`}>
              <h2 className={`text-3xl font-bold ${themeColors[theme].text} mb-4`}>
                Good {timeOfDay === 'morning' ? 'Morning' : 'Evening'} {user?.email?.split('@')[0] || 'Friend'}
              </h2>
              <p className={`${themeColors[theme].text} text-lg mb-6`}>Start your day with faith and inspiration</p>
              <button 
                onClick={handleTodaysReading}
                className="bg-emerald-500 text-white px-8 py-3 rounded-full hover:bg-emerald-600 transition-colors font-script text-xl"
              >
                Today's Reading
              </button>
            </div>
            <EncouragingMessage />
            <Genesis />
          </>
        )}
      </Suspense>
    );
  };

  return (
    <div className={`min-h-screen ${themeColors[theme].bg} ${themeColors[theme].text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${themeColors[theme].header} shadow-md transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://raw.githubusercontent.com/stackblitz/harmony-horn/main/logo-dark.png" 
                alt="Harmony's Horn"
                className={`h-12 w-auto ${theme === 'dark' ? 'filter invert' : ''}`}
              />
              <h1 className={`text-2xl font-bold ${themeColors[theme].text}`}>
                Harmony's Horn
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-600 transition-colors ${themeColors[theme].text}`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-6 w-6" />
                ) : (
                  <Sun className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={handlePremiumClick}
                className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 transition-colors"
                aria-label="Upgrade to Premium"
              >
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span className="font-script">Premium</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${themeColors[theme].nav} shadow-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center py-3">
            <button 
              onClick={() => handleNavigation('home')}
              className={`flex flex-col items-center space-y-1 ${currentView === 'home' ? 'text-emerald-500' : themeColors[theme].text} hover:text-opacity-80 transition-colors`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </button>
            <button 
              onClick={() => handleNavigation('library')}
              className={`flex flex-col items-center space-y-1 ${currentView === 'library' ? 'text-emerald-500' : themeColors[theme].text} hover:text-opacity-80 transition-colors`}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-xs">Library</span>
            </button>
            <button 
              onClick={() => handleNavigation('genesis')}
              className={`flex flex-col items-center space-y-1 ${currentView === 'genesis' ? 'text-emerald-500' : themeColors[theme].text} hover:text-opacity-80 transition-colors`}
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-xs">Genesis</span>
            </button>
            <button 
              onClick={() => handleNavigation('cards')}
              className={`flex flex-col items-center space-y-1 ${currentView === 'cards' ? 'text-emerald-500' : themeColors[theme].text} hover:text-opacity-80 transition-colors`}
            >
              <Image className="h-6 w-6" />
              <span className="text-xs">Cards</span>
            </button>
            <button 
              onClick={() => handleNavigation('profile')}
              className={`flex flex-col items-center space-y-1 ${currentView === 'profile' ? 'text-emerald-500' : themeColors[theme].text} hover:text-opacity-80 transition-colors`}
            >
              <User className="h-6 w-6" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="float-right text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-emerald-500">Premium Features</h2>
            </div>
            <SubscriptionPlans />
          </div>
        </div>
      )}
    </div>
  );
}