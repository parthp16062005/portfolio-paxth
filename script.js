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

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll(
  '#about .about-grid, #work h2, .gallery-grid, #services h2, .service-card, #contact .contact-inner'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// ── FILM GRAIN ──
const canvas = document.createElement('canvas');
canvas.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
`;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resizeGrain() {
  canvas.width = window.innerWidth;
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

// ── ACTIVE NAV ──
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) current = section.getAttribute('id');
  });
  navItems.forEach(link => {
    link.style.color = '';
    link.style.opacity = '0.7';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = '#c8922a';
      link.style.opacity = '1';
    }
  });
});

// ── CURSOR GLOW ──
if (window.innerWidth > 768) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,146,42,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ── GALLERY FILTER ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      if (filter === 'all' || item.classList.contains(filter)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ── VIDEO HOVER PREVIEW (slow motion 0.5x) ──
document.querySelectorAll('.gallery-item.video').forEach(item => {
  const vid = item.querySelector('video');
  vid.playbackRate = 0.5;
  item.addEventListener('mouseenter', () => {
    vid.playbackRate = 0.5;
    vid.play();
  });
  item.addEventListener('mouseleave', () => {
    vid.pause();
    vid.currentTime = 0;
  });
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
  vid.pause();
  vid.src = '';
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});