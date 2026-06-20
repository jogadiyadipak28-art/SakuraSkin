/* ─── Skin Diary Page ─────────────────────────────────────── */

import { state, saveState, showToast } from '../main.js';

const EMOJIS = ['😫', '😟', '😐', '😊', '🤩'];
const DIARY_CONCERNS = ['breakout', 'dryness', 'oiliness', 'redness', 'irritation', 'flaking', 'tightness', 'smooth'];

export function renderDiary(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-4xl mx-auto px-6 py-8';

  const today = new Date().toISOString().split('T')[0];

  function render() {
    wrapper.innerHTML = `
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold mb-2" style="font-family:var(--font-heading)">
          <span class="bg-gradient-to-r from-sakura-500 to-sakura-700 bg-clip-text text-transparent">📓 Skin Diary</span>
        </h1>
        <p class="text-gray-500">Track your skin's journey — all data stays private on your device</p>
      </div>

      <!-- Today's Entry -->
      <div class="glass-card p-6 mb-8">
        <h2 class="text-xl font-bold mb-4" style="font-family:var(--font-heading)">Today's Entry — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        
        <div class="mb-6">
          <label class="text-sm font-semibold text-gray-600 mb-3 block">How does your skin feel?</label>
          <div class="emoji-scale" id="emoji-scale">
            ${EMOJIS.map((e, i) => `<button class="emoji-btn ${(state.diary[today]?.score === i+1) ? 'selected' : ''}" data-score="${i+1}">${e}</button>`).join('')}
          </div>
        </div>

        <div class="mb-6">
          <label class="text-sm font-semibold text-gray-600 mb-3 block">Skin concerns today</label>
          <div class="flex flex-wrap gap-2" id="diary-concerns">
            ${DIARY_CONCERNS.map(c => `<button class="concern-pill text-xs ${(state.diary[today]?.concerns || []).includes(c) ? 'selected' : ''}" data-concern="${c}">${c}</button>`).join('')}
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm font-semibold text-gray-600 mb-2 block">Notes</label>
          <textarea id="diary-notes" rows="3" placeholder="How's your skin today? Any new products tried?" class="w-full px-4 py-3 rounded-xl border border-sakura-200 text-sm focus:outline-none focus:border-sakura-500 bg-white/80 resize-none">${state.diary[today]?.notes || ''}</textarea>
        </div>

        <button id="save-diary" class="btn-sakura">Save Entry 🌸</button>
      </div>

      <!-- History -->
      <div class="glass-card p-6 mb-8">
        <h2 class="text-xl font-bold mb-4" style="font-family:var(--font-heading)">📊 Skin Score Trend</h2>
        <div style="height:250px" class="mb-4">
          <canvas id="diary-chart"></canvas>
        </div>
      </div>

      <!-- Past Entries -->
      <div>
        <h2 class="text-xl font-bold mb-4" style="font-family:var(--font-heading)">📅 Past Entries</h2>
        <div id="past-entries" class="space-y-3"></div>
      </div>
    `;

    // Events
    wrapper.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.onclick = () => {
        wrapper.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
    });

    wrapper.querySelectorAll('#diary-concerns .concern-pill').forEach(btn => {
      btn.onclick = () => btn.classList.toggle('selected');
    });

    wrapper.querySelector('#save-diary').onclick = () => {
      const scoreBtn = wrapper.querySelector('.emoji-btn.selected');
      const score = scoreBtn ? parseInt(scoreBtn.dataset.score) : 3;
      const concerns = Array.from(wrapper.querySelectorAll('#diary-concerns .concern-pill.selected')).map(b => b.dataset.concern);
      const notes = wrapper.querySelector('#diary-notes').value;

      state.diary[today] = { score, concerns, notes, timestamp: new Date().toISOString() };
      saveState();
      showToast('📓 Diary entry saved!');
      render();
    };

    // Chart
    renderChart();
    renderPastEntries();
  }

  function renderChart() {
    const canvas = wrapper.querySelector('#diary-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const entries = Object.entries(state.diary)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14);

    if (entries.length < 1) {
      canvas.parentElement.innerHTML = '<p class="text-center text-gray-400 py-8">Start logging daily to see your skin score trend!</p>';
      return;
    }

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: entries.map(([date]) => {
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Skin Score',
          data: entries.map(([, e]) => e.score),
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ec4899',
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 6, ticks: { callback: (v) => EMOJIS[v-1] || '', stepSize: 1 }, grid: { color: 'rgba(236, 72, 153, 0.1)' } },
          x: { grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  function renderPastEntries() {
    const list = wrapper.querySelector('#past-entries');
    const entries = Object.entries(state.diary)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 14);

    if (entries.length === 0) {
      list.innerHTML = '<p class="text-center text-gray-400 py-4">No diary entries yet. Start tracking today!</p>';
      return;
    }

    entries.forEach(([date, entry]) => {
      const d = new Date(date);
      const card = document.createElement('div');
      card.className = 'glass-card p-4 flex items-center gap-4';
      card.innerHTML = `
        <div class="text-3xl">${EMOJIS[(entry.score || 3) - 1]}</div>
        <div class="flex-1">
          <p class="font-semibold text-sm">${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          <div class="flex flex-wrap gap-1 mt-1">
            ${(entry.concerns || []).map(c => `<span class="badge badge-sakura text-xs">${c}</span>`).join('')}
          </div>
          ${entry.notes ? `<p class="text-xs text-gray-400 mt-1">${entry.notes}</p>` : ''}
        </div>
        <button class="bg-transparent border-none cursor-pointer text-red-400 text-sm hover:text-red-600" data-date="${date}">🗑️</button>
      `;
      card.querySelector('button[data-date]').onclick = () => {
        delete state.diary[date];
        saveState();
        showToast('🗑️ Entry deleted');
        render();
      };
      list.appendChild(card);
    });
  }

  render();
  container.appendChild(wrapper);
}
