// As informações permanecem visíveis se o navegador não oferecer animações.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -15px 0px' });
  document.documentElement.classList.add('animations-ready');
  items.forEach(item => observer.observe(item));
}
