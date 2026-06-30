/* ─── Sakura Petals & Botanical Leaves Animation ─────────── */

export function createPetals() {
  const existing = document.querySelectorAll('.petal');
  existing.forEach(p => p.remove());

  const count = window.innerWidth < 768 ? 7 : 15;
  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = 10 + Math.random() * 16;
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = 8 + Math.random() * 10;
    // Alternate between sakura pink and botanical green
    const isLeaf = i % 3 === 0;
    const gradient = isLeaf
      ? 'radial-gradient(ellipse at 30% 30%, #bbf7d0, #86efac)'
      : 'radial-gradient(ellipse at 30% 30%, #fcc5dd, #f9a8d4)';
    const borderRadius = isLeaf
      ? '40% 60% 60% 40%'
      : '50% 0 50% 50%';
    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${gradient};
      border-radius: ${borderRadius};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      opacity: 0;
    `;
    document.body.appendChild(petal);
  }
}
