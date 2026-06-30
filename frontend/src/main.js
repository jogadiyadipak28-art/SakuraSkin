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
export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res.json();
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
});
