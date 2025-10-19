import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Example: replace direct DB calls with fetch to backend endpoints
export async function fetchCars() {
  const res = await fetch(`${API_BASE}/cars`);
  if (!res.ok) throw new Error('Failed to fetch cars');
  return res.json();
}
