/**
 * Sparkly Marketing Site — Interactions
 *
 * - Scroll-triggered reveal animations
 * - Sticky nav background on scroll
 * - Impact number count-up animation
 * - Live clock in browser mockup
 */

(function () {
  'use strict';

  // ── Scroll Reveal ──

  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ── Nav Scroll Effect ──

  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Smooth Scroll for Anchor Links ──

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  // ── Impact Number Count-Up ──

  const countElements = document.querySelectorAll('.impact-number[data-count]');

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  countElements.forEach((el) => countObserver.observe(el));

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (target === 0) {
      // Special case for "$0"
      el.textContent = '$0';
      return;
    }

    const duration = 1800;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);

      el.textContent = current + (target > 20 ? '+' : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Live Clock in Browser Mockup ──

  const mockTime = document.getElementById('mock-time');

  function updateMockClock() {
    if (!mockTime) return;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    mockTime.textContent = `${hours}:${minutes}`;
  }

  updateMockClock();
  setInterval(updateMockClock, 30000);

  // ── Parallax Orbs on Mouse Move ──

  const orbs = document.querySelectorAll('.orb');

  let mouseX = 0;
  let mouseY = 0;
  let orbX = 0;
  let orbY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animateOrbs() {
    orbX += (mouseX - orbX) * 0.02;
    orbY += (mouseY - orbY) * 0.02;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 8;
      const x = orbX * depth;
      const y = orbY * depth;
      orb.style.transform = `translate(${x}px, ${y}px)`;
    });

    requestAnimationFrame(animateOrbs);
  }

  // Only enable parallax on non-touch devices
  if (!('ontouchstart' in window)) {
    animateOrbs();
  }
})();
