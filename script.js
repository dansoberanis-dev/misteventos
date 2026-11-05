const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('open', open);
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.hidden = category !== 'todos' && item.dataset.category !== category;
  });
}));
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxCount = lightbox.querySelector('.lightbox-count');
const lightboxPause = lightbox.querySelector('.lightbox-pause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let visibleImages = [];
let currentImage = 0;
let galleryTimer = null;
let galleryPlaying = false;

function atualizarControleGaleria() {
  lightboxPause.textContent = galleryPlaying ? '❚❚' : '▶';
  lightboxPause.setAttribute('aria-label', galleryPlaying ? 'Pausar apresentação' : 'Reproduzir apresentação');
  lightboxPause.title = galleryPlaying ? 'Pausar apresentação' : 'Reproduzir apresentação';
  lightboxPause.hidden = visibleImages.length < 2;
  lightbox.querySelectorAll('.lightbox-arrow').forEach(button => { button.hidden = visibleImages.length < 2; });
}

function agendarGaleria() {
  clearTimeout(galleryTimer);
  galleryTimer = null;
  if (lightbox.open && galleryPlaying && visibleImages.length > 1 && !document.hidden) {
    galleryTimer = setTimeout(() => mudarImagem(1), 3000);
  }
}

function exibirImagem() {
  const item = visibleImages[currentImage];
  if (!item) return;
  const source = item.querySelector('img');
  lightboxImage.src = source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = item.dataset.caption;
  lightboxCount.textContent = `${currentImage + 1} / ${visibleImages.length}`;
  atualizarControleGaleria();
  agendarGaleria();
}

function mudarImagem(direction) {
  if (!visibleImages.length) return;
  currentImage = (currentImage + direction + visibleImages.length) % visibleImages.length;
  exibirImagem();
}

document.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', () => {
  visibleImages = Array.from(document.querySelectorAll('.gallery-item:not([hidden])'));
  currentImage = visibleImages.indexOf(item);
  galleryPlaying = !reducedMotion.matches;
  lightbox.showModal();
  exibirImagem();
}));
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => mudarImagem(-1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => mudarImagem(1));
lightboxPause.addEventListener('click', () => {
  galleryPlaying = !galleryPlaying;
  atualizarControleGaleria();
  agendarGaleria();
});
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => { clearTimeout(galleryTimer); galleryTimer = null; });
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); mudarImagem(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); mudarImagem(1); }
});
document.addEventListener('visibilitychange', agendarGaleria);
let touchStartX = null;
lightbox.querySelector('.lightbox-stage').addEventListener('touchstart', event => {
  if (event.touches.length === 1) touchStartX = event.touches[0].clientX;
}, { passive: true });
lightbox.querySelector('.lightbox-stage').addEventListener('touchend', event => {
  if (touchStartX === null || !event.changedTouches.length) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) >= 45) mudarImagem(distance < 0 ? 1 : -1);
}, { passive: true });

document.querySelector('#proposal').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const date = data.get('data');
  const formattedDate = date ? date.split('-').reverse().join('/') : 'A definir';
  const text = [
    'Olá! Gostaria de solicitar uma proposta para um evento no Mist.',
    '',
    `Nome: ${data.get('nome')}`,
    `WhatsApp: ${data.get('telefone') || 'Não informado'}`,
    `Tipo de evento: ${data.get('evento')}`,
    `Data desejada: ${formattedDate}`,
    `Número de convidados: ${data.get('convidados') || 'A definir'}`,
    `Mensagem: ${data.get('mensagem') || 'Não informada'}`
  ].join('\n');
  // Número reproduzido da captura do site original; confirmar com o estabelecimento.
  window.open(`https://wa.me/5541988265923?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
});

// As animações são opcionais: sem JavaScript ou com movimento reduzido, os cards seguem visíveis.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.event-grid, .structure-grid, .testimonial-grid').forEach(group => {
    const cards = Array.from(group.children);
    cards.forEach((card, index) => {
      const position = index % 4;
      const fromLeft = position < 2;
      card.style.setProperty('--reveal-x', fromLeft ? '-55px' : '55px');
      card.style.setProperty('--reveal-delay', (position === 1 || position === 2 ? 100 : 0) + 'ms');
      card.classList.add('reveal-card');
      observer.observe(card);
    });
  });
}


// Mobile usa arquivo menor. No desktop, preservamos a versão original.
const heroVideo = document.querySelector('[data-hero-video]');
if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const source = heroVideo.querySelector('source');
  if (source && window.matchMedia('(min-width: 769px)').matches) {
    source.src = 'assets/hero-video.mp4';
  }
  heroVideo.defaultMuted = true;
  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.preload = 'auto';
  heroVideo.load();
  const iniciarVideo = () => {
    const tentativa = heroVideo.play();
    if (tentativa && typeof tentativa.catch === 'function') {
      tentativa.catch(() => { /* A imagem de fundo permanece se a reprodução for bloqueada. */ });
    }
  };
  iniciarVideo();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVideo.paused) iniciarVideo();
  });
  document.addEventListener('pointerdown', () => {
    if (heroVideo.paused) iniciarVideo();
  }, { once: true });
}
