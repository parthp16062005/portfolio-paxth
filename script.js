// ── LOADER ──
document.body.style.overflow = 'hidden';

const hideLoader = () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.classList.add('hide');
  document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(hideLoader, 1200);
});

// force restore scroll in all cases
setTimeout(() => {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}, 2000);
window.addEventListener('load', () => {
  scramble();
});

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// ── CUSTOM CURSOR ──
if (window.innerWidth > 768) {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .gallery-item, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform   = 'translate(-50%, -50%) scale(2)';
      ring.style.borderColor = 'rgba(201,169,110,0.8)';
      dot.style.opacity      = '0';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform   = 'translate(-50%, -50%) scale(1)';
      ring.style.borderColor = 'rgba(201,169,110,0.5)';
      dot.style.opacity      = '1';
    });
  });
}

// ── CURSOR GLOW ──
if (window.innerWidth > 768) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 350px; height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9;
    transform: translate(-50%, -50%);
    transition: left 0.2s ease, top 0.2s ease;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── SCROLL REVEAL ──
const revealTargets = document.querySelectorAll(
  '.about-grid, .work-header, .gallery-grid, ' +
  '.service-card, .films-drive, .caption-widget, .chat-widget, ' +
  '.contact-header, .contact-grid, .footer-inner'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => revealObserver.observe(el));

// ── ACTIVE NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 220) {
      current = section.getAttribute('id');
    }
  });
  navItems.forEach(link => {
    link.style.color   = '';
    link.style.opacity = '0.5';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color   = '#c9a96e';
      link.style.opacity = '1';
    }
  });
});

// ── FILM GRAIN ──
const canvas = document.createElement('canvas');
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9997;
  opacity: 0.028;
  mix-blend-mode: overlay;
`;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resizeGrain() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeGrain();
window.addEventListener('resize', resizeGrain);

function drawGrain() {
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.random() * 255;
    data[i] = val; data[i+1] = val; data[i+2] = val; data[i+3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(drawGrain);
}
drawGrain();

// ── GALLERY FILTER ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.classList.toggle('hidden', filter !== 'all' && !item.classList.contains(filter));
    });
  });
});

// ── VIDEO HOVER PREVIEW ──
document.querySelectorAll('.gallery-item.video').forEach(item => {
  const vid = item.querySelector('video');
  vid.playbackRate = 0.5;
  item.addEventListener('mouseenter', () => { vid.playbackRate = 0.5; vid.play(); });
  item.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
});

// ── LIGHTBOX ──
function openLightbox(src, type) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const vid = document.getElementById('lightbox-vid');
  if (type === 'photo') {
    img.src = src;
    img.style.display = 'block';
    vid.style.display = 'none';
    vid.pause();
  } else {
    vid.src = src;
    vid.style.display = 'block';
    img.style.display = 'none';
    vid.playbackRate = 0.5;
    vid.play();
  }
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const vid = document.getElementById('lightbox-vid');
  vid.pause(); vid.src = '';
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── DATA-SCROLL SECTIONS ──
const scrollObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('[data-scroll]').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(20px)';
  el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
  scrollObs.observe(el);
});

// ── HERO TEXT SCRAMBLE ──
const chars     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&!?.';
const finalText = 'paxth.jpg';

function scramble() {
  const scrambleEl = document.querySelector('.hero-title');
  if (!scrambleEl) return;

  let iterations = 0;
  const total = finalText.length * 6;

  const interval = setInterval(() => {
    scrambleEl.innerHTML = finalText
      .split('')
      .map((char, i) => {
        if (iterations > i * 6) {
          return char === '.' ? '<em>.</em>' : char;
        }
        return `<span style="color:var(--amber);opacity:0.5">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
      })
      .join('');

    if (iterations >= total) {
      clearInterval(interval);
      scrambleEl.innerHTML = 'paxth<em>.jpg</em>';
    }
    iterations++;
  }, 40);
}

// ── AMBIENT AUDIO ──
const audio       = document.getElementById('ambient-audio');
const audioToggle = document.getElementById('audio-toggle');
const audioIcon   = document.getElementById('audio-icon');
let audioStarted  = false;

if (audio) audio.volume = 0.50;

if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    if (!audioStarted) {
      audio.play();
      audioStarted = true;
      audioIcon.classList.remove('paused');
    } else if (audio.paused) {
      audio.play();
      audioIcon.classList.remove('paused');
    } else {
      audio.pause();
      audioIcon.classList.add('paused');
    }
  });
}
