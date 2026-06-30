/* ─── Footer Component ────────────────────────────────────── */

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer-wave mt-20';
  footer.style.background = 'linear-gradient(135deg, #831843 0%, #14532d 100%)';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <h3 class="text-xl font-bold text-white mb-4" style="font-family:var(--font-heading)">🌸 SakuraSkin</h3>
        <p class="text-sm leading-relaxed" style="color: rgba(255,255,255,0.7)">AI-powered multi-agent skincare recommender system. Analyze ingredients, find dupes, build routines, and discover your perfect skincare match.</p>
      </div>
      <div>
        <h4 class="font-semibold text-white mb-4" style="font-family:var(--font-heading)">Quick Links</h4>
        <div class="flex flex-col gap-2 text-sm">
          <a href="#/analyzer" style="color: rgba(255,255,255,0.65)" class="hover:text-white no-underline transition-colors">🧪 Skin Quiz</a>
          <a href="#/products" style="color: rgba(255,255,255,0.65)" class="hover:text-white no-underline transition-colors">🛍️ Products</a>
          <a href="#/encyclopedia" style="color: rgba(255,255,255,0.65)" class="hover:text-white no-underline transition-colors">📖 Encyclopedia</a>
          <a href="#/routine" style="color: rgba(255,255,255,0.65)" class="hover:text-white no-underline transition-colors">🧴 Routine Builder</a>
          <a href="#/diary" style="color: rgba(255,255,255,0.65)" class="hover:text-white no-underline transition-colors">📓 Skin Diary</a>
        </div>
      </div>
      <div>
        <h4 class="font-semibold text-white mb-4" style="font-family:var(--font-heading)">Our Agents</h4>
        <div class="flex flex-col gap-2 text-sm" style="color: rgba(255,255,255,0.65)">
          <span>🧪 Formulation Agent — Cosmetic Chemist AI</span>
          <span>🔍 Scraper Agent — INCI Fetcher</span>
          <span>🧠 Skin Analyzer — Personalized Recommendations</span>
          <span>🧴 Routine Agent — Smart Routine Builder</span>
          <span>💸 Dupe Finder — Budget-Friendly Alternatives</span>
        </div>
      </div>
    </div>
    <div class="py-6 text-center text-sm" style="border-top: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5)">
      Made with 🌸🌿 by SakuraSkin Team · Multi-Agent Skincare Intelligence
    </div>
  `;
  return footer;
}
