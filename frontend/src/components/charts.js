/* ─── Sakura-Themed Chart.js Wrappers ────────────────────── */

const SAKURA_PALETTE = {
  pink:     ['rgba(236, 72, 153, 1)',   'rgba(236, 72, 153, 0.15)'],
  rose:     ['rgba(244, 63, 94, 1)',    'rgba(244, 63, 94, 0.15)'],
  lavender: ['rgba(168, 85, 247, 1)',   'rgba(168, 85, 247, 0.15)'],
  mauve:    ['rgba(192, 132, 252, 1)',  'rgba(192, 132, 252, 0.15)'],
  blush:    ['rgba(251, 113, 133, 1)',  'rgba(251, 113, 133, 0.15)'],
  coral:    ['rgba(251, 146, 60, 1)',   'rgba(251, 146, 60, 0.15)'],
  mint:     ['rgba(52, 211, 153, 1)',   'rgba(52, 211, 153, 0.15)'],
  sky:      ['rgba(56, 189, 248, 1)',   'rgba(56, 189, 248, 0.15)'],
};

const PALETTE_KEYS = Object.keys(SAKURA_PALETTE);

function getColor(index, type = 'solid') {
  const key = PALETTE_KEYS[index % PALETTE_KEYS.length];
  return type === 'solid' ? SAKURA_PALETTE[key][0] : SAKURA_PALETTE[key][1];
}

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: 'Inter', size: 12 },
        usePointStyle: true,
        pointStyleWidth: 10,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#6b7280',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      borderWidth: 1,
      cornerRadius: 12,
      titleFont: { family: 'Outfit', weight: '600' },
      bodyFont: { family: 'Inter' },
      padding: 12,
    },
  },
};

/**
 * Create a sakura-themed line chart (e.g., for skin diary trends).
 */
export function createLineChart(canvas, labels, datasets, options = {}) {
  if (typeof Chart === 'undefined') return null;

  const themedDatasets = datasets.map((ds, i) => ({
    borderColor: getColor(i, 'solid'),
    backgroundColor: getColor(i, 'fill'),
    borderWidth: 3,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: getColor(i, 'solid'),
    pointRadius: 5,
    pointHoverRadius: 8,
    ...ds,
  }));

  return new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: themedDatasets },
    options: {
      ...BASE_OPTIONS,
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
        y: { grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { font: { family: 'Inter', size: 11 } } },
      },
      ...options,
    },
  });
}

/**
 * Create a sakura-themed radar chart (e.g., for product comparison).
 */
export function createRadarChart(canvas, labels, datasets, options = {}) {
  if (typeof Chart === 'undefined') return null;

  const themedDatasets = datasets.map((ds, i) => ({
    borderColor: getColor(i, 'solid'),
    backgroundColor: getColor(i, 'fill'),
    borderWidth: 2,
    pointBackgroundColor: getColor(i, 'solid'),
    pointRadius: 4,
    pointHoverRadius: 6,
    ...ds,
  }));

  return new Chart(canvas, {
    type: 'radar',
    data: { labels, datasets: themedDatasets },
    options: {
      ...BASE_OPTIONS,
      scales: {
        r: {
          grid: { color: 'rgba(236, 72, 153, 0.1)' },
          angleLines: { color: 'rgba(236, 72, 153, 0.1)' },
          pointLabels: { font: { family: 'Inter', size: 11 } },
          ticks: { display: false },
          suggestedMin: 0,
        },
      },
      ...options,
    },
  });
}

/**
 * Create a sakura-themed doughnut chart (e.g., for ingredient breakdown).
 */
export function createDoughnutChart(canvas, labels, data, options = {}) {
  if (typeof Chart === 'undefined') return null;

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => getColor(i, 'solid')),
        borderColor: 'white',
        borderWidth: 3,
        hoverBorderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      ...BASE_OPTIONS,
      cutout: '65%',
      ...options,
    },
  });
}

/**
 * Create a sakura-themed bar chart (e.g., for score comparison).
 */
export function createBarChart(canvas, labels, datasets, options = {}) {
  if (typeof Chart === 'undefined') return null;

  const themedDatasets = datasets.map((ds, i) => ({
    backgroundColor: getColor(i, 'fill'),
    borderColor: getColor(i, 'solid'),
    borderWidth: 2,
    borderRadius: 8,
    ...ds,
  }));

  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: themedDatasets },
    options: {
      ...BASE_OPTIONS,
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
        y: { grid: { color: 'rgba(236, 72, 153, 0.08)' }, ticks: { font: { family: 'Inter', size: 11 } } },
      },
      ...options,
    },
  });
}
