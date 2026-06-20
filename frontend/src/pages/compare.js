/* ─── Compare Page ────────────────────────────────────────── */

import { api, state, toggleCompare, showToast } from '../main.js';
import { createScoreRing } from '../components/product-card.js';

export async function renderCompare(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-7xl mx-auto px-6 py-8';

  if (state.compareList.length < 2) {
    wrapper.innerHTML = `
      <div class="text-center py-20">
        <div class="text-6xl mb-6">⚖️</div>
        <h1 class="text-3xl font-bold mb-3" style="font-family:var(--font-heading)">
          <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">Product Comparison</span>
        </h1>
        <p class="text-gray-500 mb-6">Add at least 2 products to compare. Go to <a href="#/products" class="text-sakura-500 underline">Products</a> and click ➕ on cards.</p>
        <p class="text-sm text-gray-400">Currently selected: ${state.compareList.length}/4 products</p>
      </div>
    `;
    container.appendChild(wrapper);
    return;
  }

  wrapper.innerHTML = `
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">⚖️ Product Comparison</span>
      </h1>
      <p class="text-gray-500">Side-by-side ingredient analysis powered by the Formulation Agent</p>
    </div>
    <div id="compare-content"><div class="text-center py-10 text-gray-400">Loading comparison...</div></div>
  `;
  container.appendChild(wrapper);

  try {
    const result = await api('/products/compare', {
      method: 'POST',
      body: { product_ids: state.compareList },
    });

    const content = wrapper.querySelector('#compare-content');
    content.innerHTML = '';

    // Product columns
    const grid = document.createElement('div');
    grid.className = `grid grid-cols-1 md:grid-cols-${result.products.length} gap-4 mb-8`;
    result.products.forEach(item => {
      const p = item.product;
      const col = document.createElement('div');
      col.className = 'glass-card p-5';
      col.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <p class="text-xs font-semibold text-sakura-500 uppercase">${p.brand}</p>
            <h3 class="text-base font-bold" style="font-family:var(--font-heading)">${p.name}</h3>
          </div>
          <button class="text-sm bg-transparent border-none cursor-pointer" title="Remove" data-id="${p.id}">✕</button>
        </div>
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xl font-bold text-sakura-700">₹${p.price}</span>
          <span class="text-xs text-gray-400">${p.size}</span>
          <span class="badge ${p.rating >= 4.5 ? 'badge-green' : 'badge-amber'} ml-auto">⭐ ${p.rating}</span>
        </div>
        <div class="flex justify-center mb-3">${createScoreRing(item.safety_score, 64)}</div>
        <p class="text-xs text-center text-gray-400 mb-3">Safety Score</p>
        <div class="space-y-1">
          <div class="flex justify-between text-xs"><span>Conflicts</span><span class="font-bold ${item.conflicts.length ? 'text-red-500' : 'text-green-600'}">${item.conflicts.length}</span></div>
          <div class="flex justify-between text-xs"><span>Synergies</span><span class="font-bold text-green-600">${item.synergies.length}</span></div>
          <div class="flex justify-between text-xs"><span>Recognized</span><span class="font-bold">${item.recognized}/${item.total_ingredients}</span></div>
        </div>
        <div class="mt-3"><h4 class="text-xs font-semibold mb-1">Key Actives</h4><div class="flex flex-wrap gap-1">${(p.key_actives||[]).map(a => `<span class="badge badge-sakura text-xs">${a.replace(/_/g,' ')}</span>`).join('')}</div></div>
      `;
      col.querySelector('button[data-id]').onclick = () => {
        toggleCompare(p.id);
        window.location.hash = '#/compare';
        location.reload();
      };
      grid.appendChild(col);
    });
    content.appendChild(grid);

    // Shared ingredients
    if (result.shared_ingredients.length > 0) {
      const shared = document.createElement('div');
      shared.className = 'glass-card p-6 mb-6';
      shared.innerHTML = `
        <h3 class="font-bold text-green-600 mb-3" style="font-family:var(--font-heading)">🟢 Shared Ingredients (${result.shared_ingredients.length})</h3>
        <div class="space-y-1">
          ${result.shared_ingredients.map(i => `<div class="ing-bar shared"><span class="font-semibold">${i.common}</span><span class="text-xs text-gray-400 ml-auto">${i.function}</span></div>`).join('')}
        </div>
      `;
      content.appendChild(shared);
    }

    // Unique ingredients per product
    const uniqueSection = document.createElement('div');
    uniqueSection.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6';
    Object.entries(result.unique_ingredients || {}).forEach(([pid, ings]) => {
      const p = result.products.find(x => x.product.id === pid);
      if (!p || ings.length === 0) return;
      const card = document.createElement('div');
      card.className = 'glass-card p-5';
      card.innerHTML = `
        <h4 class="font-bold text-blue-600 mb-3" style="font-family:var(--font-heading)">🔵 Unique to ${p.product.name}</h4>
        <div class="space-y-1">
          ${ings.map(i => `<div class="ing-bar unique"><span class="font-semibold">${i.common}</span><span class="text-xs text-gray-400 ml-auto">${i.category}</span></div>`).join('')}
        </div>
      `;
      uniqueSection.appendChild(card);
    });
    content.appendChild(uniqueSection);

    // Conflicts found
    const allConflicts = result.products.flatMap(p => p.conflicts);
    if (allConflicts.length > 0) {
      const conflictCard = document.createElement('div');
      conflictCard.className = 'glass-card p-6 mb-6';
      conflictCard.innerHTML = `
        <h3 class="font-bold text-red-500 mb-3" style="font-family:var(--font-heading)">🔴 Ingredient Conflicts</h3>
        <div class="space-y-2">
          ${allConflicts.map(c => `
            <div class="ing-bar conflict">
              <div>
                <span class="font-semibold">${c.pair[0].replace(/_/g,' ')} × ${c.pair[1].replace(/_/g,' ')}</span>
                <span class="badge badge-${c.severity === 'high' ? 'red' : 'amber'} ml-2 text-xs">${c.severity}</span>
                <p class="text-xs text-gray-500 mt-1">${c.reason}</p>
                <p class="text-xs text-green-600 mt-1">💡 ${c.suggestion}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      content.appendChild(conflictCard);
    }

    // Dupe check
    if (result.products.length === 2) {
      try {
        const dupes = await api(`/products/${result.products[0].product.id}/dupes`);
        const match = dupes.find(d => d.product.id === result.products[1].product.id);
        if (match) {
          const dupeCard = document.createElement('div');
          dupeCard.className = 'glass-card p-6 text-center';
          dupeCard.innerHTML = `
            <div class="text-3xl mb-2">💸</div>
            <h3 class="font-bold text-sakura-700 mb-2" style="font-family:var(--font-heading)">Dupe Alert!</h3>
            <p class="text-gray-600">These products share <strong>${match.similarity}%</strong> ingredient overlap.</p>
            ${match.price_diff > 0 ? `<p class="text-green-600 font-semibold mt-2">${result.products[1].product.name} saves you ₹${match.price_diff}!</p>` : ''}
          `;
          content.appendChild(dupeCard);
        }
      } catch(e) {}
    }

  } catch (e) {
    wrapper.querySelector('#compare-content').innerHTML = `<div class="text-center py-10 text-gray-400">⚠️ Could not load comparison. Is the backend running?</div>`;
  }
}
