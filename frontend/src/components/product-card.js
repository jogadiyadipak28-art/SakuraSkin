/* ─── Product Card Component ──────────────────────────────── */
import { state, toggleFavorite, toggleCompare } from '../main.js';

export function createScoreRing(score, size = 56) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return `
    <div class="score-ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="4"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" stroke-linecap="round"
          style="transition:stroke-dashoffset 1.5s ease"/>
      </svg>
      <span class="score-value" style="color:${color}">${score}</span>
    </div>`;
}

const CATEGORY_ICONS = {
  serum: '💧', cleanser: '🫧', moisturizer: '🧴', toner: '💦', treatment: '⚡',
  sunscreen: '☀️', oil: '✨', scrub: '🫗', essence: '🌿',
};

export function renderProductCard(product, analysis = null) {
  const isFav = state.favorites.includes(product.id);
  const isCompare = state.compareList.includes(product.id);
  const score = analysis ? analysis.safety_score : 75;
  const icon = CATEGORY_ICONS[product.category] || '🧴';

  const card = document.createElement('div');
  card.className = 'glass-card p-5 flex flex-col gap-3';
  card.id = `product-card-${product.id}`;

  card.innerHTML = `
    <div class="flex justify-between items-start">
      <div class="text-3xl">${icon}</div>
      <div class="flex gap-2">
        <button class="fav-btn bg-transparent border-none cursor-pointer text-lg transition-transform hover:scale-125"
          title="Toggle favorite" data-id="${product.id}">${isFav ? '❤️' : '🤍'}</button>
        <button class="compare-btn bg-transparent border-none cursor-pointer text-lg transition-transform hover:scale-125"
          title="Add to compare" data-id="${product.id}">${isCompare ? '⚖️' : '➕'}</button>
      </div>
    </div>
    <div>
      <p class="text-xs font-semibold text-sakura-500 uppercase tracking-wider mb-1">${product.brand}</p>
      <h3 class="text-base font-bold leading-snug" style="font-family:var(--font-heading)">${product.name}</h3>
    </div>
    <div class="flex flex-wrap gap-1">
      ${(product.key_actives || []).map(a => `<span class="badge badge-sakura text-xs">${a.replace(/_/g, ' ')}</span>`).join('')}
    </div>
    <div class="flex items-center justify-between mt-auto pt-3 border-t border-sakura-100">
      <div>
        <span class="text-lg font-bold text-sakura-700">₹${product.price}</span>
        <span class="text-xs text-gray-400 ml-1">${product.size}</span>
      </div>
      ${createScoreRing(score, 48)}
    </div>
    <div class="flex gap-2">
      <button class="btn-outline text-xs flex-1 view-btn" data-id="${product.id}">View Details</button>
      <span class="badge ${product.rating >= 4.5 ? 'badge-green' : 'badge-amber'} text-xs">⭐ ${product.rating}</span>
    </div>
  `;

  // Event listeners
  card.querySelector('.fav-btn').onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
    e.target.textContent = state.favorites.includes(product.id) ? '❤️' : '🤍';
  };
  card.querySelector('.compare-btn').onclick = (e) => {
    e.stopPropagation();
    toggleCompare(product.id);
    e.target.textContent = state.compareList.includes(product.id) ? '⚖️' : '➕';
  };

  return card;
}
