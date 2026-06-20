/* ─── Ingredient Encyclopedia Page ────────────────────────── */

import { api } from '../main.js';

const CATEGORIES = ['Active', 'Humectant', 'Emollient', 'Antioxidant', 'Sunscreen'];

export async function renderEncyclopedia(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-5xl mx-auto px-6 py-8';
  wrapper.innerHTML = `
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">📖 Ingredient Encyclopedia</span>
      </h1>
      <p class="text-gray-500">Explore 40+ skincare ingredients — safety, function, and fun facts</p>
    </div>

    <div class="glass-card p-5 mb-8">
      <div class="flex flex-col sm:flex-row gap-3">
        <input id="enc-search" type="text" placeholder="Search ingredients..." class="flex-1 px-4 py-2.5 rounded-full border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80" />
        <div class="flex gap-2 flex-wrap">
          <button class="concern-pill text-xs cat-btn selected" data-cat="">All</button>
          ${CATEGORIES.map(c => `<button class="concern-pill text-xs cat-btn" data-cat="${c}">${c}</button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Compatibility Checker -->
    <div class="glass-card p-5 mb-8">
      <h3 class="font-bold text-sakura-700 mb-3" style="font-family:var(--font-heading)">🧪 Ingredient Compatibility Checker</h3>
      <p class="text-sm text-gray-500 mb-3">Paste an INCI list or type ingredient names (comma-separated) to check interactions</p>
      <textarea id="inci-input" rows="3" placeholder="e.g. Niacinamide, Retinol, Hyaluronic Acid, Vitamin C..." class="w-full px-4 py-3 rounded-xl border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80 resize-none"></textarea>
      <button id="check-inci" class="btn-sakura mt-3 text-sm">Analyze Interactions</button>
      <div id="inci-results" class="mt-4"></div>
    </div>

    <div id="ingredients-list" class="space-y-3">
      <div class="text-center py-10 text-gray-400">Loading ingredients...</div>
    </div>
  `;
  container.appendChild(wrapper);

  let currentCategory = '';

  async function loadIngredients() {
    const search = wrapper.querySelector('#enc-search').value;
    try {
      const ingredients = await api(`/ingredients?search=${encodeURIComponent(search)}&category=${encodeURIComponent(currentCategory)}`);
      const list = wrapper.querySelector('#ingredients-list');
      list.innerHTML = '';

      if (ingredients.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-gray-400">No ingredients found.</div>`;
        return;
      }

      ingredients.forEach(ing => {
        const card = document.createElement('div');
        card.className = 'glass-card p-5 cursor-pointer';
        const safetyColor = ing.safety_rating <= 2 ? '#22c55e' : ing.safety_rating <= 4 ? '#f59e0b' : '#ef4444';
        const safetyPct = Math.max(5, 100 - ing.safety_rating * 10);
        card.innerHTML = `
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-bold text-base" style="font-family:var(--font-heading)">${ing.common}</h3>
                <span class="badge badge-sakura text-xs">${ing.category}</span>
              </div>
              <p class="text-xs text-gray-400 font-mono mb-2">${ing.inci}</p>
              <p class="text-sm text-gray-600 mb-2">${ing.function}</p>
              <div class="flex flex-wrap gap-2 mb-2">
                <span class="text-xs text-gray-400">📊 Typical: ${ing.typical_concentration}</span>
                <span class="text-xs text-gray-400">🧪 pH: ${ing.ph_min}-${ing.ph_max}</span>
                <span class="text-xs text-gray-400">🔬 Comedogenic: ${ing.comedogenic}/5</span>
              </div>
              <div class="flex flex-wrap gap-1">
                ${(ing.skin_types||[]).map(s => `<span class="badge badge-blue text-xs">${s}</span>`).join('')}
              </div>
            </div>
            <div class="sm:w-32">
              <div class="text-xs text-gray-500 mb-1">Safety Rating</div>
              <div class="safety-meter"><div class="safety-meter-fill" style="width:${safetyPct}%;background:${safetyColor}"></div></div>
              <div class="text-xs mt-1 font-semibold" style="color:${safetyColor}">${ing.safety_rating}/10 ${ing.safety_rating <= 2 ? '(Excellent)' : ing.safety_rating <= 4 ? '(Moderate)' : '(Use with care)'}</div>
            </div>
          </div>
          <div class="detail hidden mt-4 pt-4 border-t border-sakura-100">
            <p class="text-sm italic text-sakura-500 mb-3">"${ing.fun_fact}"</p>
            <div class="flex flex-wrap gap-1">
              <span class="text-xs text-gray-400">Targets:</span>
              ${(ing.concerns||[]).map(c => `<span class="badge badge-sakura text-xs">${c.replace(/_/g,' ')}</span>`).join('')}
            </div>
          </div>
        `;
        card.onclick = () => card.querySelector('.detail').classList.toggle('hidden');
        list.appendChild(card);
      });
    } catch(e) {
      wrapper.querySelector('#ingredients-list').innerHTML = `<div class="text-center py-10 text-gray-400">⚠️ Could not load. Is the backend running?</div>`;
    }
  }

  // Events
  wrapper.querySelector('#enc-search').addEventListener('input', loadIngredients);
  wrapper.querySelectorAll('.cat-btn').forEach(btn => {
    btn.onclick = () => {
      wrapper.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentCategory = btn.dataset.cat;
      loadIngredients();
    };
  });

  // INCI Checker
  wrapper.querySelector('#check-inci').onclick = async () => {
    const raw = wrapper.querySelector('#inci-input').value;
    if (!raw.trim()) return;
    const ingredients = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    try {
      const result = await api('/analyze/ingredients', {
        method: 'POST',
        body: { ingredients },
      });
      const resultsDiv = wrapper.querySelector('#inci-results');
      resultsDiv.innerHTML = `
        <div class="glass-card p-5 space-y-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div><div class="text-xl font-bold text-sakura-600">${result.recognized}/${result.total_ingredients}</div><div class="text-xs text-gray-400">Recognized</div></div>
            <div><div class="text-xl font-bold" style="color:${result.safety_score >= 70 ? '#22c55e' : result.safety_score >= 40 ? '#f59e0b' : '#ef4444'}">${result.safety_score}</div><div class="text-xs text-gray-400">Safety Score</div></div>
            <div><div class="text-xl font-bold text-red-500">${result.conflicts.length}</div><div class="text-xs text-gray-400">Conflicts</div></div>
            <div><div class="text-xl font-bold text-green-600">${result.synergies.length}</div><div class="text-xs text-gray-400">Synergies</div></div>
          </div>
          ${result.conflicts.length ? `<div><h4 class="font-bold text-red-500 text-sm mb-2">⚠️ Conflicts</h4>${result.conflicts.map(c => `<div class="ing-bar conflict"><div><strong>${c.pair.join(' × ')}</strong> — ${c.reason}<br/><span class="text-green-600 text-xs">💡 ${c.suggestion}</span></div></div>`).join('')}</div>` : ''}
          ${result.synergies.length ? `<div><h4 class="font-bold text-green-600 text-sm mb-2">✨ Synergies</h4>${result.synergies.map(s => `<div class="ing-bar shared"><div><strong>${s.pair.join(' + ')}</strong> — ${s.benefit} <span class="badge badge-green text-xs ml-1">${s.boost}</span></div></div>`).join('')}</div>` : ''}
          ${result.unresolved_ingredients.length ? `<div><h4 class="font-semibold text-sm text-gray-400 mb-1">Unrecognized</h4><p class="text-xs text-gray-400">${result.unresolved_ingredients.join(', ')}</p></div>` : ''}
        </div>
      `;
    } catch(e) {
      wrapper.querySelector('#inci-results').innerHTML = `<div class="text-sm text-red-500">Error analyzing. Is the backend running?</div>`;
    }
  };

  loadIngredients();
}
