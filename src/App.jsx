import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import SettingsScreen from './components/SettingsScreen';
import MessagingPreview from './components/MessagingPreview';
import BottomNav from './components/BottomNav';
import HelpModal from './components/HelpModal';
import Toast from './components/Toast';

export default function App() {
  // Restore persisted user and tab from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('slackws_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedUser = localStorage.getItem('slackws_user');
      return savedUser ? 'main' : 'login';
    } catch {
      return 'login';
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('slackws_tab') || 'home';
    } catch {
      return 'home';
    }
  });

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Accessibility live settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('slackws_settings');
      return saved ? JSON.parse(saved) : {
        agrandarTexto: true,
        fontSize: 15,
        coloresFuertes: true,
        contrastLevel: 70
      };
    } catch {
      return {
        agrandarTexto: true,
        fontSize: 15,
        coloresFuertes: true,
        contrastLevel: 70
      };
    }
  });

  // Persist settings whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('slackws_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Persist activeTab whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('slackws_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Apply real-time CSS styles based on accessibility settings (Android-style scaling & true high contrast)
  useEffect(() => {
    const root = document.documentElement;
    
    // Android-style App-Wide Font Scale:
    // Base standard size is 15. If agrandarTexto is on, scale according to fontSize slider (e.g. 15=1.0x, 18=1.2x, 22=1.46x, 26=1.73x)
    const currentSize = settings.agrandarTexto ? (settings.fontSize || 15) : 15;
    const scale = currentSize / 15;
    
    // Setting root font-size scales all rem units across the entire DOM
    root.style.fontSize = `${16 * scale}px`;
    root.style.setProperty('--font-scale-factor', `${scale}`);
    root.style.setProperty('--base-font-size-px', `${currentSize}px`);
    
    // Real High Contrast Mode
    if (settings.coloresFuertes) {
      const contrastValue = settings.contrastLevel || 70;
      // Calculate dynamic saturation & contrast boost
      const contrastMultiplier = 1.0 + ((contrastValue - 50) / 100) * 0.5;
      const saturationMultiplier = 1.0 + ((contrastValue - 50) / 100) * 0.6;
      
      root.style.setProperty('--contrast-factor', `${contrastMultiplier}`);
      root.style.setProperty('--saturation-factor', `${saturationMultiplier}`);
      root.classList.add('high-contrast-mode');
    } else {
      root.style.setProperty('--contrast-factor', '1.0');
      root.style.setProperty('--saturation-factor', '1.0');
      root.classList.remove('high-contrast-mode');
    }
  }, [settings]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  const handleLoginSuccess = (userData, isNewUser) => {
    setUser(userData);
    try {
      localStorage.setItem('slackws_user', JSON.stringify(userData));
    } catch (e) {}

    setCurrentStep('main');

    if (isNewUser) {
      // New user: Send directly to Settings so they can adjust name or preferences
      setActiveTab('settings');
      triggerToast('¡Cuenta creada! Puedes personalizar tu nombre y ajustes aquí en Configuración.');
    } else {
      // Existing user: Send directly to Chats (home/messages)
      setActiveTab('home');
      triggerToast(`¡Bienvenido de nuevo, ${userData.nombre_completo || 'Usuario'}!`);
    }
  };

  const handleUpdateUser = (updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    try {
      localStorage.setItem('slackws_user', JSON.stringify(merged));
    } catch (e) {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('slackws_user');
      localStorage.removeItem('slackws_tab');
    } catch (e) {}
    setUser(null);
    setCurrentStep('login');
    setActiveTab('home');
    triggerToast('Has cerrado sesión correctamente');
  };

  const handleBackNavigation = () => {
    if (activeTab === 'settings') {
      setActiveTab('home');
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className={`mobile-device ${settings.coloresFuertes ? 'enhanced-contrast' : ''}`}>
        {/* Top subtle dotted decoration */}
        <div className="top-bar">
          <div className="top-dotted-line"></div>
        </div>

        {/* Login Screen */}
        {currentStep === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        )}

        {/* Main Application Screen (Chats & Settings) */}
        {currentStep === 'main' && (
          <>
            {activeTab === 'settings' && (
              <SettingsScreen
                user={user}
                onLogout={handleLogout}
                onBack={handleBackNavigation}
                settings={settings}
                onUpdateSettings={setSettings}
                onUpdateUser={handleUpdateUser}
                onToast={triggerToast}
              />
            )}

            {(activeTab === 'home' || activeTab === 'messages') && (
              <MessagingPreview
                user={user}
                onLogout={handleLogout}
              />
            )}

            {/* Bottom Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
            />
          </>
        )}

        {/* Support Help Modal */}
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          onSuccess={triggerToast}
        />

        {/* Toast notifications */}
        <Toast message={toastMessage} />
      </div>
    </div>
  );
}
