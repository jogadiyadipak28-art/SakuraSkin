/* ─── Footer Component ────────────────────────────────────── */

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer-wave bg-sakura-900 text-sakura-100 mt-20';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <h3 class="text-xl font-bold text-white mb-4" style="font-family:var(--font-heading)">🌸 SakuraSkin</h3>
        <p class="text-sm text-sakura-300 leading-relaxed">AI-powered multi-agent skincare recommender system. Analyze ingredients, find dupes, build routines, and discover your perfect skincare match.</p>
      </div>
      <div>
        <h4 class="font-semibold text-white mb-4" style="font-family:var(--font-heading)">Quick Links</h4>
        <div class="flex flex-col gap-2 text-sm">
          <a href="#/analyzer" class="text-sakura-300 hover:text-white no-underline transition-colors">🧪 Skin Quiz</a>
          <a href="#/products" class="text-sakura-300 hover:text-white no-underline transition-colors">🛍️ Products</a>
          <a href="#/encyclopedia" class="text-sakura-300 hover:text-white no-underline transition-colors">📖 Encyclopedia</a>
          <a href="#/routine" class="text-sakura-300 hover:text-white no-underline transition-colors">🧴 Routine Builder</a>
          <a href="#/diary" class="text-sakura-300 hover:text-white no-underline transition-colors">📓 Skin Diary</a>
        </div>
      </div>
      <div>
        <h4 class="font-semibold text-white mb-4" style="font-family:var(--font-heading)">Our Agents</h4>
        <div class="flex flex-col gap-2 text-sm text-sakura-300">
          <span>🧪 Formulation Agent — Cosmetic Chemist AI</span>
          <span>🔍 Scraper Agent — INCI Fetcher</span>
          <span>🧠 Skin Analyzer — Personalized Recommendations</span>
          <span>🧴 Routine Agent — Smart Routine Builder</span>
          <span>💸 Dupe Finder — Budget-Friendly Alternatives</span>
        </div>
      </div>
    </div>
    <div class="border-t border-sakura-800 py-6 text-center text-sm text-sakura-400">
      Made with 🌸 by SakuraSkin Team · Multi-Agent Skincare Intelligence
    </div>
  `;
  return footer;
}
