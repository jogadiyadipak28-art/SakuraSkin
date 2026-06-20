/* ─── Routine Builder Page ────────────────────────────────── */

import { api, state, saveState, showToast } from '../main.js';
import { createScoreRing } from '../components/product-card.js';

export async function renderRoutine(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-6xl mx-auto px-6 py-8';

  let timeOfDay = 'am';
  let amProducts = state.routines.am || [];
  let pmProducts = state.routines.pm || [];
  let allProducts = [];
  let routineResult = null;

  wrapper.innerHTML = `
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">🧴 Routine Builder</span>
      </h1>
      <p class="text-gray-500">Build and validate your AM/PM skincare routine with the Routine Agent</p>
    </div>
    <div id="routine-content"><div class="text-center py-10 text-gray-400">Loading products...</div></div>
  `;
  container.appendChild(wrapper);

  try {
    allProducts = await api('/products');
  } catch(e) {
    wrapper.querySelector('#routine-content').innerHTML = `<div class="text-center py-10 text-gray-400">⚠️ Could not load products. Is the backend running?</div>`;
    return;
  }

  function renderBuilder() {
    const content = wrapper.querySelector('#routine-content');
    content.innerHTML = '';

    // Time toggle
    const toggle = document.createElement('div');
    toggle.className = 'flex justify-center gap-2 mb-8';
    toggle.innerHTML = `
      <button class="toggle-btn ${timeOfDay === 'am' ? 'btn-sakura' : 'btn-outline'}" data-time="am">☀️ Morning (AM)</button>
      <button class="toggle-btn ${timeOfDay === 'pm' ? 'btn-sakura' : 'btn-outline'}" data-time="pm">🌙 Evening (PM)</button>
    `;
    toggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.onclick = () => { timeOfDay = btn.dataset.time; renderBuilder(); };
    });
    content.appendChild(toggle);

    const currentList = timeOfDay === 'am' ? amProducts : pmProducts;
    const layout = document.createElement('div');
    layout.className = 'grid grid-cols-1 lg:grid-cols-3 gap-6';

    // Left: current routine
    const left = document.createElement('div');
    left.className = 'lg:col-span-2';
    left.innerHTML = `<h2 class="text-xl font-bold mb-4" style="font-family:var(--font-heading)">${timeOfDay === 'am' ? '☀️ Morning' : '🌙 Evening'} Routine</h2>`;

    if (currentList.length === 0) {
      left.innerHTML += `<div class="glass-card p-8 text-center text-gray-400"><div class="text-4xl mb-3">🧴</div><p>No products in your ${timeOfDay === 'am' ? 'morning' : 'evening'} routine yet.</p><p class="text-sm mt-1">Add products from the library on the right →</p></div>`;
    } else {
      const steps = document.createElement('div');
      steps.className = 'space-y-3';
      currentList.forEach((pid, idx) => {
        const prod = allProducts.find(p => p.id === pid);
        if (!prod) return;
        const step = document.createElement('div');
        step.className = 'routine-step';
        step.innerHTML = `
          <div class="text-lg font-bold text-sakura-300 w-8" style="font-family:var(--font-heading)">${idx + 1}</div>
          <div class="flex-1">
            <p class="text-xs font-semibold text-sakura-500 uppercase">${prod.brand}</p>
            <p class="font-semibold text-sm">${prod.name}</p>
            <span class="badge badge-sakura text-xs">${prod.category}</span>
          </div>
          <button class="remove-btn bg-transparent border-none cursor-pointer text-sm text-red-400 hover:text-red-600" data-idx="${idx}">✕ Remove</button>
        `;
        step.querySelector('.remove-btn').onclick = () => {
          if (timeOfDay === 'am') amProducts.splice(idx, 1);
          else pmProducts.splice(idx, 1);
          saveRoutines();
          renderBuilder();
        };
        steps.appendChild(step);
      });
      left.appendChild(steps);

      // Validate button
      const validateBtn = document.createElement('button');
      validateBtn.className = 'btn-sakura mt-6';
      validateBtn.textContent = '🧪 Validate Routine';
      validateBtn.onclick = async () => {
        validateBtn.textContent = 'Analyzing...';
        validateBtn.disabled = true;
        try {
          routineResult = await api('/routine/build', {
            method: 'POST',
            body: { product_ids: currentList, time_of_day: timeOfDay },
          });
          renderResults(left);
        } catch(e) {
          showToast('❌ Error validating routine');
        }
        validateBtn.textContent = '🧪 Validate Routine';
        validateBtn.disabled = false;
      };
      left.appendChild(validateBtn);

      if (routineResult) renderResults(left);
    }

    // Right: product library
    const right = document.createElement('div');
    right.innerHTML = `
      <h3 class="font-bold mb-3" style="font-family:var(--font-heading)">📦 Product Library</h3>
      <input id="routine-search" type="text" placeholder="Search..." class="w-full px-3 py-2 rounded-lg border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80 mb-3" />
      <div id="routine-library" class="space-y-2 max-h-[60vh] overflow-y-auto pr-1"></div>
    `;

    layout.appendChild(left);
    layout.appendChild(right);
    content.appendChild(layout);

    // Populate library
    const lib = right.querySelector('#routine-library');
    const renderLibrary = (search = '') => {
      lib.innerHTML = '';
      const filtered = allProducts.filter(p => {
        if (currentList.includes(p.id)) return false;
        if (search) {
          const q = search.toLowerCase();
          return (p.name + p.brand + p.category).toLowerCase().includes(q);
        }
        return true;
      });
      filtered.forEach(p => {
        const item = document.createElement('div');
        item.className = 'glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-sakura-400';
        item.innerHTML = `
          <div class="flex-1">
            <p class="text-xs text-sakura-500 font-semibold">${p.brand}</p>
            <p class="text-sm font-medium">${p.name}</p>
            <span class="badge badge-sakura text-xs">${p.category}</span>
          </div>
          <button class="btn-sakura text-xs px-3 py-1">+ Add</button>
        `;
        item.querySelector('button').onclick = () => {
          if (timeOfDay === 'am') amProducts.push(p.id);
          else pmProducts.push(p.id);
          saveRoutines();
          routineResult = null;
          renderBuilder();
          showToast(`Added ${p.name} to ${timeOfDay.toUpperCase()} routine`);
        };
        lib.appendChild(item);
      });
    };
    renderLibrary();
    right.querySelector('#routine-search').addEventListener('input', (e) => renderLibrary(e.target.value));
  }

  function saveRoutines() {
    state.routines = { am: amProducts, pm: pmProducts };
    saveState();
  }

  function renderResults(container) {
    if (!routineResult) return;
    const r = routineResult;

    let existing = container.querySelector('#routine-results');
    if (existing) existing.remove();

    const results = document.createElement('div');
    results.id = 'routine-results';
    results.className = 'mt-6 space-y-4';

    // Score
    results.innerHTML = `
      <div class="glass-card p-6 text-center">
        <h3 class="font-bold text-sakura-700 mb-3" style="font-family:var(--font-heading)">Routine Score</h3>
        <div class="flex justify-center">${createScoreRing(r.routine_score, 80)}</div>
        <p class="text-sm text-gray-500 mt-2">${r.routine_score >= 80 ? '✨ Excellent routine!' : r.routine_score >= 60 ? '👍 Good, but some improvements possible' : '⚠️ Some issues detected'}</p>
      </div>
    `;

    // Warnings
    if (r.warnings.length > 0) {
      const warningsHtml = r.warnings.map(w => `
        <div class="ing-bar ${w.type === 'conflict' ? 'conflict' : 'unique'} p-3">
          <div>
            <p class="font-semibold text-sm">${w.message}</p>
            ${w.suggestion ? `<p class="text-xs text-green-600 mt-1">💡 ${w.suggestion}</p>` : ''}
          </div>
        </div>
      `).join('');
      results.innerHTML += `<div class="glass-card p-5"><h4 class="font-bold text-amber-600 mb-3">⚠️ Warnings (${r.warnings.length})</h4>${warningsHtml}</div>`;
    }

    // Wait times
    if (r.wait_times.length > 0) {
      results.innerHTML += `
        <div class="glass-card p-5">
          <h4 class="font-bold text-blue-600 mb-3">⏱️ Wait Times</h4>
          ${r.wait_times.map(w => `<div class="ing-bar shared"><strong>${w.pair.join(' → ')}</strong>: Wait ${w.wait_time}</div>`).join('')}
        </div>
      `;
    }

    container.appendChild(results);
  }

  renderBuilder();
}
