/**
 * PRGI Services - Interactive Client Application
 * Features: Scroll restoration reset, smooth anchor scrolling, scroll progress bar,
 * intersection observer reveals, mobile drawer management, and dynamic header shrink.
 */

// 1. IMMEDIATE SCROLL RESET ON PAGE LOAD / RELOAD
// Prevents browsers from auto-scrolling smoothly from bottom to top upon reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  // Ensure we are strictly at the top when starting
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  initSmoothAnchorScroll();
  initScrollProgressBar();
  initStickyHeader();
  initScrollObserver();
  initMobileNav();
  initActiveNavTracking();
});

/**
 * 2. CONTROLLED SMOOTH ANCHOR SCROLLING
 * Ensures clicking in-page navigation links scrolls smoothly, without affecting initial page reload
 */
function initSmoothAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/**
 * 3. SCROLL PROGRESS INDICATOR (Fallbacks per Modern Web Guidance)
 */
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  // Check if browser natively supports scroll-driven animation timeline
  const supportsScrollTimeline = window.CSS && CSS.supports && (
    CSS.supports('animation-timeline: scroll()') || 
    CSS.supports('(animation-timeline: scroll())')
  );

  if (!supportsScrollTimeline) {
    let ticking = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollable > 0 ? (scrolled / scrollable) : 0;
      progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    
    updateProgress();
  }
}

/**
 * 4. STICKY HEADER SHRINK ON SCROLL
 */
function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 5. INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
 */
function initScrollObserver() {
  // If user prefers reduced motion, skip animations
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-fade').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-fade').forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * 6. MOBILE NAVIGATION DRAWER
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const overlay = document.getElementById('drawerOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu || !overlay) return;

  function toggleMenu(open) {
    const shouldOpen = open !== undefined ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', shouldOpen);
    toggleBtn.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('active', shouldOpen);
    toggleBtn.setAttribute('aria-expanded', shouldOpen);
    overlay.setAttribute('aria-hidden', !shouldOpen);
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  const closeBtn = document.getElementById('drawerClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleMenu(false));
  }

  toggleBtn.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        toggleMenu(false);
      }
    });
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 7. ACTIVE NAV LINK TRACKING
 */
function initActiveNavTracking() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}
