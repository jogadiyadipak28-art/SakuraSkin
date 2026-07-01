/* ─── SakuraSkin SPA ─────────────────────────────────────── */

import { renderHome } from './pages/home.js';
import { renderAnalyzer } from './pages/analyzer.js';
import { renderProducts } from './pages/products.js';
import { renderCompare } from './pages/compare.js';
import { renderEncyclopedia } from './pages/encyclopedia.js';
import { renderRoutine } from './pages/routine.js';
import { renderDiary } from './pages/diary.js';
import { renderNavbar } from './components/navbar.js';
import { createPetals } from './components/sakura-petals.js';
import { renderFooter } from './components/footer.js';

// ─── State ───────────────────────────────────────────────
export const state = {
  favorites: JSON.parse(localStorage.getItem('sakura_favorites') || '[]'),
  compareList: JSON.parse(localStorage.getItem('sakura_compare') || '[]'),
  skinProfile: JSON.parse(localStorage.getItem('sakura_profile') || 'null'),
  routines: JSON.parse(localStorage.getItem('sakura_routines') || '{}'),
  diary: JSON.parse(localStorage.getItem('sakura_diary') || '{}'),
  darkMode: localStorage.getItem('sakura_dark') === 'true',
};

export function saveState() {
  localStorage.setItem('sakura_favorites', JSON.stringify(state.favorites));
  localStorage.setItem('sakura_compare', JSON.stringify(state.compareList));
  localStorage.setItem('sakura_profile', JSON.stringify(state.skinProfile));
  localStorage.setItem('sakura_routines', JSON.stringify(state.routines));
  localStorage.setItem('sakura_diary', JSON.stringify(state.diary));
  localStorage.setItem('sakura_dark', state.darkMode);
}

export function toggleFavorite(productId) {
  const idx = state.favorites.indexOf(productId);
  if (idx > -1) { state.favorites.splice(idx, 1); }
  else { state.favorites.push(productId); }
  saveState();
  showToast(idx > -1 ? '💔 Removed from favorites' : '🌸 Added to favorites!');
}

export function toggleCompare(productId) {
  const idx = state.compareList.indexOf(productId);
  if (idx > -1) { state.compareList.splice(idx, 1); }
  else if (state.compareList.length < 4) { state.compareList.push(productId); }
  else { showToast('⚠️ Max 4 products to compare'); return; }
  saveState();
}

// ─── Toast ───────────────────────────────────────────────
let toastContainer;
export function showToast(message) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  toastContainer.appendChild(t);
  setTimeout(() => { t.classList.add('toast-out'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ─── API Helper ──────────────────────────────────────────
// VITE_API_BASE_URL env var is set in Vercel dashboard (or .env.local for dev).
// Falls back to the Render URL if the env var is not set.
// In local dev, leave VITE_API_BASE_URL empty so Vite's proxy handles /api calls.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://sakuraskin-api.onrender.com';

// Render free tier cold-starts can take up to 60s. We retry once after a timeout.
const API_TIMEOUT_MS = 15000; // 15s per attempt
const API_MAX_RETRIES = 3;

export async function api(path, options = {}, _attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (_attempt < API_MAX_RETRIES) {
      // Show a toast only on the first retry so user knows server is waking up
      if (_attempt === 1) showToast('⏳ Waking up the server… please wait a moment');
      await new Promise(r => setTimeout(r, 3000 * _attempt));
      return api(path, options, _attempt + 1);
    }
    throw err;
  }
}

// ─── Router ──────────────────────────────────────────────
const routes = {
  '': renderHome,
  'home': renderHome,
  'analyzer': renderAnalyzer,
  'products': renderProducts,
  'compare': renderCompare,
  'encyclopedia': renderEncyclopedia,
  'routine': renderRoutine,
  'diary': renderDiary,
};

function getRoute() {
  return window.location.hash.replace('#/', '').replace('#', '') || '';
}

function navigate() {
  const route = getRoute();
  const app = document.getElementById('app');
  const renderer = routes[route] || renderHome;

  // Rebuild page
  app.innerHTML = '';
  app.appendChild(renderNavbar(route));
  const main = document.createElement('main');
  main.className = 'page-enter';
  const isHome = !route || route === 'home';
  main.style.paddingTop = isHome ? '0' : '5rem';
  main.style.minHeight = '100vh';
  renderer(main);
  app.appendChild(main);
  app.appendChild(renderFooter());

  // Dark mode
  if (state.darkMode) document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', navigate);

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (state.darkMode) document.body.classList.add('dark-mode');
  navigate();

  // Ping the backend immediately on load so Render's free-tier instance
  // starts warming up before the user clicks anything.
  if (API_BASE_URL) {
    fetch(`${API_BASE_URL}/api/health`, { signal: AbortSignal.timeout(60000) })
      .catch(() => {/* silent — retry logic in api() handles real errors */});
  }
});
