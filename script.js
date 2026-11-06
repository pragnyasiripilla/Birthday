
/* Little Things, Big Love — Birthday Scrapbook Interactions */

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const picker = document.getElementById('photoPicker');

  let selectedImage = null;
  let toastTimer = null;

  // Show toast messages
  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Flip memory cards
  function toggleCard(card) {
    if (!card) return;

    card.classList.toggle('flipped');

    card.setAttribute(
      'aria-pressed',
      String(card.classList.contains('flipped'))
    );
  }

  // Prevent clicks on photo replacement buttons from flipping cards
  document.addEventListener('click', (event) => {
    const changeButton = event.target.closest('.change-photo');

    if (changeButton) {
      event.stopPropagation();
      return;
    }

    const card = event.target.closest('.memory-flip-card');

    if (card) {
      toggleCard(card);
    }
  });

  // Keyboard accessibility for memory cards
  document.addEventListener('keydown', (event) => {
    const card = event.target.closest('.memory-flip-card');

    if (!card) return;

    // Avoid interfering with buttons and other interactive elements
    if (event.target.closest('button, input, a, select, textarea')) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCard(card);
    }
  });

  // Restore saved photo replacements
  function restorePhotos() {
    document
      .querySelectorAll('.gallery-item .memory-front img')
      .forEach((image) => {
        const originalSource =
          image.dataset.photo || image.getAttribute('src');

        if (!originalSource) return;

        const key = 'birthday-scrapbook:' + originalSource;

        try {
          const savedPhoto = localStorage.getItem(key);

          if (savedPhoto) {
            image.src = savedPhoto;
          }
        } catch (error) {
          console.warn('Could not restore saved photo:', error);
        }
      });
  }

  // Add photo replacement buttons
  function setupPhotoReplacement() {
    if (!picker) return;

    document.querySelectorAll('.gallery-item').forEach((item) => {
      const image = item.querySelector('.memory-front img');
      const caption = item.querySelector('figcaption');

      if (!image || !caption) return;

      if (caption.querySelector('.change-photo')) return;

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'change-photo';
      button.textContent = 'Change Photo';
      button.setAttribute('aria-label', 'Change this memory photo');

      button.addEventListener('click', (event) => {
        event.stopPropagation();

        selectedImage = image;
        picker.click();
      });

      caption.appendChild(button);
    });

    // Handle selected image
    picker.addEventListener('change', () => {
      const file = picker.files && picker.files[0];

      if (!file || !selectedImage) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.');
        picker.value = '';
        selectedImage = null;
        return;
      }

      // Limit image size to 10 MB
      if (file.size > 10 * 1024 * 1024) {
        showToast('Please select an image smaller than 10 MB.');
        picker.value = '';
        selectedImage = null;
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (!selectedImage) return;

        const image = selectedImage;
        const originalSource =
          image.dataset.photo || image.getAttribute('src');

        image.src = reader.result;

        try {
          const key = 'birthday-scrapbook:' + originalSource;

          localStorage.setItem(key, reader.result);

          showToast('Your photo has been replaced ♡');
        } catch (error) {
          showToast(
            'Photo changed for this visit. Storage limit reached.'
          );
        }

        picker.value = '';
        selectedImage = null;
      };

      reader.onerror = () => {
        showToast('Unable to load this photo. Please try again.');

        picker.value = '';
        selectedImage = null;
      };

      reader.readAsDataURL(file);
    });

    restorePhotos();
  }

  setupPhotoReplacement();

  // Handle missing Dudu/Bubu GIFs
  document.querySelectorAll('.bear-animation img').forEach((bear, index) => {
    bear.addEventListener(
      'error',
      () => {
        const sticker = document.createElement('span');

        sticker.className = 'bear-sticker';
        sticker.textContent = index % 2 === 0 ? '🐻‍❄️' : '🐻';

        sticker.setAttribute('aria-hidden', 'true');

        bear.replaceWith(sticker);
      },
      { once: true }
    );
  });

  // Birthday decorations
  let decor = document.getElementById('birthday-decor');

  if (!decor) {
    decor = document.createElement('div');

    decor.id = 'birthday-decor';
    decor.setAttribute('aria-hidden', 'true');

    document.body.appendChild(decor);
  }

  const particles = [
    '♡',
    '♥',
    '✨',
    '🌸',
    '🎀',
    '🧸',
    '💕'
  ];

  const reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion) {
    function spawnParticle() {
      if (document.hidden) return;

      // Prevent too many particles from appearing
      if (decor.childElementCount >= 24) return;

      const particle = document.createElement('span');

      particle.className = 'birthday-particle';

      particle.textContent =
        particles[Math.floor(Math.random() * particles.length)];

      particle.style.left = Math.random() * 100 + 'vw';

      particle.style.setProperty(
        '--drift',
        Math.random() * 100 - 50 + 'px'
      );

      particle.style.setProperty(
        '--duration',
        8 + Math.random() * 7 + 's'
      );

      particle.style.fontSize =
        13 + Math.random() * 16 + 'px';

      decor.appendChild(particle);

      particle.addEventListener(
        'animationend',
        () => particle.remove(),
        { once: true }
      );
    }

    // Initial floating decorations
    for (let i = 0; i < 10; i++) {
      setTimeout(spawnParticle, i * 450);
    }

    // Continuous floating decorations
    setInterval(spawnParticle, 950);
  }

  // Birthday heart button
  const heartButton = document.getElementById('heartBtn');

  if (heartButton) {
    heartButton.addEventListener('click', () => {
      showToast(
        'A birthday wish, wrapped in a little heart. Happy Birthday, my love! ♥'
      );
    });
  }

  // Navigation highlighting
  const navLinks = [
    ...document.querySelectorAll('.nav-link')
  ];

  const pages = document.querySelectorAll('main .page');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isActive =
              link.getAttribute('href') ===
              '#' + entry.target.id;

            link.classList.toggle('active', isActive);
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px'
      }
    );

    pages.forEach((section) => {
      observer.observe(section);
    });
  }

  // Prevent broken local image paths from going unnoticed
  document.querySelectorAll('img').forEach((image) => {
    image.addEventListener('error', () => {
      console.warn(
        'Image failed to load:',
        image.getAttribute('src')
      );
    });
  });

});
