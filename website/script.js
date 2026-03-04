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

    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const ord = (d) => d + (['st','nd','rd'][((d+90)%100-10)%10-1] || 'th');
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();

    const mockDate = document.getElementById('mock-date');
    const mockDate2 = document.getElementById('mock-date-2');
    if (mockDate) mockDate.textContent = `${day}, ${month} ${ord(date)}`;
    if (mockDate2) mockDate2.textContent = `${day.toUpperCase()}, ${month.toUpperCase()} ${ord(date).toUpperCase()}`;
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

  // ── Feature Carousel ──

  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-wrapper .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentSlide = 0;
    let autoPlayInterval;

    function showSlide(index) {
      slides.forEach((slide) => slide.classList.remove('active'));
      dots.forEach((dot) => dot.classList.remove('active'));
      
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Event listeners - use document-level selectors
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
        stopAutoPlay();
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
        stopAutoPlay();
        startAutoPlay();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        showSlide(index);
        stopAutoPlay();
        startAutoPlay();
      });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Start autoplay
    startAutoPlay();
  }

  // ── Interactive Playground ──

  const pgClock = document.getElementById('pg-clock');
  const pgWeather = document.getElementById('pg-weather');
  const pgSearch = document.getElementById('pg-search');
  const pgTiles = document.getElementById('pg-tiles');
  const pgFeed = document.getElementById('pg-feed');
  const pgApps = document.getElementById('pg-apps');
  const pgTabs = document.getElementById('pg-tabs');
  const pgWeatherSelect = document.getElementById('pg-weather-select');
  const pgWallpaperSelect = document.getElementById('pg-wallpaper-select');

  const pgClockSection = document.getElementById('pg-clock-section');
  const pgWeatherPill = document.getElementById('pg-weather-pill');
  const pgSearchBar = document.getElementById('pg-search-bar');
  const pgTilesEl = document.getElementById('pg-tiles-section');
  const pgFeedHub = document.getElementById('pg-feed-hub');
  const pgSidebar = document.getElementById('pg-sidebar');
  const pgTabManager = document.getElementById('pg-tab-manager');
  const previewMock = document.getElementById('preview-mock');

  const pgClockDisplay = document.getElementById('pg-clock');
  const pgDateDisplay = document.getElementById('pg-date');
  const pgWeatherIcon = document.getElementById('pg-weather-icon');
  const pgTemp = document.getElementById('pg-temp');

  // Widget toggles
  if (pgClock) {
    pgClock.addEventListener('change', () => {
      pgClockSection.classList.toggle('hidden', !pgClock.checked);
    });
  }

  if (pgWeather) {
    pgWeather.addEventListener('change', () => {
      pgWeatherPill.classList.toggle('hidden', !pgWeather.checked);
    });
  }

  if (pgSearch) {
    pgSearch.addEventListener('change', () => {
      pgSearchBar.classList.toggle('hidden', !pgSearch.checked);
    });
  }

  if (pgTiles) {
    pgTiles.addEventListener('change', () => {
      pgTilesEl.classList.toggle('hidden', !pgTiles.checked);
    });
  }

  if (pgFeed) {
    pgFeed.addEventListener('change', () => {
      pgFeedHub.classList.toggle('hidden', !pgFeed.checked);
    });
  }

  if (pgApps) {
    pgApps.addEventListener('change', () => {
      pgSidebar.classList.toggle('hidden', !pgApps.checked);
    });
  }

  if (pgTabs) {
    pgTabs.addEventListener('change', () => {
      pgTabManager.classList.toggle('hidden', !pgTabs.checked);
    });
  }

// Weather condition selector
  if (pgWeatherSelect) {
    pgWeatherSelect.addEventListener('change', (e) => {
      const conditions = {
        sunny: { icon: '☀️', temp: '24°' },
        cloudy: { icon: '☁️', temp: '18°' },
        rainy: { icon: '🌧️', temp: '14°' },
        snowy: { icon: '❄️', temp: '-2°' },
        night: { icon: '🌙', temp: '16°' }
      };
      const cond = conditions[e.target.value];
      if (pgWeatherIcon) pgWeatherIcon.textContent = cond.icon;
      if (pgTemp) pgTemp.textContent = cond.temp;
    });
  }

  // Wallpaper selector
  if (pgWallpaperSelect) {
    pgWallpaperSelect.addEventListener('change', (e) => {
      if (previewMock) {
        previewMock.className = 'preview-mock ' + e.target.value;
      }
    });
  }

  // Real-time clock
  function updateClock() {
    if (!pgClockDisplay || !pgDateDisplay) return;
    
    const now = new Date();
    const hours = (now.getHours() % 12 || 12).toString();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    pgClockDisplay.textContent = `${hours}:${minutes}`;
    
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    pgDateDisplay.textContent = `${day}, ${month} ${date}${getOrdinal(date)}`;
  }

  function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  updateClock();
  setInterval(updateClock, 1000);
})();
