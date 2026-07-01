/* ─── Products Page ───────────────────────────────────────── */

import { api, state, showToast } from '../main.js';
import { renderProductCard } from '../components/product-card.js';

export async function renderProducts(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-7xl mx-auto px-6 py-8';
  wrapper.innerHTML = `
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">🛍️ Product Explorer</span>
      </h1>
      <p class="text-gray-500">Browse, filter, and discover products analyzed by our AI agents</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Filters -->
      <div class="lg:w-64 shrink-0">
        <div class="glass-card p-5 sticky top-20 space-y-5">
          <h3 class="font-bold text-sakura-700" style="font-family:var(--font-heading)">🔍 Filters</h3>
          
          <div>
            <label class="text-sm font-semibold text-gray-600 mb-1 block">Search</label>
            <input id="filter-search" type="text" placeholder="Search products..." class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80" />
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 mb-1 block">Brand</label>
            <select id="filter-brand" class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80">
              <option value="">All Brands</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 mb-1 block">Category</label>
            <select id="filter-category" class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80">
              <option value="">All Categories</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 mb-1 block">Skin Type</label>
            <select id="filter-skin" class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80">
              <option value="">All Types</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combo">Combination</option>
              <option value="sensitive">Sensitive</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 mb-1 block">Sort By</label>
            <select id="filter-sort" class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80">
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
              <option value="rating">Rating</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-semibold text-gray-600 mb-2 block">Show</label>
            <div class="flex gap-2">
              <button id="filter-favs" class="concern-pill text-xs flex-1">♡ Favorites</button>
            </div>
          </div>

          <button id="filter-reset" class="btn-outline w-full text-xs">Reset Filters</button>
        </div>
      </div>

      <!-- Grid -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4">
          <p id="product-count" class="text-sm text-gray-500">Loading...</p>
          <div class="flex gap-2">
            ${state.compareList.length > 1 ? `<a href="#/compare" class="btn-sakura text-xs no-underline">Compare ${state.compareList.length} →</a>` : ''}
          </div>
        </div>
        <div id="product-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"></div>
      </div>
    </div>
  `;
  container.appendChild(wrapper);

  // Load brands + categories
  try {
    const [brands, categories] = await Promise.all([api('/products/brands'), api('/products/categories')]);
    const brandSel = wrapper.querySelector('#filter-brand');
    brands.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; brandSel.appendChild(o); });
    const catSel = wrapper.querySelector('#filter-category');
    categories.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c.charAt(0).toUpperCase()+c.slice(1); catSel.appendChild(o); });
  } catch(e) { /* filters degrade gracefully */ }

  let showFavsOnly = false;

  async function loadProducts() {
    const search = wrapper.querySelector('#filter-search').value;
    const brand = wrapper.querySelector('#filter-brand').value;
    const category = wrapper.querySelector('#filter-category').value;
    const skinType = wrapper.querySelector('#filter-skin').value;
    const sortBy = wrapper.querySelector('#filter-sort').value;

    wrapper.querySelector('#product-count').textContent = 'Loading products…';
    wrapper.querySelector('#product-grid').innerHTML = `
      <div class="col-span-full text-center py-16 text-gray-400">
        <div class="text-5xl mb-4">⏳</div>
        <p class="font-semibold">Connecting to server…</p>
        <p class="text-xs mt-2">Render's free tier may take up to 60s to wake up. Hang tight!</p>
      </div>`;

    try {
      let products = await api(`/products?query=${encodeURIComponent(search)}&brand=${brand}&category=${category}&skin_type=${skinType}&sort_by=${sortBy}`);
      if (showFavsOnly) {
        products = products.filter(p => state.favorites.includes(p.id));
      }

      const grid = wrapper.querySelector('#product-grid');
      grid.innerHTML = '';
      wrapper.querySelector('#product-count').textContent = `${products.length} products found`;

      if (products.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400"><div class="text-5xl mb-4">🌸</div><p>No products found. Try adjusting your filters!</p></div>`;
        return;
      }

      products.forEach(p => {
        const card = renderProductCard(p);
        card.querySelector('.view-btn')?.addEventListener('click', () => showProductModal(p));
        grid.appendChild(card);
      });
    } catch(e) {
      wrapper.querySelector('#product-count').textContent = 'Could not load products';
      wrapper.querySelector('#product-grid').innerHTML = `
        <div class="col-span-full text-center py-16 text-gray-400">
          <div class="text-5xl mb-4">⚠️</div>
          <p class="font-semibold">Backend is unreachable</p>
          <p class="text-xs mt-2">The server may still be starting. Please refresh the page in 30 seconds.</p>
        </div>`;
    }
  }

  // Filter events
  ['filter-search', 'filter-brand', 'filter-category', 'filter-skin', 'filter-sort'].forEach(id => {
    wrapper.querySelector(`#${id}`).addEventListener(id === 'filter-search' ? 'input' : 'change', loadProducts);
  });
  wrapper.querySelector('#filter-favs').onclick = () => {
    showFavsOnly = !showFavsOnly;
    wrapper.querySelector('#filter-favs').classList.toggle('selected');
    loadProducts();
  };
  wrapper.querySelector('#filter-reset').onclick = () => {
    wrapper.querySelector('#filter-search').value = '';
    wrapper.querySelector('#filter-brand').value = '';
    wrapper.querySelector('#filter-category').value = '';
    wrapper.querySelector('#filter-skin').value = '';
    wrapper.querySelector('#filter-sort').value = 'relevance';
    showFavsOnly = false;
    wrapper.querySelector('#filter-favs').classList.remove('selected');
    loadProducts();
  };

  // Check URL params
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  if (params.get('concern')) {
    // filter by concern not directly supported in dropdown, but we can search
    wrapper.querySelector('#filter-search').value = params.get('concern').replace(/_/g, ' ');
  }

  loadProducts();
}

function showProductModal(product) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[5000] flex items-center justify-center p-4';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const modal = document.createElement('div');
  modal.className = 'glass-card p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto';
  modal.style.background = 'rgba(255,255,255,0.95)';
  modal.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div>
        <p class="text-xs font-semibold text-sakura-500 uppercase tracking-wider">${product.brand}</p>
        <h2 class="text-xl font-bold" style="font-family:var(--font-heading)">${product.name}</h2>
      </div>
      <button onclick="this.closest('.fixed').remove()" class="text-xl bg-transparent border-none cursor-pointer">✕</button>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      ${(product.key_actives || []).map(a => `<span class="badge badge-sakura">${a.replace(/_/g,' ')}</span>`).join('')}
    </div>
    <div class="mb-4">
      <span class="text-2xl font-bold text-sakura-700">₹${product.price}</span>
      <span class="text-sm text-gray-400 ml-2">${product.size}</span>
      <span class="badge ${product.rating >= 4.5 ? 'badge-green' : 'badge-amber'} ml-2">⭐ ${product.rating}</span>
    </div>
    <div class="mb-4">
      <h4 class="font-semibold text-sm mb-2">Skin Types</h4>
      <div class="flex flex-wrap gap-1">${(product.skin_types||[]).map(s => `<span class="badge badge-blue text-xs">${s}</span>`).join('')}</div>
    </div>
    <div class="mb-4">
      <h4 class="font-semibold text-sm mb-2">Targets</h4>
      <div class="flex flex-wrap gap-1">${(product.concerns||[]).map(c => `<span class="badge badge-sakura text-xs">${c.replace(/_/g,' ')}</span>`).join('')}</div>
    </div>
    <div>
      <h4 class="font-semibold text-sm mb-2">Full INCI List</h4>
      <p class="text-xs text-gray-500 leading-relaxed">${(product.ingredients||[]).join(', ')}</p>
    </div>
    <div class="mt-4 flex gap-2">
      <a href="#/compare" class="btn-outline text-xs flex-1 text-center no-underline" onclick="this.closest('.fixed').remove()">⚖️ Compare</a>
      <button class="btn-sakura text-xs flex-1" onclick="this.closest('.fixed').remove()">Close</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
