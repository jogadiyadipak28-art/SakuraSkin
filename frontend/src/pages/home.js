/* ─── Home Page ───────────────────────────────────────────── */

import { api } from '../main.js';

const CONCERNS = [
  { id: 'acne', label: 'Acne', icon: '🔴' },
  { id: 'dryness', label: 'Dryness', icon: '🏜️' },
  { id: 'aging', label: 'Anti-Aging', icon: '⏳' },
  { id: 'hyperpigmentation', label: 'Dark Spots', icon: '🟤' },
  { id: 'sensitivity', label: 'Sensitivity', icon: '🌿' },
  { id: 'oiliness', label: 'Oily Skin', icon: '💧' },
  { id: 'dullness', label: 'Dullness', icon: '✨' },
  { id: 'texture', label: 'Texture', icon: '🪨' },
];

export async function renderHome(container) {
  // Hero
  const hero = document.createElement('section');
  hero.className = 'hero-gradient py-20 md:py-32 px-6 text-center relative';
  hero.innerHTML = `
    <div class="max-w-4xl mx-auto relative z-10">
      <div class="text-6xl md:text-7xl mb-6 animate-bounce" style="animation-duration:3s">🌸</div>
      <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 via-sakura-600 to-sakura-700 bg-clip-text text-transparent">SakuraSkin</span>
      </h1>
      <p class="text-xl md:text-2xl text-sakura-700 font-light mb-3" style="font-family:var(--font-heading)">
        AI-Powered Multi-Agent Skincare Intelligence
      </p>
      <p class="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
        Five intelligent agents work together to analyze ingredients, detect conflicts, find affordable dupes, 
        build optimal routines, and recommend products personalized to your unique skin.
      </p>
      <div class="flex flex-wrap gap-3 justify-center">
        <a href="#/analyzer" class="btn-sakura text-base px-8 py-3 no-underline">Take the Skin Quiz 🧪</a>
        <a href="#/products" class="btn-outline no-underline">Browse Products →</a>
      </div>
    </div>
  `;
  container.appendChild(hero);

  // Stats
  const stats = document.createElement('section');
  stats.className = 'max-w-5xl mx-auto px-6 -mt-8 relative z-10';
  stats.innerHTML = `
    <div class="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">150+</div><div class="text-sm text-gray-500">Ingredients Analyzed</div></div>
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">45+</div><div class="text-sm text-gray-500">Products in Database</div></div>
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">5</div><div class="text-sm text-gray-500">AI Agents Working</div></div>
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">30+</div><div class="text-sm text-gray-500">Interaction Rules</div></div>
    </div>
  `;
  container.appendChild(stats);

  // Ingredient of the Day
  try {
    const iotd = await api('/ingredient-of-the-day');
    const iotdSection = document.createElement('section');
    iotdSection.className = 'max-w-5xl mx-auto px-6 mt-16';
    iotdSection.innerHTML = `
      <h2 class="text-2xl font-bold text-center mb-6" style="font-family:var(--font-heading)">🌟 Ingredient of the Day</h2>
      <div class="glass-card p-8 md:flex items-center gap-8">
        <div class="text-6xl mb-4 md:mb-0">🧪</div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-sakura-700 mb-1" style="font-family:var(--font-heading)">${iotd.common}</h3>
          <p class="text-xs text-gray-400 mb-2 font-mono">${iotd.inci}</p>
          <p class="text-gray-600 mb-3">${iotd.function}</p>
          <p class="text-sm italic text-sakura-500">"${iotd.fun_fact}"</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="badge badge-sakura">${iotd.category}</span>
            <span class="badge ${iotd.safety_rating <= 2 ? 'badge-green' : iotd.safety_rating <= 4 ? 'badge-amber' : 'badge-red'}">Safety: ${iotd.safety_rating}/10</span>
            <span class="badge badge-blue">pH ${iotd.ph_min}-${iotd.ph_max}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(iotdSection);
  } catch(e) { /* skip if API down */ }

  // Skin Concerns
  const concerns = document.createElement('section');
  concerns.className = 'max-w-5xl mx-auto px-6 mt-16';
  concerns.innerHTML = `
    <h2 class="text-2xl font-bold text-center mb-2" style="font-family:var(--font-heading)">What's Your Skin Concern?</h2>
    <p class="text-center text-gray-500 mb-8">Select a concern to find targeted products</p>
    <div class="flex flex-wrap gap-3 justify-center" id="home-concerns">
      ${CONCERNS.map(c => `
        <a href="#/products?concern=${c.id}" class="concern-pill no-underline">${c.icon} ${c.label}</a>
      `).join('')}
    </div>
  `;
  container.appendChild(concerns);

  // How It Works
  const howSection = document.createElement('section');
  howSection.className = 'max-w-5xl mx-auto px-6 mt-16';
  howSection.innerHTML = `
    <h2 class="text-2xl font-bold text-center mb-10" style="font-family:var(--font-heading)">How Our Agents Work Together</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧪</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Formulation Agent</h3>
        <p class="text-sm text-gray-500">Acts as your personal cosmetic chemist. Parses INCI lists and cross-references ingredient interactions, flagging conflicts and synergies.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Scraper Agent</h3>
        <p class="text-sm text-gray-500">Searches the web for product listings, fetching exact INCI ingredient lists from brands like Minimalist, The Ordinary, and CeraVe.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧠</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Skin Analyzer</h3>
        <p class="text-sm text-gray-500">Analyzes your unique skin profile — type, concerns, allergies — and maps them to the perfect active ingredients and products.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧴</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Routine Agent</h3>
        <p class="text-sm text-gray-500">Builds and validates AM/PM skincare routines. Smart ordering, conflict detection between products, and missing step alerts.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">💸</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Dupe Finder</h3>
        <p class="text-sm text-gray-500">Compares ingredient overlap between products to find affordable alternatives. Same ingredients, lower price tag.</p>
      </div>
    </div>
  `;
  container.appendChild(howSection);

  // Seasonal Tips
  try {
    const seasonal = await api('/seasonal-tips');
    const tipSection = document.createElement('section');
    tipSection.className = 'max-w-5xl mx-auto px-6 mt-16';
    tipSection.innerHTML = `
      <h2 class="text-2xl font-bold text-center mb-2" style="font-family:var(--font-heading)">
        🌦️ ${seasonal.season.charAt(0).toUpperCase() + seasonal.season.slice(1)} Skincare Tips
      </h2>
      <p class="text-center text-gray-500 mb-8">Adapt your routine to the season</p>
      <div class="grid grid-cols-1 md:grid-cols-${seasonal.tips.length > 3 ? 2 : seasonal.tips.length} gap-4">
        ${seasonal.tips.map(tip => `
          <div class="glass-card p-5 flex items-start gap-4">
            <span class="text-3xl">${tip.icon}</span>
            <div>
              <h4 class="font-bold text-sakura-700 mb-1" style="font-family:var(--font-heading)">${tip.title}</h4>
              <p class="text-sm text-gray-500">${tip.tip}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(tipSection);
  } catch(e) { /* skip */ }
}
