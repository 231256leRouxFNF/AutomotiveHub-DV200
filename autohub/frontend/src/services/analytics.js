import ReactGA from 'react-ga4';

const TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || 'G-XXXXXXXXXX'; // Replace with your GA4 ID

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID, {
    gaOptions: {
      siteSpeedSampleRate: 100
    }
  });
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};

// Track specific user actions
export const trackUserAction = {
  login: () => logEvent('User', 'Login', 'User logged in'),
  register: () => logEvent('User', 'Register', 'New user registered'),
  logout: () => logEvent('User', 'Logout', 'User logged out'),
  
  // Vehicle actions
  addVehicle: () => logEvent('Garage', 'Add Vehicle', 'User added a vehicle'),
  editVehicle: () => logEvent('Garage', 'Edit Vehicle', 'User edited a vehicle'),
  deleteVehicle: () => logEvent('Garage', 'Delete Vehicle', 'User deleted a vehicle'),
  
  // Social actions
  createPost: () => logEvent('Community', 'Create Post', 'User created a post'),
  likePost: () => logEvent('Community', 'Like Post', 'User liked a post'),
  commentPost: () => logEvent('Community', 'Comment', 'User commented on a post'),
  
  // Marketplace actions
  viewListing: (listingId) => logEvent('Marketplace', 'View Listing', `Listing ${listingId}`),
  createListing: () => logEvent('Marketplace', 'Create Listing', 'User created a listing'),
  searchListings: (query) => logEvent('Marketplace', 'Search', query),
  
  // Event actions
  viewEvent: (eventId) => logEvent('Events', 'View Event', `Event ${eventId}`),
  createEvent: () => logEvent('Events', 'Create Event', 'User created an event')
};