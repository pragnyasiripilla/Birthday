/* Little Things, Big Love — birthday scrapbook interactions */
document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const picker = document.getElementById('photoPicker');
  let selectedImage = null;
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // One delegated handler only: prevents the old double-toggle bug.
  document.addEventListener('click', (event) => {
    const card = event.target.closest('.memory-flip-card');
    if (!card) return;
    if (event.target.closest('.change-photo')) return;
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
  });

  document.addEventListener('keydown', (event) => {
    const card = event.target.closest('.memory-flip-card');
    if (!card || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
  });

  // Make each memory photo replaceable without editing HTML.
  if (picker) {
    document.querySelectorAll('.gallery-item').forEach((item) => {
      const image = item.querySelector('.memory-front img');
      const caption = item.querySelector('figcaption');
      if (!image || !caption || caption.querySelector('.change-photo')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'change-photo';
      
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedImage = image;
        picker.click();
      });
      caption.append(button);
    });

    picker.addEventListener('change', () => {
      const file = picker.files && picker.files[0];
      if (!file || !selectedImage) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        selectedImage.src = reader.result;
        // Store per-photo replacements in this browser.
        try {
          const key = 'birthday-scrapbook:' + (selectedImage.dataset.photo || selectedImage.getAttribute('src'));
          localStorage.setItem(key, reader.result);
          showToast('Your photo has been replaced ♡');
        } catch (error) {
          showToast('Photo changed for this visit. The image may be too large to save permanently.');
        }
        picker.value = '';
        selectedImage = null;
      };
      reader.readAsDataURL(file);
    });

    document.querySelectorAll('.gallery-item .memory-front img').forEach((image) => {
      const key = 'birthday-scrapbook:' + (image.dataset.photo || image.getAttribute('src'));
      try {
        const saved = localStorage.getItem(key);
        if (saved) image.src = saved;
      } catch (_) { /* Storage may be unavailable in private browsing. */ }
    });
  }

  // If optional Dudu/Bubu GIF files are not in the images folder, show cute bear stickers instead of broken-image icons.
  document.querySelectorAll('.bear-animation img').forEach((bear, index) => {
    bear.addEventListener('error', () => {
      const sticker = document.createElement('span');
      sticker.className = 'bear-sticker';
      sticker.textContent = index % 2 === 0 ? '🐻‍❄️' : '🐻';
      bear.replaceWith(sticker);
    }, { once: true });
  });

  // Birthday sparkle, floating hearts and tiny teddy-bear decorations.
  let decor = document.getElementById('birthday-decor');
  if (!decor) {
    decor = document.createElement('div');
    decor.id = 'birthday-decor';
    decor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(decor);
  }
  const particles = ['♡', '♥', '✨', '🌸', '🎀', '🧸', '💕'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    const spawn = () => {
      if (document.hidden || decor.childElementCount > 24) return;
      const particle = document.createElement('span');
      particle.className = 'birthday-particle';
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
      particle.style.setProperty('--duration', (8 + Math.random() * 7) + 's');
      particle.style.fontSize = (13 + Math.random() * 16) + 'px';
      decor.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove(), { once: true });
    };
    for (let i = 0; i < 10; i++) setTimeout(spawn, i * 450);
    setInterval(spawn, 950);
  }

  const heartButton = document.getElementById('heartBtn');
  if (heartButton) heartButton.addEventListener('click', () => showToast('A birthday wish, wrapped in a little heart. Happy Birthday, my love! ♥'));

  // Keep navigation highlighting simple and independent of card clicks.
  const navLinks = [...document.querySelectorAll('.nav-link')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    document.querySelectorAll('main .page').forEach((section) => observer.observe(section));
  }
});
