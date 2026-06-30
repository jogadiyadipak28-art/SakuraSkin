/* ─── Home Page ───────────────────────────────────────────── */

import { api } from '../main.js';

const CONCERNS = [
  { id: 'acne', label: 'Acne', icon: '🔴' },
  { id: 'dryness', label: 'Dryness', icon: '🏜️' },
  { id: 'aging', label: 'Anti-Aging', icon: '⏳' },
  { id: 'hyperpigmentation', label: 'Dark Spots', icon: '🟤' },
  { id: 'sensitivity', label: 'Sensitivity', icon: '🌿' },
  { id: 'oiliness', label: 'Oily Skin', icon: '💧' },
  { id: 'dullness', label: 'Dullness', icon: '✨' },
  { id: 'texture', label: 'Texture', icon: '🪨' },
];

const HERO_SLIDES = [
  {
    image: './images/model_hero_1.png',
    subtitle: 'AI-Powered Skincare Intelligence',
    title: 'Discover Your <em>Perfect</em> Skincare',
    description: 'Five intelligent agents analyze ingredients, detect conflicts, and build routines personalized to your unique skin.',
    cta: { text: 'Take the Skin Quiz', icon: '🧪', link: '#/analyzer' },
    ctaSecondary: { text: 'Explore Products', link: '#/products' },
  },
  {
    image: './images/model_hero_2.png',
    subtitle: 'Backed by Science, Driven by AI',
    title: 'Beauty Meets <em>Intelligence</em>',
    description: 'Our multi-agent system cross-references 150+ ingredients and 30+ interaction rules to craft your ideal routine.',
    cta: { text: 'Build Your Routine', icon: '🧴', link: '#/routine' },
    ctaSecondary: { text: 'Learn More', link: '#/encyclopedia' },
  },
  {
    image: './images/model_hero_3.png',
    subtitle: 'Smart Beauty, Real Results',
    title: 'Your Skin, <em>Elevated</em>',
    description: 'Find affordable dupes, avoid harmful combinations, and unlock the science behind every ingredient.',
    cta: { text: 'Compare Products', icon: '⚖️', link: '#/compare' },
    ctaSecondary: { text: 'Skin Diary', link: '#/diary' },
  },
];

const TESTIMONIALS = [
  {
    avatar: './images/model_hero_1.png',
    name: 'Priya Sharma',
    role: 'Skincare Enthusiast',
    quote: 'SakuraSkin completely transformed my routine! The AI detected a conflict between my vitamin C and niacinamide that I never knew about. My skin has never looked better.',
  },
  {
    avatar: './images/model_hero_2.png',
    name: 'Ananya Patel',
    role: 'Beauty Blogger',
    quote: 'The dupe finder saved me thousands of rupees! I found an affordable alternative to my expensive serum with 90% ingredient overlap. Absolute game-changer.',
  },
  {
    avatar: './images/model_hero_3.png',
    name: 'Meera Krishnan',
    role: 'Dermatology Student',
    quote: 'As someone studying skin science, I\'m impressed by how accurately the formulation agent analyzes ingredient interactions. This is real cosmetic chemistry made accessible.',
  },
];

export async function renderHome(container) {
  // ─── Hero Slider ───────────────────────────────────────
  const hero = document.createElement('section');
  hero.className = 'hero-slider';
  hero.id = 'hero-slider';

  // Build slides
  hero.innerHTML = HERO_SLIDES.map((slide, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
      <div class="hero-slide-bg" style="background-image: url('${slide.image}')"></div>
      <div class="hero-slide-overlay"></div>
      <div class="hero-slide-content">
        <div class="max-w-3xl mx-auto">
          <p class="hero-accent text-lg md:text-xl text-botanical-600 mb-4">${slide.subtitle}</p>
          <h1 class="hero-tagline text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span class="bg-gradient-to-r from-sakura-600 via-sakura-700 to-botanical-600 bg-clip-text text-transparent">${slide.title}</span>
          </h1>
          <p class="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style="font-family:var(--font-body)">
            ${slide.description}
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <a href="${slide.cta.link}" class="btn-sakura text-base px-8 py-3.5 no-underline inline-flex items-center gap-2">
              ${slide.cta.icon} ${slide.cta.text}
            </a>
            <a href="${slide.ctaSecondary.link}" class="btn-outline text-base px-6 py-3 no-underline">
              ${slide.ctaSecondary.text} →
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Arrow nav
  hero.innerHTML += `
    <button class="hero-arrow hero-arrow--prev" aria-label="Previous slide">❮</button>
    <button class="hero-arrow hero-arrow--next" aria-label="Next slide">❯</button>
  `;

  // Dot nav
  hero.innerHTML += `
    <div class="hero-dots">
      ${HERO_SLIDES.map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
    </div>
  `;

  // Progress bar
  hero.innerHTML += `<div class="hero-progress" id="hero-progress" style="width: 0%"></div>`;

  container.appendChild(hero);

  // Slider logic
  initHeroSlider(hero);

  // ─── Stats ────────────────────────────────────────────
  const stats = document.createElement('section');
  stats.className = 'max-w-5xl mx-auto px-6 -mt-8 relative z-10';
  stats.innerHTML = `
    <div class="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div><div class="text-3xl font-bold text-botanical-600" style="font-family:var(--font-heading)">150+</div><div class="text-sm text-gray-500">Ingredients Analyzed</div></div>
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">45+</div><div class="text-sm text-gray-500">Products in Database</div></div>
      <div><div class="text-3xl font-bold text-botanical-600" style="font-family:var(--font-heading)">5</div><div class="text-sm text-gray-500">AI Agents Working</div></div>
      <div><div class="text-3xl font-bold text-sakura-600" style="font-family:var(--font-heading)">30+</div><div class="text-sm text-gray-500">Interaction Rules</div></div>
    </div>
  `;
  container.appendChild(stats);

  // ─── Model Showcase — "Real Results" ──────────────────
  const showcase = document.createElement('section');
  showcase.className = 'max-w-6xl mx-auto px-6 mt-20';
  showcase.innerHTML = `
    <div class="text-center mb-12">
      <p class="hero-accent text-lg text-botanical-500 mb-2">Powered by Science</p>
      <h2 class="text-3xl md:text-4xl font-bold mb-3" style="font-family:var(--font-heading)">
        Real Results, <em class="text-botanical-600">Real Confidence</em>
      </h2>
      <div class="section-divider"></div>
      <p class="text-gray-500 max-w-xl mx-auto">Our AI-powered analysis helps you build the perfect routine for radiant, healthy skin</p>
    </div>
    <div class="model-showcase-grid">
      <div class="model-showcase rounded-2xl overflow-hidden" style="position:relative">
        <img src="./images/model_routine.png" alt="Skincare routine" class="model-showcase-img" />
        <div class="floating-stat" style="top: 1.5rem; right: 1.5rem;">
          <div class="text-2xl font-bold text-botanical-600" style="font-family:var(--font-heading)">98%</div>
          <div class="text-xs text-gray-500">Accuracy Rate</div>
        </div>
        <div class="floating-stat" style="bottom: 5rem; left: 1.5rem; animation-delay: 1.5s;">
          <div class="text-2xl font-bold text-botanical-600" style="font-family:var(--font-heading)">5</div>
          <div class="text-xs text-gray-500">AI Agents</div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="glass-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">🧪</span>
            <h3 class="font-bold text-botanical-700" style="font-family:var(--font-heading)">Ingredient Intelligence</h3>
          </div>
          <p class="text-sm text-gray-500 leading-relaxed">Every product is decoded by our Formulation Agent — analyzing INCI lists, flagging conflicts, and identifying synergies between active ingredients.</p>
        </div>
        <div class="glass-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">💡</span>
            <h3 class="font-bold text-sakura-700" style="font-family:var(--font-heading)">Smart Recommendations</h3>
          </div>
          <p class="text-sm text-gray-500 leading-relaxed">Our Skin Analyzer maps your unique profile — skin type, concerns, sensitivities — to precisely the right ingredients and products.</p>
        </div>
        <div class="glass-card p-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">💸</span>
            <h3 class="font-bold text-botanical-700" style="font-family:var(--font-heading)">Budget-Friendly Dupes</h3>
          </div>
          <p class="text-sm text-gray-500 leading-relaxed">The Dupe Finder compares ingredient overlap to surface affordable alternatives — same actives, lower price. Your wallet will thank you.</p>
        </div>
      </div>
    </div>
  `;
  container.appendChild(showcase);

  // ─── Ingredient of the Day ────────────────────────────
  try {
    const iotd = await api('/ingredient-of-the-day');
    const iotdSection = document.createElement('section');
    iotdSection.className = 'max-w-5xl mx-auto px-6 mt-20';
    iotdSection.innerHTML = `
      <div class="text-center mb-8">
        <p class="hero-accent text-lg text-botanical-500 mb-2">Daily Discovery</p>
        <h2 class="text-2xl md:text-3xl font-bold mb-3" style="font-family:var(--font-heading)">🌟 Ingredient of the Day</h2>
        <div class="section-divider"></div>
      </div>
      <div class="glass-card p-8 md:flex items-center gap-8">
        <div class="text-6xl mb-4 md:mb-0">🧪</div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-botanical-700 mb-1" style="font-family:var(--font-heading)">${iotd.common}</h3>
          <p class="text-xs text-gray-400 mb-2" style="font-family:var(--font-accent);font-style:italic">${iotd.inci}</p>
          <p class="text-gray-600 mb-3">${iotd.function}</p>
          <p class="text-sm italic text-sakura-500" style="font-family:var(--font-accent)">"${iotd.fun_fact}"</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span class="badge badge-sakura">${iotd.category}</span>
            <span class="badge ${iotd.safety_rating <= 2 ? 'badge-green' : iotd.safety_rating <= 4 ? 'badge-amber' : 'badge-red'}">Safety: ${iotd.safety_rating}/10</span>
            <span class="badge badge-blue">pH ${iotd.ph_min}-${iotd.ph_max}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(iotdSection);
  } catch(e) { /* skip if API down */ }

  // ─── Skin Concerns ────────────────────────────────────
  const concerns = document.createElement('section');
  concerns.className = 'max-w-5xl mx-auto px-6 mt-20';
  concerns.innerHTML = `
    <div class="text-center mb-8">
      <p class="hero-accent text-lg text-sakura-500 mb-2">Personalized Care</p>
      <h2 class="text-2xl md:text-3xl font-bold mb-3" style="font-family:var(--font-heading)">What's Your Skin Concern?</h2>
      <div class="section-divider"></div>
      <p class="text-gray-500 mb-8">Select a concern to find targeted products</p>
    </div>
    <div class="flex flex-wrap gap-3 justify-center" id="home-concerns">
      ${CONCERNS.map(c => `
        <a href="#/products?concern=${c.id}" class="concern-pill no-underline">${c.icon} ${c.label}</a>
      `).join('')}
    </div>
  `;
  container.appendChild(concerns);

  // ─── Testimonials Carousel ────────────────────────────
  const testimonials = document.createElement('section');
  testimonials.className = 'max-w-3xl mx-auto px-6 mt-20';
  testimonials.innerHTML = `
    <div class="text-center mb-8">
      <p class="hero-accent text-lg text-botanical-500 mb-2">Loved by Skincare Enthusiasts</p>
      <h2 class="text-2xl md:text-3xl font-bold mb-3" style="font-family:var(--font-heading)">What Our Users Say</h2>
      <div class="section-divider"></div>
    </div>
    <div class="testimonial-carousel" id="testimonial-carousel">
      <div class="testimonial-track" id="testimonial-track">
        ${TESTIMONIALS.map(t => `
          <div class="testimonial-slide">
            <div class="testimonial-card">
              <img src="${t.avatar}" alt="${t.name}" class="testimonial-avatar" />
              <p class="testimonial-quote">"${t.quote}"</p>
              <p class="testimonial-name">${t.name}</p>
              <p class="text-xs text-gray-400 mt-1">${t.role}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="testimonial-dots" id="testimonial-dots">
        ${TESTIMONIALS.map((_, i) => `<button class="testimonial-dot ${i === 0 ? 'active' : ''}" data-tdot="${i}"></button>`).join('')}
      </div>
    </div>
  `;
  container.appendChild(testimonials);
  initTestimonialCarousel(testimonials);

  // ─── Before/After Showcase ────────────────────────────
  const beforeAfter = document.createElement('section');
  beforeAfter.className = 'max-w-6xl mx-auto px-6 mt-20';
  beforeAfter.innerHTML = `
    <div class="model-showcase-grid" style="direction:rtl">
      <div class="model-showcase rounded-2xl overflow-hidden" style="position:relative;direction:ltr">
        <img src="./images/model_results.png" alt="Skincare results" class="model-showcase-img" />
        <div class="floating-stat" style="top: 1.5rem; left: 1.5rem;">
          <div class="text-2xl font-bold text-botanical-600" style="font-family:var(--font-heading)">150+</div>
          <div class="text-xs text-gray-500">Ingredients</div>
        </div>
      </div>
      <div style="direction:ltr" class="space-y-4">
        <p class="hero-accent text-lg text-sakura-500">The Science Behind Beauty</p>
        <h2 class="text-3xl md:text-4xl font-bold" style="font-family:var(--font-heading)">
          Build Your <em class="text-botanical-600">Perfect Routine</em>
        </h2>
        <p class="text-gray-500 leading-relaxed">
          Our Routine Agent intelligently orders your products, detects inter-product conflicts, 
          and alerts you to missing steps. Say goodbye to guesswork — embrace skincare backed by AI precision.
        </p>
        <div class="flex flex-wrap gap-3 mt-2">
          <div class="glass-card px-4 py-3 text-center flex-1 min-w-[120px]">
            <div class="text-xl font-bold text-sakura-600" style="font-family:var(--font-heading)">AM + PM</div>
            <div class="text-xs text-gray-500">Routines</div>
          </div>
          <div class="glass-card px-4 py-3 text-center flex-1 min-w-[120px]">
            <div class="text-xl font-bold text-botanical-600" style="font-family:var(--font-heading)">Smart</div>
            <div class="text-xs text-gray-500">Ordering</div>
          </div>
          <div class="glass-card px-4 py-3 text-center flex-1 min-w-[120px]">
            <div class="text-xl font-bold text-sakura-600" style="font-family:var(--font-heading)">Conflict</div>
            <div class="text-xs text-gray-500">Detection</div>
          </div>
        </div>
        <a href="#/routine" class="btn-sakura inline-block no-underline mt-4">Build My Routine →</a>
      </div>
    </div>
  `;
  container.appendChild(beforeAfter);

  // ─── How It Works ─────────────────────────────────────
  const howSection = document.createElement('section');
  howSection.className = 'max-w-5xl mx-auto px-6 mt-20';
  howSection.innerHTML = `
    <div class="text-center mb-10">
      <p class="hero-accent text-lg text-botanical-500 mb-2">Under the Hood</p>
      <h2 class="text-2xl md:text-3xl font-bold mb-3" style="font-family:var(--font-heading)">How Our Agents Work Together</h2>
      <div class="section-divider"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧪</div>
        <h3 class="text-lg font-bold mb-2 text-botanical-700" style="font-family:var(--font-heading)">Formulation Agent</h3>
        <p class="text-sm text-gray-500">Acts as your personal cosmetic chemist. Parses INCI lists and cross-references ingredient interactions, flagging conflicts and synergies.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🔍</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Scraper Agent</h3>
        <p class="text-sm text-gray-500">Searches the web for product listings, fetching exact INCI ingredient lists from brands like Minimalist, The Ordinary, and CeraVe.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧠</div>
        <h3 class="text-lg font-bold mb-2 text-botanical-700" style="font-family:var(--font-heading)">Skin Analyzer</h3>
        <p class="text-sm text-gray-500">Analyzes your unique skin profile — type, concerns, allergies — and maps them to the perfect active ingredients and products.</p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">🧴</div>
        <h3 class="text-lg font-bold mb-2 text-sakura-700" style="font-family:var(--font-heading)">Routine Agent</h3>
        <p class="text-sm text-gray-500">Builds and validates AM/PM skincare routines. Smart ordering, conflict detection between products, and missing step alerts.</p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-4">💸</div>
        <h3 class="text-lg font-bold mb-2 text-botanical-700" style="font-family:var(--font-heading)">Dupe Finder</h3>
        <p class="text-sm text-gray-500">Compares ingredient overlap between products to find affordable alternatives. Same ingredients, lower price tag.</p>
      </div>
    </div>
  `;
  container.appendChild(howSection);

  // ─── Seasonal Tips ────────────────────────────────────
  try {
    const seasonal = await api('/seasonal-tips');
    const tipSection = document.createElement('section');
    tipSection.className = 'max-w-5xl mx-auto px-6 mt-20';
    tipSection.innerHTML = `
      <div class="text-center mb-8">
        <p class="hero-accent text-lg text-sakura-500 mb-2">Seasonal Wisdom</p>
        <h2 class="text-2xl md:text-3xl font-bold mb-3" style="font-family:var(--font-heading)">
          🌦️ ${seasonal.season.charAt(0).toUpperCase() + seasonal.season.slice(1)} Skincare Tips
        </h2>
        <div class="section-divider"></div>
        <p class="text-gray-500 mb-8">Adapt your routine to the season</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-${seasonal.tips.length > 3 ? 2 : seasonal.tips.length} gap-4">
        ${seasonal.tips.map(tip => `
          <div class="glass-card p-5 flex items-start gap-4">
            <span class="text-3xl">${tip.icon}</span>
            <div>
              <h4 class="font-bold text-sakura-700 mb-1" style="font-family:var(--font-heading)">${tip.title}</h4>
              <p class="text-sm text-gray-500">${tip.tip}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(tipSection);
  } catch(e) { /* skip */ }
}

/* ─── Hero Slider Controller ──────────────────────────────── */
function initHeroSlider(hero) {
  const slides = hero.querySelectorAll('.hero-slide');
  const dots = hero.querySelectorAll('.hero-dot');
  const prevBtn = hero.querySelector('.hero-arrow--prev');
  const nextBtn = hero.querySelector('.hero-arrow--next');
  const progressBar = hero.querySelector('#hero-progress');
  let current = 0;
  let autoplayTimer = null;
  let progressTimer = null;
  const INTERVAL = 6000; // 6 seconds per slide
  const PROGRESS_STEP = 50; // update progress every 50ms

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function resetProgress() {
    let elapsed = 0;
    if (progressTimer) clearInterval(progressTimer);
    progressBar.style.width = '0%';
    progressTimer = setInterval(() => {
      elapsed += PROGRESS_STEP;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      progressBar.style.width = pct + '%';
    }, PROGRESS_STEP);
  }

  function startAutoplay() {
    stopAutoplay();
    resetProgress();
    autoplayTimer = setInterval(next, INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    if (progressTimer) clearInterval(progressTimer);
  }

  // Events
  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.dot));
      startAutoplay();
    });
  });

  // Pause on hover
  hero.addEventListener('mouseenter', stopAutoplay);
  hero.addEventListener('mouseleave', startAutoplay);

  // Touch swipe support
  let touchStartX = 0;
  hero.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
    startAutoplay();
  }, { passive: true });

  startAutoplay();
}

/* ─── Testimonial Carousel Controller ─────────────────────── */
function initTestimonialCarousel(section) {
  const track = section.querySelector('#testimonial-track');
  const dots = section.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  const total = dots.length;

  function goToSlide(idx) {
    currentSlide = (idx + total) % total;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.tdot)));
  });

  // Auto-advance testimonials every 5 seconds
  setInterval(() => goToSlide(currentSlide + 1), 5000);
}
