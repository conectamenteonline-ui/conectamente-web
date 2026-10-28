// Cookie banner + carga de rastreadores solo con consentimiento
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');
const CONSENT_KEY = 'conectamente_cookie_consent';

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
}
function saveConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
}

let trackingLoaded = false;
function loadTracking() {
  if (trackingLoaded) return;
  trackingLoaded = true;

  // Google Analytics
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-YH4KBCB0N4';
  document.head.appendChild(gaScript);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-YH4KBCB0N4');

  // Meta Pixel
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1053534450805873');
  fbq('track', 'PageView');
}

function dismissCookieBanner() {
  cookieBanner?.classList.add('hidden');
}

const existingConsent = readConsent();
if (existingConsent === 'accepted') {
  loadTracking();
  dismissCookieBanner();
} else if (existingConsent === 'rejected') {
  dismissCookieBanner();
}

cookieAccept?.addEventListener('click', () => {
  saveConsent('accepted');
  loadTracking();
  dismissCookieBanner();
});
cookieReject?.addEventListener('click', () => {
  saveConsent('rejected');
  dismissCookieBanner();
});

// Mobile nav toggle
const siteHeader = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');

navToggle?.addEventListener('click', () => {
  const isOpen = siteHeader.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a, .header-actions a').forEach(link => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// FAQ accordion
document.querySelectorAll('.accordion-item').forEach(item => {
  const trigger = item.querySelector('.accordion-trigger');
  trigger.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Scroll reveal animations
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

// Hero image carousel
const heroCarousel = document.getElementById('heroCarousel');
if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll('.hero-bg-image');
  let currentSlide = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[currentSlide].classList.remove('is-active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('is-active');
    }, 5000);
  }
}

// Contact form — submits to Netlify Forms
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

function encodeFormData(form) {
  return new URLSearchParams(new FormData(form)).toString();
}

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  formNote.textContent = 'Enviando...';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encodeFormData(contactForm)
  })
    .then(() => {
      formNote.textContent = 'Gracias por escribirnos. Nos pondremos en contacto pronto.';
      contactForm.reset();
      if (typeof fbq === 'function') fbq('track', 'Lead');
    })
    .catch(() => {
      formNote.textContent = 'Hubo un problema al enviar. Escríbenos directo a conectamente.online@gmail.com.';
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});

// Meta Pixel — track WhatsApp click-outs as a Contact conversion
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof fbq === 'function') fbq('track', 'Contact');
  });
});
