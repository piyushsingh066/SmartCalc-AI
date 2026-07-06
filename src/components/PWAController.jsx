import React, { useState, useEffect } from 'react';
import { Download, CloudOff, Wifi, X, Share } from 'lucide-react';

export const PWAController = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(true);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
    const ios = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setShowInstallBtn(false);
    }

    // 1. Listen for PWA installation prompt availability
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Keep showing the button, we have the native prompt ready
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWA installed successfully');
      setShowInstallBtn(false);
      setDeferredPrompt(null);
      setInstructionsVisible(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Listen for online/offline connectivity changes
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // 1. Trigger the native installation flow
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
        setDeferredPrompt(null);
      }
    } else {
      // 2. Show custom step-by-step instructions if native prompt is not supported (e.g. iOS Safari)
      setInstructionsVisible(true);
    }
  };

  return (
    <>
      {/* Dynamic CSS Styles */}
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

        /* Modal Overlay */
        .pwa-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: pwa-fade-in 0.3s ease-out;
          padding: 20px;
        }

        .pwa-modal-card {
          width: 100%;
          max-width: 400px;
          background: #1e293b;
          background-color: var(--card-bg, rgba(30, 41, 59, 0.95));
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1));
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          position: relative;
          color: #fff;
          font-family: var(--font-sans, sans-serif);
        }

        .pwa-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pwa-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .pwa-modal-title {
          font-family: var(--font-display, sans-serif);
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
        }

        .pwa-modal-body {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #cbd5e1;
        }

        .pwa-step-list {
          margin-top: 16px;
          padding-left: 0;
          list-style: none;
        }

        .pwa-step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
          font-size: 0.9rem;
        }

        .pwa-step-num {
          background: var(--accent, #2563eb);
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .pwa-step-text {
          flex: 1;
          color: #cbd5e1;
          font-weight: 500;
        }

        .pwa-highlight-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 3px 6px;
          margin: 0 4px;
          vertical-align: middle;
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

      {/* 2. Step-by-Step Instructions Modal */}
      {instructionsVisible && (
        <div className="pwa-modal-overlay" onClick={() => setInstructionsVisible(false)}>
          <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="pwa-modal-close" onClick={() => setInstructionsVisible(false)}>
              <X size={18} />
            </button>
            <div className="pwa-modal-title">
              <Download color="var(--accent, #2563eb)" size={22} />
              <span>Install SmartCalc AI</span>
            </div>
            <div className="pwa-modal-body">
              <p>Install this web application on your device to run it full-screen and offline like a native app.</p>
              
              {isIOS ? (
                <ul className="pwa-step-list">
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">1</span>
                    <span className="pwa-step-text">
                      Tap the share button 
                      <span className="pwa-highlight-icon">
                        <Share color="#3b82f6" size={14} />
                      </span>
                      in Safari's bottom toolbar.
                    </span>
                  </li>
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">2</span>
                    <span className="pwa-step-text">Scroll down the menu list and tap <strong style={{ color: '#fff' }}>Add to Home Screen</strong>.</span>
                  </li>
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">3</span>
                    <span className="pwa-step-text">Confirm the name and tap <strong style={{ color: '#fff' }}>Add</strong> in the top-right corner.</span>
                  </li>
                </ul>
              ) : (
                <ul className="pwa-step-list">
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">1</span>
                    <span className="pwa-step-text">Tap the browser menu icon (three dots <strong style={{ color: '#fff' }}>⋮</strong> in the top-right).</span>
                  </li>
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">2</span>
                    <span className="pwa-step-text">Select <strong style={{ color: '#fff' }}>Install App</strong> or <strong style={{ color: '#fff' }}>Add to Home Screen</strong>.</span>
                  </li>
                  <li className="pwa-step-item">
                    <span className="pwa-step-num">3</span>
                    <span className="pwa-step-text">Confirm the installation dialog to add it to your launcher.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Offline / Online Status Indicator */}
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
