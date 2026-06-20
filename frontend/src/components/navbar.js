/* ─── Navbar Component ────────────────────────────────────── */

import { state, saveState } from '../main.js';

const NAV_ITEMS = [
  { route: 'home', label: 'Home', icon: '🏠' },
  { route: 'analyzer', label: 'Skin Quiz', icon: '🧪' },
  { route: 'products', label: 'Products', icon: '🛍️' },
  { route: 'compare', label: 'Compare', icon: '⚖️' },
  { route: 'encyclopedia', label: 'Encyclopedia', icon: '📖' },
  { route: 'routine', label: 'Routine', icon: '🧴' },
  { route: 'diary', label: 'Diary', icon: '📓' },
];

export function renderNavbar(currentRoute) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  const inner = document.createElement('div');
  inner.className = 'max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16';

  // Logo
  const logo = document.createElement('a');
  logo.href = '#/home';
  logo.className = 'flex items-center gap-2 text-xl font-bold no-underline';
  logo.style.fontFamily = 'var(--font-heading)';
  logo.innerHTML = `<span class="text-2xl">🌸</span><span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">SakuraSkin</span>`;
  inner.appendChild(logo);

  // Desktop links
  const links = document.createElement('div');
  links.className = 'hidden md:flex items-center gap-1';
  NAV_ITEMS.forEach(item => {
    const a = document.createElement('a');
    a.href = `#/${item.route}`;
    a.className = `nav-link ${(currentRoute === item.route || (!currentRoute && item.route === 'home')) ? 'active' : ''}`;
    a.textContent = item.label;
    links.appendChild(a);
  });
  inner.appendChild(links);

  // Right side: dark mode + fav count + hamburger
  const right = document.createElement('div');
  right.className = 'flex items-center gap-3';

  // Dark mode toggle
  const darkBtn = document.createElement('button');
  darkBtn.className = 'text-lg cursor-pointer bg-transparent border-none p-1 transition-transform hover:scale-125';
  darkBtn.textContent = state.darkMode ? '🌙' : '🌸';
  darkBtn.title = 'Toggle dark mode';
  darkBtn.onclick = () => {
    state.darkMode = !state.darkMode;
    saveState();
    document.body.classList.toggle('dark-mode');
    darkBtn.textContent = state.darkMode ? '🌙' : '🌸';
  };
  right.appendChild(darkBtn);

  // Favorites badge
  if (state.favorites.length > 0) {
    const favBadge = document.createElement('a');
    favBadge.href = '#/products';
    favBadge.className = 'badge badge-sakura no-underline';
    favBadge.textContent = `♡ ${state.favorites.length}`;
    right.appendChild(favBadge);
  }

  // Compare badge
  if (state.compareList.length > 0) {
    const compBadge = document.createElement('a');
    compBadge.href = '#/compare';
    compBadge.className = 'badge badge-blue no-underline';
    compBadge.textContent = `⚖️ ${state.compareList.length}`;
    right.appendChild(compBadge);
  }

  // Hamburger
  const burger = document.createElement('button');
  burger.className = 'md:hidden text-xl bg-transparent border-none cursor-pointer';
  burger.textContent = '☰';
  burger.onclick = () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
  };
  right.appendChild(burger);
  inner.appendChild(right);
  nav.appendChild(inner);

  // Mobile menu
  const mobileMenu = document.createElement('div');
  mobileMenu.id = 'mobile-menu';
  mobileMenu.className = 'mobile-menu';
  mobileMenu.onclick = (e) => { if (e.target === mobileMenu) mobileMenu.classList.remove('open'); };
  const panel = document.createElement('div');
  panel.className = 'mobile-menu-panel';
  panel.innerHTML = `<div class="flex justify-between items-center mb-8"><span class="text-lg font-bold" style="font-family:var(--font-heading)">🌸 SakuraSkin</span><button onclick="document.getElementById('mobile-menu').classList.remove('open')" class="text-xl bg-transparent border-none cursor-pointer">✕</button></div>`;
  NAV_ITEMS.forEach(item => {
    const a = document.createElement('a');
    a.href = `#/${item.route}`;
    a.className = 'block py-3 px-2 text-base font-medium no-underline border-b border-sakura-100';
    a.style.color = (currentRoute === item.route) ? 'var(--color-sakura-600)' : '#6b7280';
    a.innerHTML = `${item.icon} ${item.label}`;
    a.onclick = () => mobileMenu.classList.remove('open');
    panel.appendChild(a);
  });
  mobileMenu.appendChild(panel);
  nav.appendChild(mobileMenu);

  return nav;
}
