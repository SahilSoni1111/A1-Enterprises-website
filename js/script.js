/* ============================================================
   A1 ENTERPRISE - MAIN JAVASCRIPT
   Author: A1 Enterprise Dev Team
   Description: All interactive functionality for the website
   ============================================================ */

/* ============================================================
   1. LOADING SCREEN
   - Fades out after page fully loads (or after 2.2s max)
   ============================================================ */
(function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');

  if (!loadingScreen) return;

  // Function to hide the loading screen
  function hideLoader() {
    loadingScreen.classList.add('hidden');
    // Remove from DOM after transition completes
    setTimeout(() => {
      if (loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 600);
  }

  // Hide after content loads or after 2.2 seconds max
  window.addEventListener('load', function () {
    setTimeout(hideLoader, 500);
  });

  // Failsafe: always hide after 2.5s even if load event is slow
  setTimeout(hideLoader, 2500);
})();


/* ============================================================
   2. STICKY NAVBAR
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
   3. MOBILE HAMBURGER MENU
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
   4. SMOOTH SCROLLING
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
   5. ACTIVE NAVIGATION HIGHLIGHT
   - Uses IntersectionObserver to detect which section
     is currently visible and marks the corresponding nav link
   ============================================================ */
(function initActiveNavHighlight() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  // Create an observer that fires when sections enter the viewport
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');

        // Remove active class from all links
        navLinks.forEach(function (link) {
          link.classList.remove('active');
        });

        // Add active class to the matching link
        const activeLink = document.querySelector('.nav-link[href="#' + sectionId + '"]');
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }, {
    // Section is considered "active" when it occupies 30% of the viewport
    threshold: 0.3,
    // Start observing slightly before the section reaches the top
    rootMargin: '-80px 0px -40% 0px'
  });

  // Start observing all sections
  sections.forEach(function (section) {
    observer.observe(section);
  });
})();


/* ============================================================
   6. SCROLL ANIMATIONS
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
   7. COUNTER ANIMATION
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
   8. TESTIMONIAL SLIDER
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
   9. CONTACT FORM VALIDATION & SUBMISSION
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
   10. BACK TO TOP BUTTON
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
   11. HERO STATS ANIMATION
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
   12. TOUCH SWIPE SUPPORT FOR TESTIMONIALS
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
   13. FOOTER LINKS — SMOOTH SCROLL
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
