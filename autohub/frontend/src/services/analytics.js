// Initialize Google Analytics
export const initGA = () => {
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-P9RMJ9BJLM';
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    console.log('✅ Google Analytics initialized with ID:', measurementId);
  } else {
    console.warn('⚠️ Google Analytics not loaded. Make sure gtag is included in index.html');
  }
};

// Track page views
export const trackPageView = (path) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-P9RMJ9BJLM', {
      page_path: path,
    });
    console.log('📊 Page view tracked:', path);
  }
};

// Track custom events
export const trackUserAction = (action, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
    console.log('📊 Event tracked:', action, params);
  }
};