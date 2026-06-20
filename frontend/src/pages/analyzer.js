/* ─── Skin Analyzer / Quiz Page ───────────────────────────── */

import { api, state, saveState, showToast } from '../main.js';
import { createScoreRing } from '../components/product-card.js';

const SKIN_TYPES = [
  { id: 'oily', label: 'Oily', icon: '💧', desc: 'Shiny T-zone, enlarged pores' },
  { id: 'dry', label: 'Dry', icon: '🏜️', desc: 'Tight, flaky, rough patches' },
  { id: 'combo', label: 'Combination', icon: '🔀', desc: 'Oily T-zone, dry cheeks' },
  { id: 'sensitive', label: 'Sensitive', icon: '🌿', desc: 'Easily irritated, redness' },
  { id: 'normal', label: 'Normal', icon: '✨', desc: 'Balanced, few concerns' },
];

const CONCERNS = [
  'acne', 'blackheads', 'oiliness', 'dryness', 'dehydration',
  'hyperpigmentation', 'dark_spots', 'melasma', 'dullness', 'aging',
  'wrinkles', 'fine_lines', 'sensitivity', 'redness', 'enlarged_pores',
  'texture', 'acne_scars', 'sun_damage', 'barrier_damage', 'uneven_tone',
  'inflammation', 'post_acne_marks',
];

const ALLERGENS = [
  'retinol', 'salicylic_acid', 'benzoyl_peroxide', 'vitamin_c', 'glycolic_acid',
  'tea_tree', 'kojic_acid', 'witch_hazel',
];

const BUDGETS = [
  { id: 'low', label: 'Budget-Friendly', desc: 'Under ₹600', icon: '💰' },
  { id: 'medium', label: 'Mid-Range', desc: '₹600 - ₹1200', icon: '💎' },
  { id: 'high', label: 'Premium', desc: 'Above ₹1200', icon: '👑' },
];

export function renderAnalyzer(container) {
  let step = 0;
  let answers = { skin_type: '', concerns: [], allergies: [], budget: 'medium' };

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-3xl mx-auto px-6 py-12';

  function render() {
    wrapper.innerHTML = '';

    // Header + Progress
    const header = document.createElement('div');
    header.className = 'text-center mb-10';
    header.innerHTML = `
      <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
        <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">🧪 Skin Analysis Quiz</span>
      </h1>
      <p class="text-gray-500 mb-6">Answer a few questions and our AI agents will find your perfect products</p>
      <div class="quiz-progress justify-center">
        ${[0,1,2,3].map(i => `<div class="quiz-dot ${i < step ? 'done' : i === step ? 'active' : ''}"></div><div class="${i < 3 ? 'w-8 h-0.5 bg-sakura-200' : 'hidden'} ${i < step ? '!bg-sakura-400' : ''}"></div>`).join('')}
      </div>
      <p class="text-xs text-gray-400 mt-3">Step ${step + 1} of 4</p>
    `;
    wrapper.appendChild(header);

    const content = document.createElement('div');
    content.className = 'glass-card p-8';

    if (step === 0) {
      // Skin Type
      content.innerHTML = `<h2 class="text-xl font-bold mb-6" style="font-family:var(--font-heading)">What's your skin type?</h2>`;
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
      SKIN_TYPES.forEach(st => {
        const btn = document.createElement('button');
        btn.className = `p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${answers.skin_type === st.id ? 'border-sakura-500 bg-sakura-50' : 'border-sakura-100 bg-white hover:border-sakura-300'}`;
        btn.innerHTML = `<div class="text-2xl mb-1">${st.icon}</div><div class="font-semibold">${st.label}</div><div class="text-xs text-gray-400">${st.desc}</div>`;
        btn.onclick = () => { answers.skin_type = st.id; render(); };
        grid.appendChild(btn);
      });
      content.appendChild(grid);
    } else if (step === 1) {
      // Concerns
      content.innerHTML = `<h2 class="text-xl font-bold mb-2" style="font-family:var(--font-heading)">What are your skin concerns?</h2><p class="text-sm text-gray-400 mb-6">Select all that apply</p>`;
      const pills = document.createElement('div');
      pills.className = 'flex flex-wrap gap-2';
      CONCERNS.forEach(c => {
        const btn = document.createElement('button');
        btn.className = `concern-pill ${answers.concerns.includes(c) ? 'selected' : ''}`;
        btn.textContent = c.replace(/_/g, ' ');
        btn.onclick = () => {
          const idx = answers.concerns.indexOf(c);
          if (idx > -1) answers.concerns.splice(idx, 1);
          else answers.concerns.push(c);
          render();
        };
        pills.appendChild(btn);
      });
      content.appendChild(pills);
    } else if (step === 2) {
      // Allergies
      content.innerHTML = `<h2 class="text-xl font-bold mb-2" style="font-family:var(--font-heading)">Any ingredient sensitivities?</h2><p class="text-sm text-gray-400 mb-6">Select ingredients you want to avoid (optional)</p>`;
      const pills = document.createElement('div');
      pills.className = 'flex flex-wrap gap-2';
      ALLERGENS.forEach(a => {
        const btn = document.createElement('button');
        btn.className = `concern-pill ${answers.allergies.includes(a) ? 'selected' : ''}`;
        btn.textContent = a.replace(/_/g, ' ');
        btn.onclick = () => {
          const idx = answers.allergies.indexOf(a);
          if (idx > -1) answers.allergies.splice(idx, 1);
          else answers.allergies.push(a);
          render();
        };
        pills.appendChild(btn);
      });
      content.appendChild(pills);
    } else if (step === 3) {
      // Budget
      content.innerHTML = `<h2 class="text-xl font-bold mb-6" style="font-family:var(--font-heading)">What's your budget?</h2>`;
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3';
      BUDGETS.forEach(b => {
        const btn = document.createElement('button');
        btn.className = `p-5 rounded-xl border-2 text-center transition-all cursor-pointer ${answers.budget === b.id ? 'border-sakura-500 bg-sakura-50' : 'border-sakura-100 bg-white hover:border-sakura-300'}`;
        btn.innerHTML = `<div class="text-3xl mb-2">${b.icon}</div><div class="font-semibold">${b.label}</div><div class="text-xs text-gray-400">${b.desc}</div>`;
        btn.onclick = () => { answers.budget = b.id; render(); };
        grid.appendChild(btn);
      });
      content.appendChild(grid);
    }

    wrapper.appendChild(content);

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'flex justify-between mt-6';
    if (step > 0) {
      const back = document.createElement('button');
      back.className = 'btn-outline';
      back.textContent = '← Back';
      back.onclick = () => { step--; render(); };
      nav.appendChild(back);
    } else {
      nav.appendChild(document.createElement('div'));
    }

    if (step < 3) {
      const canProceed = step === 0 ? answers.skin_type : step === 1 ? answers.concerns.length > 0 : true;
      const next = document.createElement('button');
      next.className = 'btn-sakura';
      next.textContent = 'Next →';
      next.disabled = !canProceed;
      next.style.opacity = canProceed ? '1' : '0.5';
      next.onclick = () => { if (canProceed) { step++; render(); } };
      nav.appendChild(next);
    } else {
      const submit = document.createElement('button');
      submit.className = 'btn-sakura pulse-glow';
      submit.textContent = '✨ Get My Results';
      submit.onclick = async () => {
        submit.textContent = 'Analyzing...';
        submit.disabled = true;
        try {
          const result = await api('/analyze/skin', {
            method: 'POST',
            body: answers,
          });
          state.skinProfile = answers;
          saveState();
          showResults(result);
        } catch (e) {
          showToast('❌ Error analyzing. Is the backend running?');
          submit.textContent = '✨ Get My Results';
          submit.disabled = false;
        }
      };
      nav.appendChild(submit);
    }
    wrapper.appendChild(nav);
  }

  function showResults(result) {
    wrapper.innerHTML = '';
    wrapper.innerHTML = `
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">🌸</div>
        <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
          <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">Your Skin Profile</span>
        </h1>
        <p class="text-gray-500">${result.total_matches} products matched your profile</p>
      </div>

      <div class="glass-card p-6 mb-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div class="text-2xl mb-1">🧬</div><div class="text-sm text-gray-500">Skin Type</div><div class="font-bold text-sakura-600">${result.skin_type}</div></div>
          <div><div class="text-2xl mb-1">🎯</div><div class="text-sm text-gray-500">Concerns</div><div class="font-bold text-sakura-600">${result.concerns.length}</div></div>
          <div><div class="text-2xl mb-1">✅</div><div class="text-sm text-gray-500">Seek</div><div class="font-bold text-green-600">${result.recommended_actives.length}</div></div>
          <div><div class="text-2xl mb-1">⛔</div><div class="text-sm text-gray-500">Avoid</div><div class="font-bold text-red-500">${result.avoid_actives.length}</div></div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="glass-card p-5">
          <h3 class="font-bold text-green-600 mb-3" style="font-family:var(--font-heading)">✅ Ingredients to Seek</h3>
          <div class="flex flex-wrap gap-2">${result.recommended_actives.map(a => `<span class="badge badge-green">${a.common}</span>`).join('')}</div>
        </div>
        <div class="glass-card p-5">
          <h3 class="font-bold text-red-500 mb-3" style="font-family:var(--font-heading)">⛔ Ingredients to Avoid</h3>
          <div class="flex flex-wrap gap-2">${result.avoid_actives.length ? result.avoid_actives.map(a => `<span class="badge badge-red">${a.common}</span>`).join('') : '<span class="text-sm text-gray-400">None — you\'re good!</span>'}</div>
        </div>
      </div>

      <h2 class="text-xl font-bold mb-4" style="font-family:var(--font-heading)">🏆 Top Recommended Products</h2>
      <div class="space-y-4" id="quiz-results-list"></div>

      <div class="text-center mt-8">
        <a href="#/products" class="btn-sakura no-underline">Browse All Products →</a>
        <button class="btn-outline ml-3" onclick="location.hash='#/analyzer'; location.reload()">Retake Quiz</button>
      </div>
    `;

    const list = wrapper.querySelector('#quiz-results-list');
    (result.recommended_products || []).slice(0, 8).forEach((rec, i) => {
      const p = rec.product;
      const card = document.createElement('div');
      card.className = 'glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4';
      card.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <div class="text-2xl font-bold text-sakura-300" style="font-family:var(--font-heading)">#${i+1}</div>
          <div>
            <p class="text-xs font-semibold text-sakura-500 uppercase">${p.brand}</p>
            <h4 class="font-bold" style="font-family:var(--font-heading)">${p.name}</h4>
            <div class="flex flex-wrap gap-1 mt-1">${(rec.matched_concerns || []).map(c => `<span class="badge badge-sakura text-xs">${c.replace(/_/g,' ')}</span>`).join('')}</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-lg font-bold text-sakura-600">₹${p.price}</div>
            <div class="text-xs text-gray-400">${p.size}</div>
          </div>
          ${createScoreRing(rec.match_score, 52)}
        </div>
      `;
      list.appendChild(card);
    });
  }

  render();
  container.appendChild(wrapper);
}
