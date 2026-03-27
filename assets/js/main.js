/**
 * Blue Ocean Strategy Case Study - Main JavaScript
 * Vanilla JS, no frameworks. Production-ready.
 */

// ─── SideNavigation ─────────────────────────────────────────────────────────
// Tracks which act (section) is currently in view and syncs the side nav dots
// and the vertical fill indicator.

class SideNavigation {
  constructor() {
    this.nav = document.querySelector('.case-nav');
    this.dots = document.querySelectorAll('.case-nav-dot');
    this.fill = document.querySelector('.case-nav-fill');
    this.sections = document.querySelectorAll('section.case-act');

    if (!this.nav || this.dots.length === 0 || !this.fill || this.sections.length === 0) {
      return; // nothing to initialise
    }

    this.activeIndex = 0;

    // Intersection observer for automatic tracking
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(this.sections).indexOf(entry.target);
            if (index !== -1) {
              this.setActive(index);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    this.sections.forEach((section) => this.observer.observe(section));

    // Click handlers on dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        const target = this.sections[index];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      // Tooltip show/hide on hover
      dot.addEventListener('mouseenter', () => {
        const label = dot.querySelector('.case-nav-label');
        if (label) label.classList.add('visible');
      });
      dot.addEventListener('mouseleave', () => {
        const label = dot.querySelector('.case-nav-label');
        if (label) label.classList.remove('visible');
      });
    });

    // Responsive: switch to bottom nav on narrow viewports
    this.handleResize = this.handleResize.bind(this);
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    this.activeIndex = index;

    // Toggle .active on dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    // Update fill height
    const totalActs = this.sections.length;
    const pct = totalActs > 1 ? (index / (totalActs - 1)) * 100 : 0;
    this.fill.style.height = pct + '%';
  }

  handleResize() {
    if (window.innerWidth < 768) {
      this.nav.classList.add('case-nav--bottom');
    } else {
      this.nav.classList.remove('case-nav--bottom');
    }
  }
}

// ─── ReadingProgress ────────────────────────────────────────────────────────
// Thin progress bar at the top of the page showing overall scroll position.

class ReadingProgress {
  constructor() {
    this.fill = document.querySelector('.case-progress-fill');
    if (!this.fill) return;

    this.ticking = false;

    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.fill.style.width = pct + '%';
      this.ticking = false;
    });
  }
}

// ─── AnimatedCounter ────────────────────────────────────────────────────────
// Animates numbers from 0 to their target when they scroll into view.

class AnimatedCounter {
  constructor() {
    this.elements = document.querySelectorAll('[data-count]');
    if (this.elements.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animate(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.elements.forEach((el) => this.observer.observe(el));
  }

  /**
   * easeOutExpo easing function
   * @param {number} t - progress 0..1
   * @returns {number}
   */
  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * Run the count-up animation on a single element.
   * @param {HTMLElement} el
   */
  animate(el) {
    const target = parseFloat(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 2000; // ms
    const isFloat = String(target).includes('.');
    const decimalPlaces = isFloat ? (String(target).split('.')[1] || '').length : 0;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = this.easeOutExpo(progress);
      const current = target * easedProgress;

      if (isFloat) {
        el.textContent = prefix + current.toFixed(decimalPlaces) + suffix;
      } else {
        el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Ensure final value is exact
        if (isFloat) {
          el.textContent = prefix + target.toFixed(decimalPlaces) + suffix;
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      }
    };

    requestAnimationFrame(step);
  }
}

// ─── StrategyCanvasAnimator ─────────────────────────────────────────────────
// Adds an .animate class to the strategy canvas chart when it becomes visible,
// which triggers CSS transitions on all bars.

class StrategyCanvasAnimator {
  constructor() {
    this.chart = document.querySelector('.canvas-chart');
    if (!this.chart) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.chart.classList.add('animate');
            this.observer.unobserve(this.chart);
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.chart);
  }
}

// ─── SectionRevealer ────────────────────────────────────────────────────────
// Fades in sections as they scroll into view. Supports a data-delay attribute
// for staggered reveal timing.

class SectionRevealer {
  constructor() {
    this.elements = document.querySelectorAll('.case-reveal');
    if (this.elements.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay;
            if (delay) {
              el.style.transitionDelay = delay + 'ms';
            }
            el.classList.add('case-reveal--visible');
            this.observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    this.elements.forEach((el) => this.observer.observe(el));
  }
}

// ─── HorizontalTimeline ─────────────────────────────────────────────────────
// Fills the horizontal timeline bar as the user scrolls and activates milestones
// when the fill reaches them.

class HorizontalTimeline {
  constructor() {
    this.timeline = document.querySelector('.case-timeline');
    if (!this.timeline) return;

    this.fill = this.timeline.querySelector('.case-timeline-fill');
    this.milestones = this.timeline.querySelectorAll('.case-timeline-milestone');

    if (!this.fill || this.milestones.length === 0) return;

    this.ticking = false;
    this.visibleMilestones = new Set();

    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    // Run once on init in case the timeline is already in view
    this.onScroll();
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  }

  update() {
    const rect = this.timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate how far through the timeline we have scrolled.
    // When the top of the timeline reaches the center of the viewport, fill = 0%.
    // When the bottom of the timeline reaches the center, fill = 100%.
    const timelineTop = rect.top;
    const timelineHeight = rect.height;
    const viewportCenter = windowHeight * 0.5;

    // Raw progress: how far the viewport center is past the timeline top
    const rawProgress = (viewportCenter - timelineTop) / timelineHeight;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));
    const pct = clampedProgress * 100;

    this.fill.style.width = pct + '%';

    // Activate milestones whose position falls within the current fill
    this.milestones.forEach((milestone) => {
      if (this.visibleMilestones.has(milestone)) return;

      const milestoneRect = milestone.getBoundingClientRect();
      const timelineLeft = rect.left;
      const milestoneLeft = milestoneRect.left - timelineLeft;
      const timelineWidth = rect.width;
      const milestonePct = timelineWidth > 0 ? (milestoneLeft / timelineWidth) * 100 : 0;

      if (pct >= milestonePct) {
        milestone.classList.add('case-tl-milestone--visible');
        this.visibleMilestones.add(milestone);
      }
    });
  }
}

// ─── GoldenQuoteReveal ──────────────────────────────────────────────────────
// Fades in golden quote blocks when they enter the viewport.

class GoldenQuoteReveal {
  constructor() {
    this.quotes = document.querySelectorAll('.case-golden-quote');
    if (this.quotes.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('case-golden-quote--visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    this.quotes.forEach((el) => this.observer.observe(el));
  }
}

// ─── SmoothScroll ───────────────────────────────────────────────────────────
// Intercepts anchor links (#...) and scrolls to their target smoothly.

class SmoothScroll {
  constructor() {
    this.links = document.querySelectorAll('a[href^="#"]');
    if (this.links.length === 0) return;

    this.links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}

// ─── BackToTop ──────────────────────────────────────────────────────────────
// Shows a floating button after scrolling down; scrolls to top on click.

class BackToTop {
  constructor() {
    this.button = document.querySelector('.case-back-top');
    if (!this.button) return;

    this.ticking = false;
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });

    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Check initial state
    this.onScroll();
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 600) {
        this.button.classList.add('case-back-top--visible');
      } else {
        this.button.classList.remove('case-back-top--visible');
      }
      this.ticking = false;
    });
  }
}

// ─── Language Toggle ──────────────────────────────────────────────────────

class LanguageToggle {
  constructor() {
    this.btnZh = document.querySelector('.case-lang-btn[data-lang="zh"]');
    this.btnEn = document.querySelector('.case-lang-btn[data-lang="en"]');
    if (!this.btnZh || !this.btnEn) return;

    // Restore saved preference
    const saved = localStorage.getItem('case-lang') || 'zh';
    this.apply(saved);

    this.btnZh.addEventListener('click', () => this.apply('zh'));
    this.btnEn.addEventListener('click', () => this.apply('en'));
  }

  apply(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    this.btnZh.classList.toggle('active', lang === 'zh');
    this.btnEn.classList.toggle('active', lang === 'en');
    localStorage.setItem('case-lang', lang);
  }
}

// ─── Initialization ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new SideNavigation();
  new ReadingProgress();
  new AnimatedCounter();
  new StrategyCanvasAnimator();
  new SectionRevealer();
  new HorizontalTimeline();
  new GoldenQuoteReveal();
  new SmoothScroll();
  new BackToTop();
  new LanguageToggle();

  // Page load fade-in (CSS handles initial opacity:0)
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });
});
