/* ============================================================
   A1 ENTERPRISE - MAIN JAVASCRIPT
   Author: A1 Enterprise Dev Team
   Description: All interactive functionality for the website
   ============================================================ */

/* ============================================================
   1. STICKY NAVBAR
   - Adds "scrolled" class when user scrolls past 50px
   - This triggers CSS to add shadow and solid background
   ============================================================ */
(function initStickyNavbar() {
  const navbar = document.getElementById('navbar');

  if (!navbar) return;

  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run on scroll
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // Run once on load in case page is already scrolled
  handleNavbarScroll();
})();


/* ============================================================
   2. MOBILE HAMBURGER MENU
   - Toggles the navigation on mobile devices
   - Closes menu when a nav link is clicked
   - Closes menu when clicking outside
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  if (!hamburger || !navMenu) return;

  // Toggle menu open/close
  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.contains('open');

    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');

    // Update aria attribute for accessibility
    hamburger.setAttribute('aria-expanded', !isOpen);
  });

  // Close menu when clicking any nav link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside navbar
  document.addEventListener('click', function (e) {
    const isClickInsideNav = navMenu.contains(e.target);
    const isClickOnHamburger = hamburger.contains(e.target);

    if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('open')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    }
  });
})();


/* ============================================================
   3. SMOOTH SCROLLING
   - Handles all anchor links that start with "#"
   - Offsets scroll by navbar height so content isn't hidden
   ============================================================ */
(function initSmoothScrolling() {
  const navbarHeight = 80; // Match CSS --navbar-height variable

  document.addEventListener('click', function (e) {
    // Find the closest anchor tag that was clicked
    const link = e.target.closest('a[href^="#"]');

    if (!link) return; // Not an anchor link, do nothing

    const targetId = link.getAttribute('href');

    // Skip if it's just "#" with no specific target
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      e.preventDefault();

      // Calculate position accounting for fixed navbar
      const elementTop = targetElement.getBoundingClientRect().top;
      const offsetTop  = elementTop + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
})();


/* ============================================================
   4. ACTIVE NAVIGATION HIGHLIGHT
   - Tracks scroll position and marks whichever section
     is currently occupying the top of the viewport
   ============================================================ */
(function initActiveNavHighlight() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav-link');
  const NAVBAR_H = 90; // px offset for fixed navbar

  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(function (link) {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
    });
  }

  function onScroll() {
    const scrollY = window.scrollY + NAVBAR_H + 10;
    let current = sections[0].id; // default to first section

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    setActive(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ============================================================
   5. SCROLL ANIMATIONS
   - Uses IntersectionObserver to add "animated" class
     to elements with "animate-on-scroll" when they enter view
   ============================================================ */
(function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        // Add a small staggered delay for multiple elements
        const delay = (entry.target.dataset.delay) || (index * 80);

        setTimeout(function () {
          entry.target.classList.add('animated');
        }, Math.min(delay, 400)); // Cap delay at 400ms

        // Stop observing once animated (animation plays once)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,          // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before it fully enters
  });

  // Apply staggered delays to sibling elements in grids
  const grids = document.querySelectorAll(
    '.services-grid, .why-grid, .industries-grid, .projects-grid, .stats-inner'
  );

  grids.forEach(function (grid) {
    const children = grid.querySelectorAll('.animate-on-scroll');
    children.forEach(function (child, i) {
      child.dataset.delay = i * 100; // 100ms stagger
    });
  });

  animatedElements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ============================================================
   6. COUNTER ANIMATION
   - Animates numeric counters when they scroll into view
   - Reads target value from data-target attribute
   - Reads suffix (e.g. "+", "%") from data-suffix attribute
   ============================================================ */
(function initCounterAnimation() {
  const counterElements = document.querySelectorAll('.counter-number');

  if (!counterElements.length) return;

  // Animate a single counter from 0 to target
  function animateCounter(element) {
    const target   = parseInt(element.dataset.target, 10) || 0;
    const suffix   = element.dataset.suffix || '';
    const duration = 2000; // 2 seconds
    const steps    = 60;   // 60 update steps
    const increment = target / steps;
    let current = 0;
    let step    = 0;

    const timer = setInterval(function () {
      step++;
      current = Math.min(Math.round(increment * step), target);
      element.textContent = current + suffix;

      if (step >= steps) {
        clearInterval(timer);
        element.textContent = target + suffix; // Ensure exact final value
      }
    }, duration / steps);
  }

  // Use IntersectionObserver so animation starts when visible
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.5 // Start when counter is fully in view
  });

  counterElements.forEach(function (counter) {
    observer.observe(counter);
  });
})();


/* ============================================================
   7. TESTIMONIAL SLIDER
   - Previous / Next buttons to cycle through testimonials
   - Dot indicators that update with current slide
   - Auto-play every 5 seconds (pauses on user interaction)
   ============================================================ */
(function initTestimonialSlider() {
  const slides    = document.querySelectorAll('.testimonial-slide');
  const dots      = document.querySelectorAll('.slider-dots .dot');
  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');

  if (!slides.length) return;

  let currentIndex  = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 5000; // 5 seconds between slides

  // Show a specific slide by index
  function showSlide(index) {
    // Wrap around if going past boundaries
    if (index < 0)            index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Hide all slides and remove active dot
    slides.forEach(function (slide) { slide.classList.remove('active'); });
    dots.forEach(function (dot)     { dot.classList.remove('active'); });

    // Show the target slide and activate its dot
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');

    currentIndex = index;
  }

  // Move to next slide
  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  // Move to previous slide
  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  // Start auto-play
  function startAutoPlay() {
    stopAutoPlay(); // Clear any existing timer first
    autoPlayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  // Stop auto-play
  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Button click handlers
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextSlide();
      stopAutoPlay(); // Pause auto-play on manual interaction
      setTimeout(startAutoPlay, 8000); // Resume after 8s
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prevSlide();
      stopAutoPlay();
      setTimeout(startAutoPlay, 8000);
    });
  }

  // Dot click handlers — jump to specific slide
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      stopAutoPlay();
      setTimeout(startAutoPlay, 8000);
    });
  });

  // Keyboard navigation for accessibility
  document.addEventListener('keydown', function (e) {
    // Only handle keys when testimonials section is in view
    const testimonialsSection = document.getElementById('testimonials');
    if (!testimonialsSection) return;

    const rect = testimonialsSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if (!isVisible) return;

    if (e.key === 'ArrowLeft')  { prevSlide(); stopAutoPlay(); }
    if (e.key === 'ArrowRight') { nextSlide(); stopAutoPlay(); }
  });

  // Start auto-play on load
  startAutoPlay();
})();


/* ============================================================
   8. CONTACT FORM VALIDATION & SUBMISSION
   - Validates all required fields
   - Shows inline error messages
   - Shows success message on valid submit
   ============================================================ */
(function initContactForm() {
  const form           = document.getElementById('contact-form');
  const successMessage = document.getElementById('success-message');

  if (!form) return;

  // Helper: show error message for a field
  function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');
  }

  // Helper: clear error message for a field
  function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  }

  // Validate email format with regex
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate form and return true if everything is valid
  function validateForm() {
    let isValid = true;

    // Get field values (trimmed)
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Clear all previous errors
    ['name', 'email', 'subject', 'message'].forEach(clearError);

    // Validate: Full Name
    if (!name) {
      showError('name', 'Please enter your full name.');
      isValid = false;
    } else if (name.length < 2) {
      showError('name', 'Name must be at least 2 characters.');
      isValid = false;
    }

    // Validate: Email
    if (!email) {
      showError('email', 'Please enter your email address.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address.');
      isValid = false;
    }

    // Validate: Subject
    if (!subject) {
      showError('subject', 'Please enter a subject.');
      isValid = false;
    }

    // Validate: Message
    if (!message) {
      showError('message', 'Please write a message.');
      isValid = false;
    } else if (message.length < 10) {
      showError('message', 'Message must be at least 10 characters.');
      isValid = false;
    }

    return isValid;
  }

  // Real-time validation: clear errors as user types
  ['name', 'email', 'subject', 'message'].forEach(function (fieldId) {
    const inputEl = document.getElementById(fieldId);
    if (inputEl) {
      inputEl.addEventListener('input', function () {
        clearError(fieldId);
      });
    }
  });

  // Form submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    if (!validateForm()) return; // Stop if form is invalid

    // Show a loading state on the submit button
    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnHTML = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Sending...
    `;

    // Simulate sending (in production, replace with actual API call)
    setTimeout(function () {
      // Reset form fields
      form.reset();

      // Restore button
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Show success message
      if (successMessage) {
        successMessage.style.display = 'flex';

        // Auto-hide success message after 6 seconds
        setTimeout(function () {
          successMessage.style.display = 'none';
        }, 6000);
      }

      // Clear all errors
      ['name', 'email', 'subject', 'message'].forEach(clearError);

    }, 1500); // 1.5s simulated network delay
  });
})();


/* ============================================================
   9. BACK TO TOP BUTTON
   - Shows when user scrolls down 400px
   - Smooth scrolls back to top on click
   ============================================================ */
(function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');

  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  // Scroll to top on click
  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
})();


/* ============================================================
   10. HERO STATS ANIMATION
   - Adds a CSS spin class to the loading button dynamically
   ============================================================ */
(function addSpinStyles() {
  // Add CSS for the spinner used in the form submit button
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .spin-icon {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   11. TOUCH SWIPE SUPPORT FOR TESTIMONIALS
   - Allows swiping left/right on mobile devices
   ============================================================ */
(function initTouchSwipe() {
  const slider = document.getElementById('testimonial-slider');

  if (!slider) return;

  let touchStartX = 0;
  let touchEndX   = 0;
  const MIN_SWIPE_DISTANCE = 50; // Minimum pixels to register as a swipe

  slider.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return; // Too short, ignore

    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    if (distance > 0) {
      // Swiped left → go to next slide
      if (nextBtn) nextBtn.click();
    } else {
      // Swiped right → go to previous slide
      if (prevBtn) prevBtn.click();
    }
  }
})();


/* ============================================================
   12. FOOTER LINKS — SMOOTH SCROLL
   - Ensures footer nav links also scroll smoothly
   ============================================================ */
(function initFooterLinks() {
  const footerLinks = document.querySelectorAll('.footer-links a, .footer-bottom-links a');

  footerLinks.forEach(function (link) {
    const href = link.getAttribute('href');

    // Only handle internal section links
    if (href && href.startsWith('#') && href.length > 1) {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });
    }
  });
})();


/* ============================================================
   UTILITY: Log initialization complete
   ============================================================ */
console.log('%cA1 Enterprise Website Loaded ✓', 'color: #0057D9; font-weight: bold; font-size: 14px;');


/* ============================================================
   13. HERO BACKGROUND GALLERY CONTROLS
   - Prev / Next buttons navigate between images
   - Dot click focuses that image and makes it prominent
   - "focused" mode pauses auto-scroll & boosts image visibility
   ============================================================ */
(function initHeroGallery() {
  const scrollWrapper = document.getElementById('hero-bg-scroll');
  const track         = document.getElementById('hero-bg-scroll-track');
  const prevBtn       = document.getElementById('gallery-prev');
  const nextBtn       = document.getElementById('gallery-next');
  const dots          = document.querySelectorAll('.gallery-dot');

  if (!scrollWrapper || !track) return;

  // Only the first 6 items are "real" — the rest are duplicates for loop
  const allItems    = track.querySelectorAll('.hero-bg-scroll-item');
  const totalImages = 6; // number of unique images
  let activeIndex   = -1; // -1 = no image focused (auto-scroll mode)
  let focusedMode   = false;

  // ── Helper: set active dot ──
  function setActiveDot(index) {
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (index >= 0 && dots[index]) {
      dots[index].classList.add('active');
    }
  }

  // ── Helper: highlight a specific image (both original + duplicate) ──
  function highlightImage(index) {
    allItems.forEach(function (item) { item.classList.remove('gallery-active'); });

    if (index < 0) return; // deactivate all

    // Highlight both the original and its duplicate (for seamless loop)
    const targets = [allItems[index], allItems[index + totalImages]];
    targets.forEach(function (el) {
      if (el) el.classList.add('gallery-active');
    });
  }

  // ── Enter focused mode: pause scroll, boost opacity ──
  function enterFocused(index) {
    focusedMode = true;
    activeIndex = ((index % totalImages) + totalImages) % totalImages;
    scrollWrapper.classList.add('gallery-focused');
    highlightImage(activeIndex);
    setActiveDot(activeIndex);

    // Scroll the track so the focused image is near center
    scrollToImage(activeIndex);
  }

  // ── Exit focused mode: resume auto-scroll ──
  function exitFocused() {
    focusedMode = false;
    activeIndex = -1;
    scrollWrapper.classList.remove('gallery-focused');
    highlightImage(-1);
    setActiveDot(0);
    // Restore CSS animation
    track.style.transform  = '';
    track.style.animation  = '';
    track.style.transition = '';
  }

  // ── Smoothly translate the track to show the target image centred ──
  function scrollToImage(index) {
    const item = allItems[index];
    if (!item) return;

    // Calculate how wide each item+gap is
    const itemWidth = item.offsetWidth + 24; // 24 = gap
    const wrapWidth = scrollWrapper.offsetWidth;
    const offset    = (itemWidth * index) - (wrapWidth / 2) + (itemWidth / 2);

    // Override the running CSS animation with a fixed translate
    track.style.animation  = 'none';
    track.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform  = 'translateX(-' + Math.max(0, offset) + 'px)';

    setTimeout(function () {
      track.style.transition = '';
    }, 600);
  }

  // ── Prev button ──
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const next = focusedMode ? activeIndex - 1 : 0;
      enterFocused(next < 0 ? totalImages - 1 : next);
    });
  }

  // ── Next button ──
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const next = focusedMode ? activeIndex + 1 : 0;
      enterFocused(next >= totalImages ? 0 : next);
    });
  }

  // ── Dot click: focus that image ──
  dots.forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.stopPropagation();
      const index = parseInt(dot.dataset.index, 10);
      if (focusedMode && activeIndex === index) {
        // Clicking the same dot again exits focused mode
        exitFocused();
      } else {
        enterFocused(index);
      }
    });
  });

  // ── Clicking an image directly focuses it ──
  allItems.forEach(function (item, i) {
    item.addEventListener('click', function () {
      const realIndex = i % totalImages;
      if (focusedMode && activeIndex === realIndex) {
        exitFocused();
      } else {
        enterFocused(realIndex);
      }
    });
  });

  // ── Clicking outside gallery controls/images exits focused mode ──
  document.addEventListener('click', function (e) {
    if (!focusedMode) return;
    const isInsideGallery = scrollWrapper.contains(e.target);
    if (!isInsideGallery) {
      exitFocused();
    }
  });

  // ── Keyboard: left/right arrows navigate when focused ──
  document.addEventListener('keydown', function (e) {
    if (!focusedMode) return;
    if (e.key === 'ArrowLeft') {
      const prev = activeIndex - 1 < 0 ? totalImages - 1 : activeIndex - 1;
      enterFocused(prev);
    }
    if (e.key === 'ArrowRight') {
      const next = activeIndex + 1 >= totalImages ? 0 : activeIndex + 1;
      enterFocused(next);
    }
    if (e.key === 'Escape') {
      exitFocused();
    }
  });

})();


/* ============================================================
   14. SERVICE DETAIL MODALS
   - "View Details" button opens the corresponding modal
   - Close button, backdrop click, or Escape key closes it
   ============================================================ */
(function initServiceModals() {

  // Open modal
  document.querySelectorAll('.btn-view-details').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const modalId = btn.getAttribute('data-modal');
      const modal   = document.getElementById(modalId);
      if (!modal) return;

      modal.classList.add('open');
      document.body.classList.add('modal-open');

      // Move focus to the close button for accessibility
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
    });
  });

  // Close helpers
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  // Close via × button
  document.querySelectorAll('.modal-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.closest('.service-modal'));
    });
  });

  // Close via backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(function (bd) {
    bd.addEventListener('click', function () {
      closeModal(bd.closest('.service-modal'));
    });
  });

  // Close via Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const open = document.querySelector('.service-modal.open');
      if (open) closeModal(open);
    }
  });

  // Close CTA link also closes modal before navigating
  document.querySelectorAll('.modal-cta').forEach(function (link) {
    link.addEventListener('click', function () {
      const open = document.querySelector('.service-modal.open');
      if (open) closeModal(open);
    });
  });

})();


/* ============================================================
   15. VIEW ALL SERVICES TOGGLE
   - Shows 6 cards by default
   - "View All Services" reveals hidden cards with animation
   - Button text/icon toggles between expanded/collapsed
   ============================================================ */
(function initViewAllServices() {
  const btn      = document.getElementById('btn-view-all-services');
  const extras   = document.querySelectorAll('.service-card-hidden');
  const label    = btn ? btn.querySelector('.view-all-label') : null;

  if (!btn || !extras.length) return;

  let expanded = false;

  btn.addEventListener('click', function () {
    expanded = !expanded;

    extras.forEach(function (card, i) {
      if (expanded) {
        card.classList.add('service-card-visible');
        // stagger each extra card
        card.style.animationDelay = (i * 80) + 'ms';
      } else {
        card.classList.remove('service-card-visible');
        card.style.animationDelay = '';
      }
    });

    btn.classList.toggle('expanded', expanded);
    if (label) {
      label.textContent = expanded ? 'Show Less' : 'View All Services';
    }
  });
})();
