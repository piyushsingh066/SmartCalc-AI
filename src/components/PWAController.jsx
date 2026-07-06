import React, { useState, useEffect } from 'react';
import { Download, CloudOff, Wifi } from 'lucide-react';

export const PWAController = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);

  useEffect(() => {
    // 1. Listen for PWA installation prompt availability
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the install button
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Listen for online/offline connectivity changes
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineBanner(true); // Show "Back Online" alert briefly
      setTimeout(() => setShowOfflineBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser installation prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We no longer need the prompt, clear it
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <>
      {/* Dynamic CSS Keyframes & Styles */}
      <style>{`
        .pwa-install-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent, #2563eb) 0%, var(--accent-hover, #3b82f6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: pwa-pulse 2s infinite, pwa-fade-in 0.5s ease-out;
        }

        .pwa-install-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.6);
        }

        .pwa-install-btn:active {
          transform: scale(0.95);
        }

        .pwa-install-btn::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--accent, #2563eb);
          opacity: 0;
          animation: pwa-ripple 1.5s infinite;
        }

        .pwa-offline-banner {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 9998;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: pwa-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transition: all 0.3s ease;
        }

        .pwa-offline {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .pwa-online {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .pwa-banner-text {
          font-family: var(--font-sans, sans-serif);
          font-size: 13.5px;
          font-weight: 500;
        }

        @keyframes pwa-pulse {
          0% { box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); }
          50% { box-shadow: 0 4px 25px rgba(37, 99, 235, 0.7); }
          100% { box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); }
        }

        @keyframes pwa-ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes pwa-fade-in {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes pwa-slide-up {
          from { transform: translate(-50%, 40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>

      {/* 1. Floating Circular Install Button */}
      {showInstallBtn && (
        <button 
          onClick={handleInstallClick} 
          className="pwa-install-btn" 
          aria-label="Install App"
        >
          <Download color="#fff" size={24} />
        </button>
      )}

      {/* 2. Offline / Online Status Indicator */}
      {showOfflineBanner && (
        <div className={`pwa-offline-banner ${isOffline ? 'pwa-offline' : 'pwa-online'}`}>
          {isOffline ? (
            <>
              <CloudOff color="#f87171" size={18} />
              <span style={{ color: '#fca5a5' }} className="pwa-banner-text">
                Offline Mode Active — Basic features are fully available
              </span>
            </>
          ) : (
            <>
              <Wifi color="#34d399" size={18} />
              <span style={{ color: '#a7f3d0' }} className="pwa-banner-text">
                Connection restored! Synced databases and features
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};
