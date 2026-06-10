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
   8. LANGUAGE SWITCHER
   - Provides English / Hindi switching for key site content
   - Stores the selected language in localStorage
   ============================================================ */
const LANGUAGE_STORAGE_KEY = 'a1-enterprises-language';

const LANGUAGE_CONTENT = {
  en: {
    shared: {
      switcherAria: 'Switch language',
      logoTagline: 'Quality You Can Trust',
      backToTop: 'Back to top',
      nav: ['Home', 'About', 'Services', 'Order', 'Projects', 'Industries', 'Testimonials', 'Contact'],
      callNow: 'Call Now',
      getQuote: 'Get Quote',
      previousImage: 'Previous image',
      nextImage: 'Next image',
      previousTestimonial: 'Previous testimonial',
      nextTestimonial: 'Next testimonial',
      close: 'Close',
      viewDetails: 'View Details',
      askQuote: 'Ask for Size & Quote',
      formErrors: {
        nameRequired: 'Please enter your full name.',
        nameShort: 'Name must be at least 2 characters.',
        emailRequired: 'Please enter your email address.',
        emailInvalid: 'Please enter a valid email address.',
        subjectRequired: 'Please enter a subject.',
        messageRequired: 'Please write a message.',
        messageShort: 'Message must be at least 10 characters.'
      },
      formSending: 'Sending...'
    },
    home: {
      title: 'A1 Enterprise | Quality You Can Trust',
      description: 'A1 Enterprise - Quality You Can Trust. Reliable agricultural and industrial products for businesses.',
      heroBadge: 'Trusted By 300+ Companies Worldwide',
      heroHighlight: 'Quality You Can Trust',
      heroSubtitle: 'A1 Enterprise provides reliable, innovative, and customer-focused solutions that help businesses grow and succeed in today\'s competitive market.',
      heroButtons: ['Explore Services', 'Contact Us'],
      heroStats: ['Years Experience', 'Projects Done', 'Happy Clients', 'Satisfaction'],
      scrollDown: 'Scroll Down',
      about: {
        badge: 'About Us',
        title: 'Who We Are',
        subtitle: 'A leading corporate enterprise delivering excellence across industries since 2009',
        brandIdentity: 'A1 Enterprise Brand Identity',
        statLabels: ['Years of Excellence', 'Expert Team Members'],
        storyBadge: 'Our Story',
        storyTitle: 'Driving Business Growth <span class="text-blue">Since 2009</span>',
        storyDesc: 'A1 Enterprise was founded with a clear vision: to deliver world-class corporate solutions that empower businesses to thrive. Over 15 years, we\'ve built a reputation for integrity, innovation, and impactful results.',
        detailTexts: [
          'We are supported with the most appropriate and advanced infrastructure equipped with innovative technology. Our modern setup helps us maintain a reputable image in the market while offering genuine and quality-tested products made from optimum quality raw material to meet international quality standards.',
          'Our infrastructure is segregated into specialized departments such as manufacturing, quality testing, sales, and marketing, enabling smooth coordination and timely delivery of products.'
        ],
        teamTitle: 'Our Team',
        teamIntro: 'We are backed by a competent team of immensely skilled professionals who possess strong domain knowledge and practical understanding of the technologies used in the production process. Their dedication helps us meet the diverse requirements of customers.',
        teamRoles: [
          'Designers',
          'Machine operators',
          'Unskilled labourers',
          'Quality controllers',
          'Warehousing & packaging experts',
          'Sales and marketing professionals'
        ],
        teamOutro: 'All the latest machines installed at our infrastructure are handled efficiently by our professionals, helping us manufacture quality assured products and complete operations within the promised time frame.',
        missionTitle: 'Our Mission',
        missionDesc: 'To provide innovative, reliable, and customer-focused enterprise solutions that create lasting value for our clients.',
        visionTitle: 'Our Vision',
        visionDesc: 'To be the most trusted enterprise partner, recognized globally for our excellence and transformative impact.',
        valuesTitle: 'Core Values',
        values: ['Integrity', 'Quality', 'Innovation', 'Commitment', 'Excellence'],
        workWithUs: 'Work With Us'
      },
      services: {
        badge: 'Our Product Range',
        title: 'Agriculture & Industrial Products',
        subtitle: 'RPE pond liner, tarpaulin, truck tarpaulin, HDPE / PP bags, and poultry curtains available in reasonable rates with installation support for selected products.',
        addPhoto: 'Add Product Photo',
        viewAll: 'View All Services',
        cards: [
          { title: 'RPE Pond Liner', price: 'Price: Add Here', chip: 'Installation Available' },
          { title: 'Agriculture Tarpaulin', price: 'Price: Add Here', chip: 'IS 15351' },
          { title: 'Tarpaulin for Fisheries & Water Storage', price: 'Price: Add Here', chip: 'Water Storage' },
          { title: 'Tarpaulin for Covering Materials', price: 'Price: Add Here', chip: 'Material Covering' },
          { title: 'Truck Tarpaulin', price: 'Price: Add Here', chip: 'All Sizes' },
          { title: 'HDPE & PP Bags', price: 'Price: Add Here', chip: 'Bulk Supply' },
          { title: 'Poultry Curtains', price: 'Price: Add Here', chip: 'Poultry Use' }
        ]
      },
      why: {
        badge: 'Our Advantage',
        title: 'Why Choose A1 Enterprise?',
        subtitle: 'Working in compliance with industry standards, we focus on meeting customer needs with dependable products and modern facilities.',
        intro: 'We have attained a strong foothold in the market owing to the support of skilled professionals, quality-focused processes, and a customer-first approach.',
        cards: [
          { title: 'Ethical Business Policies', desc: 'We follow transparent and ethical business practices in every process to build long-term trust with our customers.' },
          { title: 'Customized Solutions', desc: 'We understand varied customer requirements and offer practical, customized solutions for different applications.' },
          { title: 'Quality Tested Products', desc: 'Each product is checked carefully to ensure genuine quality, dependable performance, and compliance with expected standards.' },
          { title: 'Excellent Customer Support', desc: 'Our team stays ready to assist customers at every step and works closely to address their requirements effectively.' },
          { title: 'Timely Delivery of Consignments', desc: 'Coordinated departments and efficient operations help us complete and deliver orders within the promised time frame.' },
          { title: 'Competitive Prices', desc: 'We offer quality products at competitive prices, giving customers dependable value without compromising standards.' }
        ]
      },
      industries: {
        badge: 'Sectors We Serve',
        title: 'Industries We Work In',
        subtitle: 'Delivering specialized expertise across diverse industry sectors',
        cards: [
          { title: 'Manufacturing', desc: 'Industrial-grade manufacturing solutions for production excellence' },
          { title: 'Construction', desc: 'Comprehensive construction management and engineering services' },
          { title: 'Logistics', desc: 'Smart logistics and supply chain optimization solutions' },
          { title: 'Agriculture', desc: 'Modern agricultural solutions for improved yield and sustainability' },
          { title: 'Packaging', desc: 'Innovative packaging solutions for diverse product requirements' },
          { title: 'FMCG', desc: 'Fast-moving consumer goods solutions for retail and distribution' },
          { title: 'Infrastructure', desc: 'Large-scale infrastructure development and modernization projects' },
          { title: 'Engineering', desc: 'Precision engineering solutions for complex industrial challenges' }
        ]
      },
      projects: {
        badge: 'Our Work',
        title: 'Featured Projects',
        subtitle: 'A showcase of our most impactful enterprise solutions and successful deliveries'
      },
      testimonials: {
        badge: 'Client Reviews',
        title: 'What Our Clients Say',
        subtitle: 'Trusted by hundreds of businesses across industries'
      },
      contact: {
        badge: 'Get In Touch',
        title: 'Contact Us',
        subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond within 24 hours.',
        introTitle: 'Let\'s Start a Conversation',
        introText: 'Ready to take your business to the next level? Reach out to us and our expert team will get back to you promptly.',
        infoTitles: ['Our Office', 'Phone Number', 'Email Address', 'Working Hours'],
        workingHours: 'Monday – Saturday: 9:00 AM – 5:00 PM',
        formLabels: ['Full Name *', 'Email Address *', 'Phone Number', 'Subject *', 'Message *'],
        placeholders: [
          'Enter your full name',
          'Enter your email',
          'Enter your phone number',
          'How can we help?',
          'Tell us about your project or inquiry...'
        ],
        submit: 'Send Message',
        success: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.'
      },
      footer: {
        brandDesc: 'From water conservation and agricultural applications to industrial covering solutions, we deliver premium-quality Tarpaulins, Pond Liners, and Poultry Farm Products that stand the test of time.',
        headings: ['Our Services', 'Quick Links', 'Contact Info'],
        serviceLinks: ['Industrial Solutions', 'Engineering Services', 'Manufacturing Support', 'Business Consulting', 'Project Management', 'Supply Chain Solutions'],
        quickLinks: ['Home', 'About Us', 'Our Projects', 'Industries', 'Testimonials', 'Contact Us'],
        hours: 'Mon-Sat: 9AM – 5PM IST',
        copyright: '© 2026 A1 Enterprise. All Rights Reserved. | Designed with excellence.',
        bottomLinks: ['Privacy Policy', 'Terms of Service', 'Sitemap']
      },
      serviceModals: [
        {
          title: 'RPE Pond Liner',
          chip: 'Installation Available',
          desc: 'Heavy-duty RPE pond liner suitable for agriculture, fisheries, farm ponds, and water storage applications with dependable leak protection and long service life.',
          features: [
            'Used for irrigation ponds and fisheries',
            'Suitable for long-term water storage',
            'Professional installation support available',
            'Highly durable with UV protection'
          ]
        },
        {
          title: 'Agriculture Tarpaulin',
          chip: 'IS 15351',
          desc: 'UV stabilised tarpaulin sheets for agricultural use, ideal for crop protection, temporary sheds, field coverage, and seasonal storage at reasonable rates.',
          features: [
            'UV stabilised quality — IS 15351 certified',
            '5 years warranty',
            'Available in multiple sizes',
            'Waterproof and tear resistant'
          ]
        },
        {
          title: 'Tarpaulin for Fisheries & Water Storage',
          chip: 'Water Storage',
          desc: 'Reliable tarpaulin solutions for fish ponds, hatchery support, tank lining, and water storage projects where strength and weather resistance are important.',
          features: [
            'Suitable for fisheries and hatchery applications',
            'Helps secure clean water storage',
            'Available with fitting assistance',
            'Weather and UV resistant material'
          ]
        },
        {
          title: 'Tarpaulin for Covering Materials',
          chip: 'Material Covering',
          desc: 'Strong covering tarpaulin for machinery, raw materials, finished goods, warehouse stock, and outdoor storage where weather protection is required.',
          features: [
            'Protects against sun, dust, and rain',
            'Useful for farm and industrial stock',
            'Custom size supply available',
            'Heavy-duty grommets for secure tying'
          ]
        },
        {
          title: 'Truck Tarpaulin',
          chip: 'All Sizes',
          desc: 'Truck tarpaulin available in all sizes for transport coverage, side curtain applications, and load protection during long-distance and local movement.',
          features: [
            'Available in all standard and custom sizes',
            'Built for heavy transport use',
            'Strong eyelets and stitching options',
            'Suitable for open trucks and trailers'
          ]
        },
        {
          title: 'HDPE & PP Bags',
          chip: 'Bulk Supply',
          desc: 'HDPE and PP bags available for agriculture, grains, feed, fertiliser, industrial packaging, and bulk material handling with dependable strength.',
          features: [
            'Suitable for storage and packaging',
            'Bulk quantity supply available',
            'Custom size and GSM options on request',
            'Food-grade and industrial variants available'
          ]
        },
        {
          title: 'Poultry Curtains',
          chip: 'Poultry Use',
          desc: 'Poultry curtains available for farm sheds and poultry houses to help with airflow control, weather protection, and better internal shed management.',
          features: [
            'Suitable for poultry farm side coverage',
            'Helps protect from wind and rain',
            'Made for practical daily use',
            'Easy to install and maintain'
          ]
        }
      ]
    },
    order: {
      title: 'Place Order | A1 Enterprise',
      description: 'Place your order with A1 Enterprise for pond liners, tarpaulins, HDPE/PP bags, poultry curtains, and more.',
      navButton: 'Place Order',
      backToHome: 'Back to Home',
      heroBadge: 'Quick Order',
      heroTitle: 'Place Your Order in Minutes',
      heroSubtitle: 'Share your product details, quantity, and delivery location. Our team will confirm availability, final pricing, and dispatch details with you quickly.',
      highlights: [
        { title: 'Fast Response', desc: 'We review new requests within one business day.' },
        { title: 'Bulk Supply Support', desc: 'Ideal for dealers, farms, contractors, and industrial buyers.' },
        { title: 'Direct Assistance', desc: 'Need help choosing a product? Call our team anytime.' }
      ],
      statNumber: '500+',
      statLabel: 'Orders & project deliveries supported',
      checklist: ['RPE Pond Liners', 'Tarpaulin Solutions', 'HDPE / PP Bags', 'Poultry Curtains'],
      processBadge: 'How It Works',
      processTitle: 'Simple Ordering Process',
      steps: [
        { title: 'Submit your requirement', desc: 'Choose the product, quantity, and delivery details in the form.' },
        { title: 'Get confirmation', desc: 'Our team contacts you with pricing, stock availability, and dispatch timing.' },
        { title: 'Finalize and receive', desc: 'Approve the order and we help coordinate supply or installation where applicable.' }
      ],
      supportTitle: 'Need help before ordering?',
      supportText: 'Talk to our team if you are unsure about product size, GSM, thickness, or quantity.',
      supportButtons: ['Call +91 7972345360', 'View Products'],
      formBadge: 'Order Request',
      formTitle: 'Tell Us What You Need',
      formIntro: 'Fill out the form and our team will contact you with the next steps.',
      formLabels: ['Full Name *', 'Phone Number *', 'Product *', 'Quantity *', 'City *', 'State', 'Delivery Address *', 'Additional Requirement'],
      placeholders: [
        'Enter your full name',
        'Enter your phone number',
        'Ex: 500 sq ft / 100 bags',
        'Enter your city',
        'Enter your state',
        'Enter delivery address',
        'Mention size, thickness, color, dispatch timeline, or any special note'
      ],
      productOptions: [
        'Select a product',
        'RPE Pond Liner',
        'Agriculture Tarpaulin',
        'Tarpaulin for Fisheries & Water Storage',
        'Tarpaulin for Covering Materials',
        'Truck Tarpaulin',
        'HDPE & PP Bags',
        'Poultry Curtains'
      ],
      submit: 'Submit Order Request',
      sending: 'Submitting...',
      success: 'Thank you! Your order request has been sent. Our team will contact you shortly.',
      note: 'This page collects your order request only. Final pricing and confirmation will be shared by our team after review.',
      formErrors: {
        nameRequired: 'Please enter your full name.',
        phoneRequired: 'Please enter your phone number.',
        productRequired: 'Please select a product.',
        quantityRequired: 'Please enter the quantity you need.',
        cityRequired: 'Please enter your city.',
        addressRequired: 'Please enter your delivery address.'
      }
    },
    services: {
      title: 'All Services | A1 Enterprise',
      description: 'A1 Enterprise – All Products & Services: RPE Pond Liner, Tarpaulin, HDPE/PP Bags, Poultry Curtains and more.',
      backToHome: 'Back to Home',
      heroBadge: 'Our Product Range',
      heroTitle: 'All Services & Products',
      heroSubtitle: 'RPE pond liner, tarpaulin, truck tarpaulin, HDPE / PP bags, and poultry curtains — available at reasonable rates with installation support for selected products.',
      addPhoto: 'Add Product Photo',
      orderCta: 'Place Order for Any Product',
      cards: [
        { title: 'RPE Pond Liner', chip: 'Installation Available' },
        { title: 'Agriculture Tarpaulin', chip: 'IS 15351' },
        { title: 'Tarpaulin for Fisheries & Water Storage', chip: 'Water Storage' },
        { title: 'Tarpaulin for Covering Materials', chip: 'Material Covering' },
        { title: 'Truck Tarpaulin', chip: 'All Sizes' },
        { title: 'HDPE & PP Bags', chip: 'Bulk Supply' },
        { title: 'Poultry Curtains', chip: 'Poultry Use' }
      ]
    }
  },
  hi: {
    shared: {
      switcherAria: 'भाषा बदलें',
      logoTagline: 'भरोसेमंद गुणवत्ता',
      backToTop: 'ऊपर जाएं',
      nav: ['होम', 'हमारे बारे में', 'सेवाएं', 'ऑर्डर', 'प्रोजेक्ट्स', 'उद्योग', 'प्रशंसापत्र', 'संपर्क'],
      callNow: 'अभी कॉल करें',
      getQuote: 'कोटेशन लें',
      previousImage: 'पिछली छवि',
      nextImage: 'अगली छवि',
      previousTestimonial: 'पिछला प्रशंसापत्र',
      nextTestimonial: 'अगला प्रशंसापत्र',
      close: 'बंद करें',
      viewDetails: 'विवरण देखें',
      askQuote: 'साइज और कोटेशन पूछें',
      formErrors: {
        nameRequired: 'कृपया अपना पूरा नाम दर्ज करें।',
        nameShort: 'नाम कम से कम 2 अक्षरों का होना चाहिए।',
        emailRequired: 'कृपया अपना ईमेल पता दर्ज करें।',
        emailInvalid: 'कृपया सही ईमेल पता दर्ज करें।',
        subjectRequired: 'कृपया विषय दर्ज करें।',
        messageRequired: 'कृपया संदेश लिखें।',
        messageShort: 'संदेश कम से कम 10 अक्षरों का होना चाहिए।'
      },
      formSending: 'भेजा जा रहा है...'
    },
    home: {
      title: 'A1 Enterprise | भरोसा जिस पर आप कर सकें',
      description: 'A1 Enterprise - भरोसेमंद कृषि और औद्योगिक उत्पाद।',
      heroBadge: 'दुनियाभर की 300+ कंपनियों का भरोसा',
      heroHighlight: 'भरोसे की गुणवत्ता',
      heroSubtitle: 'A1 Enterprise भरोसेमंद, नवाचारी और ग्राहक-केंद्रित समाधान प्रदान करता है जो व्यवसायों को आगे बढ़ने और प्रतिस्पर्धी बाजार में सफल होने में मदद करते हैं।',
      heroButtons: ['सेवाएं देखें', 'संपर्क करें'],
      heroStats: ['वर्षों का अनुभव', 'पूरा किए प्रोजेक्ट्स', 'संतुष्ट ग्राहक', 'संतुष्टि'],
      scrollDown: 'नीचे स्क्रॉल करें',
      about: {
        badge: 'हमारे बारे में',
        title: 'हम कौन हैं',
        subtitle: '2009 से विभिन्न उद्योगों में उत्कृष्टता देने वाला अग्रणी उद्यम',
        brandIdentity: 'A1 Enterprise ब्रांड पहचान',
        statLabels: ['उत्कृष्टता के वर्ष', 'विशेषज्ञ टीम सदस्य'],
        storyBadge: 'हमारी कहानी',
        storyTitle: 'व्यवसायिक विकास को आगे बढ़ाते हुए <span class="text-blue">2009 से</span>',
        storyDesc: 'A1 Enterprise की स्थापना एक स्पष्ट सोच के साथ हुई थी: ऐसे विश्वसनीय समाधान देना जो व्यवसायों को आगे बढ़ने में मदद करें। 15 से अधिक वर्षों में हमने ईमानदारी, नवाचार और प्रभावी परिणामों की मजबूत पहचान बनाई है।',
        detailTexts: [
          'हमारे पास उपयुक्त और आधुनिक इन्फ्रास्ट्रक्चर है जो नवीन तकनीक से सुसज्जित है। हमारी आधुनिक व्यवस्था हमें बाजार में मजबूत पहचान बनाने में मदद करती है और हम उत्कृष्ट गुणवत्ता वाले कच्चे माल से बने genuine और quality-tested उत्पाद प्रदान करते हैं जो अंतरराष्ट्रीय गुणवत्ता मानकों को पूरा करते हैं।',
          'हमारी यूनिट manufacturing, quality testing, sales और marketing जैसे विशेष विभागों में विभाजित है, जिससे बेहतर समन्वय और समय पर डिलीवरी संभव हो पाती है।'
        ],
        teamTitle: 'हमारी टीम',
        teamIntro: 'हमारे साथ अत्यंत कुशल और अनुभवी पेशेवरों की सक्षम टीम जुड़ी है, जिन्हें उत्पादन प्रक्रिया और उपयोग होने वाली तकनीकों का पूरा ज्ञान है। उनकी मेहनत और विशेषज्ञता हमें ग्राहकों की विविध आवश्यकताओं को पूरा करने में मदद करती है।',
        teamRoles: [
          'डिजाइनर्स',
          'मशीन ऑपरेटर्स',
          'अकुशल श्रमिक',
          'क्वालिटी कंट्रोलर्स',
          'वेयरहाउसिंग और पैकेजिंग विशेषज्ञ',
          'सेल्स और मार्केटिंग प्रोफेशनल्स'
        ],
        teamOutro: 'हमारे इन्फ्रास्ट्रक्चर में लगे सभी आधुनिक मशीनों को हमारे प्रोफेशनल्स कुशलता से संभालते हैं, जिससे quality assured उत्पाद बनते हैं और सभी कार्य तय समय सीमा में पूरे होते हैं।',
        missionTitle: 'हमारा मिशन',
        missionDesc: 'ऐसे नवाचारी, विश्वसनीय और ग्राहक-केंद्रित समाधान प्रदान करना जो हमारे ग्राहकों के लिए दीर्घकालिक मूल्य बनाएं।',
        visionTitle: 'हमारी दृष्टि',
        visionDesc: 'उत्कृष्टता और प्रभाव के लिए विश्व स्तर पर पहचाने जाने वाले सबसे भरोसेमंद उद्यम सहयोगी बनना।',
        valuesTitle: 'मुख्य मूल्य',
        values: ['ईमानदारी', 'गुणवत्ता', 'नवाचार', 'प्रतिबद्धता', 'उत्कृष्टता'],
        workWithUs: 'हमारे साथ काम करें'
      },
      services: {
        badge: 'हमारी उत्पाद श्रृंखला',
        title: 'कृषि और औद्योगिक उत्पाद',
        subtitle: 'RPE pond liner, tarpaulin, truck tarpaulin, HDPE / PP bags और poultry curtains उचित दरों पर उपलब्ध हैं, साथ ही चुनिंदा उत्पादों पर इंस्टॉलेशन सहायता भी मिलती है।',
        addPhoto: 'उत्पाद फोटो जोड़ें',
        viewAll: 'सभी सेवाएं देखें',
        cards: [
          { title: 'RPE Pond Liner', price: 'कीमत: यहां जोड़ें', chip: 'इंस्टॉलेशन उपलब्ध' },
          { title: 'Agriculture Tarpaulin', price: 'कीमत: यहां जोड़ें', chip: 'IS 15351' },
          { title: 'Fisheries और Water Storage के लिए Tarpaulin', price: 'कीमत: यहां जोड़ें', chip: 'जल भंडारण' },
          { title: 'कवरिंग मटेरियल के लिए Tarpaulin', price: 'कीमत: यहां जोड़ें', chip: 'मटेरियल कवरिंग' },
          { title: 'Truck Tarpaulin', price: 'कीमत: यहां जोड़ें', chip: 'सभी साइज' },
          { title: 'HDPE और PP Bags', price: 'कीमत: यहां जोड़ें', chip: 'थोक सप्लाई' },
          { title: 'Poultry Curtains', price: 'कीमत: यहां जोड़ें', chip: 'पोल्ट्री उपयोग' }
        ]
      },
      why: {
        badge: 'हमारी विशेषता',
        title: 'A1 Enterprise क्यों चुनें?',
        subtitle: 'उद्योग मानकों के अनुसार कार्य करते हुए हम ग्राहकों की जरूरतों को विश्वसनीय उत्पादों और आधुनिक सुविधाओं के साथ पूरा करते हैं।',
        intro: 'कुशल पेशेवरों, गुणवत्ता-केंद्रित प्रक्रियाओं और customer-first approach के कारण हमने बाजार में मजबूत पहचान बनाई है।',
        cards: [
          { title: 'नैतिक व्यवसाय नीतियां', desc: 'हम हर प्रक्रिया में पारदर्शी और नैतिक व्यवसायिक नीतियों का पालन करते हैं, जिससे ग्राहकों का भरोसा बना रहता है।' },
          { title: 'कस्टमाइज़्ड समाधान', desc: 'हम ग्राहकों की अलग-अलग जरूरतों को समझकर व्यावहारिक और customized solutions प्रदान करते हैं।' },
          { title: 'गुणवत्ता परीक्षण किए गए उत्पाद', desc: 'हर उत्पाद को सावधानीपूर्वक जांचा जाता है ताकि genuine quality, भरोसेमंद प्रदर्शन और अपेक्षित मानकों का पालन सुनिश्चित हो।' },
          { title: 'उत्कृष्ट ग्राहक सहायता', desc: 'हमारी टीम हर चरण में ग्राहकों की सहायता के लिए तैयार रहती है और उनकी जरूरतों को प्रभावी ढंग से पूरा करती है।' },
          { title: 'समय पर कंसाइनमेंट डिलीवरी', desc: 'समन्वित विभाग और कुशल संचालन हमें तय समय सीमा में ऑर्डर पूरा करके डिलीवर करने में मदद करते हैं।' },
          { title: 'प्रतिस्पर्धी कीमतें', desc: 'हम गुणवत्ता से समझौता किए बिना प्रतिस्पर्धी कीमतों पर उत्पाद उपलब्ध कराते हैं।' }
        ]
      },
      industries: {
        badge: 'जिन क्षेत्रों में हम काम करते हैं',
        title: 'हम किन उद्योगों में कार्य करते हैं',
        subtitle: 'विभिन्न उद्योगों के लिए विशेष विशेषज्ञता प्रदान करते हैं',
        cards: [
          { title: 'मैन्युफैक्चरिंग', desc: 'उत्पादन उत्कृष्टता के लिए औद्योगिक-ग्रेड समाधान' },
          { title: 'निर्माण', desc: 'समग्र निर्माण प्रबंधन और इंजीनियरिंग सेवाएं' },
          { title: 'लॉजिस्टिक्स', desc: 'स्मार्ट लॉजिस्टिक्स और सप्लाई चेन समाधान' },
          { title: 'कृषि', desc: 'बेहतर उत्पादन और स्थिरता के लिए आधुनिक कृषि समाधान' },
          { title: 'पैकेजिंग', desc: 'विभिन्न जरूरतों के लिए नवाचारी पैकेजिंग समाधान' },
          { title: 'FMCG', desc: 'रिटेल और डिस्ट्रीब्यूशन के लिए तेज उपभोक्ता उत्पाद समाधान' },
          { title: 'इन्फ्रास्ट्रक्चर', desc: 'बड़े स्तर के विकास और आधुनिकीकरण प्रोजेक्ट्स' },
          { title: 'इंजीनियरिंग', desc: 'जटिल औद्योगिक चुनौतियों के लिए सटीक इंजीनियरिंग समाधान' }
        ]
      },
      projects: {
        badge: 'हमारा कार्य',
        title: 'प्रमुख प्रोजेक्ट्स',
        subtitle: 'हमारे प्रभावशाली समाधानों और सफल डिलीवरी की झलक'
      },
      testimonials: {
        badge: 'ग्राहक समीक्षा',
        title: 'हमारे ग्राहक क्या कहते हैं',
        subtitle: 'विभिन्न उद्योगों की सैकड़ों कंपनियों का भरोसा'
      },
      contact: {
        badge: 'संपर्क करें',
        title: 'हमसे संपर्क करें',
        subtitle: 'हम आपसे सुनना पसंद करेंगे। हमें संदेश भेजें, हम 24 घंटों के भीतर जवाब देंगे।',
        introTitle: 'बातचीत शुरू करें',
        introText: 'अपने व्यवसाय को अगले स्तर पर ले जाने के लिए तैयार हैं? हमसे संपर्क करें, हमारी टीम जल्द ही आपसे जुड़ेगी।',
        infoTitles: ['हमारा कार्यालय', 'फोन नंबर', 'ईमेल पता', 'कार्य समय'],
        workingHours: 'सोमवार – शनिवार: 9:00 AM – 5:00 PM',
        formLabels: ['पूरा नाम *', 'ईमेल पता *', 'फोन नंबर', 'विषय *', 'संदेश *'],
        placeholders: [
          'अपना पूरा नाम दर्ज करें',
          'अपना ईमेल दर्ज करें',
          'अपना फोन नंबर दर्ज करें',
          'हम आपकी कैसे मदद करें?',
          'अपने प्रोजेक्ट या पूछताछ के बारे में बताएं...'
        ],
        submit: 'संदेश भेजें',
        success: 'धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। हम 24 घंटों के भीतर आपसे संपर्क करेंगे।'
      },
      footer: {
        brandDesc: 'जल संरक्षण और कृषि उपयोग से लेकर औद्योगिक कवरिंग समाधानों तक, हम प्रीमियम गुणवत्ता वाले Tarpaulins, Pond Liners और Poultry Farm Products उपलब्ध कराते हैं जो लंबे समय तक टिके रहते हैं।',
        headings: ['हमारी सेवाएं', 'त्वरित लिंक', 'संपर्क जानकारी'],
        serviceLinks: ['औद्योगिक समाधान', 'इंजीनियरिंग सेवाएं', 'मैन्युफैक्चरिंग सहायता', 'बिजनेस कंसल्टिंग', 'प्रोजेक्ट मैनेजमेंट', 'सप्लाई चेन समाधान'],
        quickLinks: ['होम', 'हमारे बारे में', 'हमारे प्रोजेक्ट्स', 'उद्योग', 'प्रशंसापत्र', 'संपर्क करें'],
        hours: 'सोम-शनि: 9AM – 5PM IST',
        copyright: '© 2026 A1 Enterprise. सभी अधिकार सुरक्षित। | उत्कृष्टता के साथ डिज़ाइन किया गया।',
        bottomLinks: ['गोपनीयता नीति', 'सेवा की शर्तें', 'साइटमैप']
      },
      serviceModals: [
        {
          title: 'RPE Pond Liner',
          chip: 'इंस्टॉलेशन उपलब्ध',
          desc: 'हेवी-ड्यूटी RPE pond liner कृषि, fisheries, farm ponds और water storage के लिए उपयुक्त है। यह भरोसेमंद लीकेज सुरक्षा और लंबी सेवा आयु देता है।',
          features: [
            'सिंचाई तालाब और fisheries के लिए उपयोगी',
            'लंबे समय तक जल भंडारण के लिए उपयुक्त',
            'प्रोफेशनल इंस्टॉलेशन सहायता उपलब्ध',
            'UV protection के साथ बेहद टिकाऊ'
          ]
        },
        {
          title: 'Agriculture Tarpaulin',
          chip: 'IS 15351',
          desc: 'कृषि उपयोग के लिए UV stabilised tarpaulin sheets, जो crop protection, अस्थायी शेड, field coverage और seasonal storage के लिए उपयुक्त हैं।',
          features: [
            'UV stabilised गुणवत्ता — IS 15351 certified',
            '5 वर्ष की वारंटी',
            'अनेक साइज में उपलब्ध',
            'वॉटरप्रूफ और tear resistant'
          ]
        },
        {
          title: 'Fisheries और Water Storage के लिए Tarpaulin',
          chip: 'जल भंडारण',
          desc: 'Fish ponds, hatchery support, tank lining और water storage projects के लिए मजबूत और भरोसेमंद tarpaulin समाधान।',
          features: [
            'Fisheries और hatchery applications के लिए उपयुक्त',
            'साफ पानी के सुरक्षित भंडारण में सहायक',
            'फिटिंग सहायता उपलब्ध',
            'मौसम और UV resistant material'
          ]
        },
        {
          title: 'कवरिंग मटेरियल के लिए Tarpaulin',
          chip: 'मटेरियल कवरिंग',
          desc: 'मशीनरी, raw materials, finished goods, warehouse stock और outdoor storage के लिए मजबूत covering tarpaulin।',
          features: [
            'धूप, धूल और बारिश से सुरक्षा',
            'कृषि और औद्योगिक स्टॉक के लिए उपयोगी',
            'कस्टम साइज सप्लाई उपलब्ध',
            'मजबूत grommets से सुरक्षित बांधने की सुविधा'
          ]
        },
        {
          title: 'Truck Tarpaulin',
          chip: 'सभी साइज',
          desc: 'Transport coverage, side curtain applications और load protection के लिए सभी साइज में truck tarpaulin उपलब्ध है।',
          features: [
            'स्टैंडर्ड और कस्टम सभी साइज उपलब्ध',
            'भारी परिवहन उपयोग के लिए उपयुक्त',
            'मजबूत eyelets और stitching options',
            'Open trucks और trailers के लिए उपयुक्त'
          ]
        },
        {
          title: 'HDPE और PP Bags',
          chip: 'थोक सप्लाई',
          desc: 'HDPE और PP bags कृषि, grains, feed, fertiliser, industrial packaging और bulk material handling के लिए उपलब्ध हैं।',
          features: [
            'Storage और packaging के लिए उपयुक्त',
            'थोक मात्रा में सप्लाई उपलब्ध',
            'Custom size और GSM options उपलब्ध',
            'Food-grade और industrial variants उपलब्ध'
          ]
        },
        {
          title: 'Poultry Curtains',
          chip: 'पोल्ट्री उपयोग',
          desc: 'Poultry curtains farm sheds और poultry houses में airflow control, weather protection और बेहतर shed management के लिए उपयोगी हैं।',
          features: [
            'Poultry farm side coverage के लिए उपयुक्त',
            'हवा और बारिश से सुरक्षा में सहायक',
            'रोजमर्रा के उपयोग के लिए व्यावहारिक',
            'लगाने और संभालने में आसान'
          ]
        }
      ]
    },
    order: {
      title: 'ऑर्डर करें | A1 Enterprise',
      description: 'A1 Enterprise के pond liners, tarpaulins, HDPE/PP bags और poultry curtains के लिए ऑर्डर अनुरोध भेजें।',
      navButton: 'ऑर्डर करें',
      backToHome: 'होम पर वापस जाएं',
      heroBadge: 'त्वरित ऑर्डर',
      heroTitle: 'कुछ ही मिनटों में अपना ऑर्डर भेजें',
      heroSubtitle: 'अपना उत्पाद, मात्रा और डिलीवरी लोकेशन साझा करें। हमारी टीम आपसे उपलब्धता, अंतिम कीमत और डिस्पैच जानकारी के साथ जल्दी संपर्क करेगी।',
      highlights: [
        { title: 'तेज प्रतिक्रिया', desc: 'हम नए ऑर्डर अनुरोध एक कार्यदिवस के भीतर देखते हैं।' },
        { title: 'थोक सप्लाई सहायता', desc: 'डीलर, फार्म, कॉन्ट्रैक्टर और औद्योगिक खरीदारों के लिए उपयुक्त।' },
        { title: 'सीधी सहायता', desc: 'उत्पाद चुनने में मदद चाहिए? हमारी टीम से कभी भी बात करें।' }
      ],
      statNumber: '500+',
      statLabel: 'ऑर्डर और प्रोजेक्ट डिलीवरी में सहायता',
      checklist: ['RPE Pond Liners', 'Tarpaulin Solutions', 'HDPE / PP Bags', 'Poultry Curtains'],
      processBadge: 'कैसे काम करता है',
      processTitle: 'सरल ऑर्डर प्रक्रिया',
      steps: [
        { title: 'अपनी आवश्यकता भेजें', desc: 'फॉर्म में उत्पाद, मात्रा और डिलीवरी विवरण भरें।' },
        { title: 'कन्फर्मेशन पाएं', desc: 'हमारी टीम आपसे कीमत, स्टॉक उपलब्धता और डिस्पैच समय के साथ संपर्क करेगी।' },
        { title: 'फाइनल करें और प्राप्त करें', desc: 'ऑर्डर कन्फर्म करें और हम सप्लाई या इंस्टॉलेशन समन्वय में मदद करेंगे।' }
      ],
      supportTitle: 'ऑर्डर से पहले मदद चाहिए?',
      supportText: 'यदि आप product size, GSM, thickness या quantity को लेकर sure नहीं हैं, तो हमारी टीम से बात करें।',
      supportButtons: ['कॉल करें +91 7972345360', 'उत्पाद देखें'],
      formBadge: 'ऑर्डर अनुरोध',
      formTitle: 'अपनी आवश्यकता बताएं',
      formIntro: 'फॉर्म भरें, हमारी टीम अगले स्टेप्स के साथ आपसे संपर्क करेगी।',
      formLabels: ['पूरा नाम *', 'फोन नंबर *', 'उत्पाद *', 'मात्रा *', 'शहर *', 'राज्य', 'डिलीवरी पता *', 'अतिरिक्त आवश्यकता'],
      placeholders: [
        'अपना पूरा नाम दर्ज करें',
        'अपना फोन नंबर दर्ज करें',
        'उदाहरण: 500 sq ft / 100 bags',
        'अपना शहर दर्ज करें',
        'अपना राज्य दर्ज करें',
        'डिलीवरी पता दर्ज करें',
        'साइज, thickness, color, dispatch timeline या कोई खास नोट लिखें'
      ],
      productOptions: [
        'उत्पाद चुनें',
        'RPE Pond Liner',
        'Agriculture Tarpaulin',
        'Fisheries और Water Storage के लिए Tarpaulin',
        'कवरिंग मटेरियल के लिए Tarpaulin',
        'Truck Tarpaulin',
        'HDPE और PP Bags',
        'Poultry Curtains'
      ],
      submit: 'ऑर्डर अनुरोध भेजें',
      sending: 'भेजा जा रहा है...',
      success: 'धन्यवाद! आपका ऑर्डर अनुरोध भेज दिया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।',
      note: 'यह पेज केवल आपका ऑर्डर अनुरोध लेता है। अंतिम कीमत और कन्फर्मेशन हमारी टीम समीक्षा के बाद साझा करेगी।',
      formErrors: {
        nameRequired: 'कृपया अपना पूरा नाम दर्ज करें।',
        phoneRequired: 'कृपया अपना फोन नंबर दर्ज करें।',
        productRequired: 'कृपया उत्पाद चुनें।',
        quantityRequired: 'कृपया आवश्यक मात्रा दर्ज करें।',
        cityRequired: 'कृपया अपना शहर दर्ज करें।',
        addressRequired: 'कृपया डिलीवरी पता दर्ज करें।'
      }
    },
    services: {
      title: 'सभी सेवाएं | A1 Enterprise',
      description: 'A1 Enterprise – RPE Pond Liner, Tarpaulin, HDPE/PP Bags, Poultry Curtains और अन्य उत्पाद।',
      backToHome: 'होम पर वापस जाएं',
      heroBadge: 'हमारी उत्पाद श्रृंखला',
      heroTitle: 'सभी सेवाएं और उत्पाद',
      heroSubtitle: 'RPE pond liner, tarpaulin, truck tarpaulin, HDPE / PP bags और poultry curtains उचित दरों पर उपलब्ध हैं, साथ में चुनिंदा उत्पादों पर इंस्टॉलेशन सहायता भी मिलती है।',
      addPhoto: 'उत्पाद फोटो जोड़ें',
      orderCta: 'किसी भी उत्पाद के लिए ऑर्डर करें',
      cards: [
        { title: 'RPE Pond Liner', chip: 'इंस्टॉलेशन उपलब्ध' },
        { title: 'Agriculture Tarpaulin', chip: 'IS 15351' },
        { title: 'Fisheries और Water Storage के लिए Tarpaulin', chip: 'जल भंडारण' },
        { title: 'कवरिंग मटेरियल के लिए Tarpaulin', chip: 'मटेरियल कवरिंग' },
        { title: 'Truck Tarpaulin', chip: 'सभी साइज' },
        { title: 'HDPE और PP Bags', chip: 'थोक सप्लाई' },
        { title: 'Poultry Curtains', chip: 'पोल्ट्री उपयोग' }
      ]
    }
  }
};

function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
}

function setStoredLanguage(language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

function getCurrentPage() {
  return document.body.dataset.page || 'home';
}

function getLanguageBundle(language) {
  return LANGUAGE_CONTENT[language] || LANGUAGE_CONTENT.en;
}

function setElementText(element, text) {
  if (!element || typeof text !== 'string') return;

  const textNode = Array.from(element.childNodes).find(function (node) {
    return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
  });

  if (textNode) {
    textNode.textContent = ' ' + text + ' ';
  } else {
    element.textContent = text;
  }
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function setHTML(selector, html) {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = html;
}

function setAttr(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function setTextList(selector, texts) {
  const elements = document.querySelectorAll(selector);
  texts.forEach(function (text, index) {
    if (elements[index]) elements[index].textContent = text;
  });
}

function setElementTextList(selector, texts) {
  const elements = document.querySelectorAll(selector);
  texts.forEach(function (text, index) {
    if (elements[index]) setElementText(elements[index], text);
  });
}

function applySharedTranslations(bundle) {
  const shared = bundle.shared;

  document.documentElement.lang = getStoredLanguage() === 'hi' ? 'hi' : 'en';

  document.querySelectorAll('.language-switcher').forEach(function (switcher) {
    switcher.setAttribute('aria-label', shared.switcherAria);
  });

  document.querySelectorAll('.lang-btn').forEach(function (button) {
    const isActive = button.dataset.lang === getStoredLanguage();
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  setAttr('#back-to-top', 'aria-label', shared.backToTop);
  setTextList('.logo-tagline', [shared.logoTagline, shared.logoTagline]);
  setTextList('.nav-link', shared.nav);
  setElementTextList('.btn-call', [shared.callNow]);
  setElementTextList('.btn-quote', [shared.getQuote]);
  setAttr('#gallery-prev', 'aria-label', shared.previousImage);
  setAttr('#gallery-next', 'aria-label', shared.nextImage);
  setAttr('#prev-btn', 'aria-label', shared.previousTestimonial);
  setAttr('#next-btn', 'aria-label', shared.nextTestimonial);
  document.querySelectorAll('.modal-close').forEach(function (button) {
    button.setAttribute('aria-label', shared.close);
  });
  document.querySelectorAll('.btn-view-details').forEach(function (button) {
    setElementText(button, shared.viewDetails);
  });
  document.querySelectorAll('.modal-cta').forEach(function (link) {
    setElementText(link, shared.askQuote);
  });
}

function applyHomeTranslations(bundle) {
  const home = bundle.home;

  document.title = home.title;
  setAttr('meta[name="description"]', 'content', home.description);

  setText('.hero-badge span', home.heroBadge);
  setText('.title-highlight', home.heroHighlight);
  setText('.hero-subtitle', home.heroSubtitle);
  setElementTextList('.hero-buttons .btn', home.heroButtons);
  setTextList('.hero-stats .stat-label', home.heroStats);
  setText('.scroll-indicator span', home.scrollDown);

  setText('#about .section-badge', home.about.badge);
  setText('#about .section-title', home.about.title);
  setText('#about .section-subtitle', home.about.subtitle);
  setText('.about-img-placeholder p', home.about.brandIdentity);
  setTextList('.about-stat-card .as-label', home.about.statLabels);
  setText('.about-content .section-badge', home.about.storyBadge);
  setHTML('.about-content h2', home.about.storyTitle);
  setText('.about-desc', home.about.storyDesc);
  setTextList('.about-detail-text', home.about.detailTexts || []);
  setText('.about-team-title', home.about.teamTitle || '');
  setText('.about-team-intro', home.about.teamIntro || '');
  setTextList('.about-team-roles li', home.about.teamRoles || []);
  setText('.about-team-outro', home.about.teamOutro || '');
  setText('.mission-vision .mv-card:nth-child(1) h4', home.about.missionTitle);
  setText('.mission-vision .mv-card:nth-child(1) p', home.about.missionDesc);
  setText('.mission-vision .mv-card:nth-child(2) h4', home.about.visionTitle);
  setText('.mission-vision .mv-card:nth-child(2) p', home.about.visionDesc);
  setText('.values-title', home.about.valuesTitle);
  setElementTextList('.value-tag', home.about.values);
  setElementText(document.querySelector('.about-content .btn.btn-primary'), home.about.workWithUs);

  setText('#services .section-badge', home.services.badge);
  setText('#services .section-title', home.services.title);
  setText('#services .section-subtitle', home.services.subtitle);
  setTextList('.service-card-cover-placeholder span', Array(7).fill(home.services.addPhoto));
  document.querySelectorAll('#services .service-card').forEach(function (card, index) {
    const content = home.services.cards[index];
    if (!content) return;
    const title = card.querySelector('h3');
    const meta = card.querySelectorAll('.service-meta span');
    if (title) title.textContent = content.title;
    if (meta[0]) meta[0].textContent = content.price;
    if (meta[1]) meta[1].textContent = content.chip;
  });
  setText('.view-all-label', home.services.viewAll);

  setText('.why-us .section-badge', home.why.badge);
  setText('.why-us .section-title', home.why.title);
  setText('.why-us .section-subtitle', home.why.subtitle);
  setText('.why-intro', home.why.intro || '');
  document.querySelectorAll('.why-card').forEach(function (card, index) {
    const content = home.why.cards[index];
    if (!content) return;
    const title = card.querySelector('h3');
    const desc = card.querySelector('p');
    if (title) title.textContent = content.title;
    if (desc) desc.textContent = content.desc;
  });

  setText('#industries .section-badge', home.industries.badge);
  setText('#industries .section-title', home.industries.title);
  setText('#industries .section-subtitle', home.industries.subtitle);
  document.querySelectorAll('.industry-card').forEach(function (card, index) {
    const content = home.industries.cards[index];
    if (!content) return;
    const title = card.querySelector('h3');
    const desc = card.querySelector('p');
    if (title) title.textContent = content.title;
    if (desc) desc.textContent = content.desc;
  });

  setText('#projects .section-badge', home.projects.badge);
  setText('#projects .section-title', home.projects.title);
  setText('#projects .section-subtitle', home.projects.subtitle);

  setText('#testimonials .section-badge', home.testimonials.badge);
  setText('#testimonials .section-title', home.testimonials.title);
  setText('#testimonials .section-subtitle', home.testimonials.subtitle);

  setText('#contact .section-badge', home.contact.badge);
  setText('#contact .section-title', home.contact.title);
  setText('#contact .section-subtitle', home.contact.subtitle);
  setText('.contact-info h3', home.contact.introTitle);
  setText('.contact-info > p', home.contact.introText);
  setTextList('.contact-item strong', home.contact.infoTitles);
  const contactSpans = document.querySelectorAll('.contact-detail span');
  if (contactSpans[3]) contactSpans[3].innerHTML = home.contact.workingHours;
  setTextList('label[for="name"], label[for="email"], label[for="phone"], label[for="subject"], label[for="message"]', home.contact.formLabels);
  setAttr('#name', 'placeholder', home.contact.placeholders[0]);
  setAttr('#email', 'placeholder', home.contact.placeholders[1]);
  setAttr('#phone', 'placeholder', home.contact.placeholders[2]);
  setAttr('#subject', 'placeholder', home.contact.placeholders[3]);
  setAttr('#message', 'placeholder', home.contact.placeholders[4]);
  setElementText(document.querySelector('.btn-submit'), home.contact.submit);
  setElementText(document.querySelector('#success-message'), home.contact.success);

  const footerLinksGroups = document.querySelectorAll('.footer-links');
  const footerHeadings = document.querySelectorAll('.footer-col h4');
  if (footerHeadings[0]) footerHeadings[0].textContent = home.footer.headings[0];
  if (footerHeadings[1]) footerHeadings[1].textContent = home.footer.headings[1];
  if (footerHeadings[2]) footerHeadings[2].textContent = home.footer.headings[2];
  if (footerLinksGroups[0]) {
    const links = footerLinksGroups[0].querySelectorAll('a');
    home.footer.serviceLinks.forEach(function (text, index) {
      if (links[index]) links[index].textContent = text;
    });
  }
  if (footerLinksGroups[1]) {
    const links = footerLinksGroups[1].querySelectorAll('a');
    home.footer.quickLinks.forEach(function (text, index) {
      if (links[index]) links[index].textContent = text;
    });
  }
  setText('.footer-brand p', home.footer.brandDesc);
  const footerContactItems = document.querySelectorAll('.footer-contact li span');
  if (footerContactItems[3]) footerContactItems[3].textContent = home.footer.hours;
  setText('.footer-bottom p', home.footer.copyright);
  setTextList('.footer-bottom-links a', home.footer.bottomLinks);

  document.querySelectorAll('.service-modal').forEach(function (modal, index) {
    const content = home.serviceModals[index];
    if (!content) return;
    const title = modal.querySelector('h2');
    const meta = modal.querySelectorAll('.service-meta span');
    const desc = modal.querySelector('.modal-desc');
    const features = modal.querySelectorAll('.modal-features li');
    if (title) title.textContent = content.title;
    if (meta[1]) meta[1].textContent = content.chip;
    if (desc) desc.textContent = content.desc;
    content.features.forEach(function (feature, featureIndex) {
      if (features[featureIndex]) features[featureIndex].textContent = feature;
    });
  });
}

function applyServicesTranslations(bundle) {
  const services = bundle.services;
  const shared = bundle.shared;
  const homeModals = bundle.home.serviceModals;

  document.title = services.title;
  setAttr('meta[name="description"]', 'content', services.description);

  setElementText(document.querySelector('.services-back-link'), services.backToHome);
  setText('.services-page-hero .section-badge', services.heroBadge);
  setText('.services-page-hero .section-title', services.heroTitle);
  setText('.services-page-hero .section-subtitle', services.heroSubtitle);
  setElementText(document.querySelector('.services-order-cta'), services.orderCta);
  setTextList('.service-card-cover-placeholder span', Array(6).fill(services.addPhoto));

  document.querySelectorAll('.services-grid .service-card').forEach(function (card, index) {
    const content = services.cards[index];
    if (!content) return;
    const title = card.querySelector('h3');
    const meta = card.querySelectorAll('.service-meta span');
    if (title) title.textContent = content.title;
    if (meta[1]) meta[1].textContent = content.chip;
  });

  document.querySelectorAll('.service-modal').forEach(function (modal, index) {
    const content = homeModals[index];
    if (!content) return;
    const title = modal.querySelector('h2');
    const meta = modal.querySelectorAll('.service-meta span');
    const desc = modal.querySelector('.modal-desc');
    const features = modal.querySelectorAll('.modal-features li');
    if (title) title.textContent = content.title;
    if (meta[1]) meta[1].textContent = content.chip;
    if (desc) desc.textContent = content.desc;
    content.features.forEach(function (feature, featureIndex) {
      if (features[featureIndex]) features[featureIndex].textContent = feature;
    });
  });

  document.querySelectorAll('.modal-cta').forEach(function (link) {
    setElementText(link, shared.askQuote);
  });
}

function applyOrderTranslations(bundle) {
  const order = bundle.order;

  document.title = order.title;
  setAttr('meta[name="description"]', 'content', order.description);

  setElementText(document.querySelector('.services-back-link'), order.backToHome);
  setElementText(document.querySelector('.btn-quote'), order.navButton);
  setText('.order-page-hero .section-badge', order.heroBadge);
  setText('.order-page-hero .section-title', order.heroTitle);
  setText('.order-page-hero .section-subtitle', order.heroSubtitle);
  setText('.order-hero-stat-number', order.statNumber);
  setText('.order-hero-stat-label', order.statLabel);
  setTextList('.order-hero-checklist li', order.checklist);

  document.querySelectorAll('.order-highlight-card').forEach(function (card, index) {
    const content = order.highlights[index];
    if (!content) return;
    const title = card.querySelector('strong');
    const desc = card.querySelector('span');
    if (title) title.textContent = content.title;
    if (desc) desc.textContent = content.desc;
  });

  setText('.order-info-card .section-badge', order.processBadge);
  setText('.order-info-card h2', order.processTitle);
  document.querySelectorAll('.order-step').forEach(function (step, index) {
    const content = order.steps[index];
    if (!content) return;
    const title = step.querySelector('h3');
    const desc = step.querySelector('p');
    if (title) title.textContent = content.title;
    if (desc) desc.textContent = content.desc;
  });

  setText('.order-support-card h3', order.supportTitle);
  setText('.order-support-card p', order.supportText);
  setElementText(document.querySelector('.order-support-actions .btn-call'), order.supportButtons[0]);
  setElementText(document.querySelector('.order-support-actions .btn-outline-hero'), order.supportButtons[1]);

  setText('.order-form-head .section-badge', order.formBadge);
  setText('.order-form-head h2', order.formTitle);
  setText('.order-form-head p', order.formIntro);
  setTextList(
    'label[for="order-name"], label[for="order-phone"], label[for="order-product"], label[for="order-quantity"], label[for="order-city"], label[for="order-state"], label[for="order-address"], label[for="order-notes"]',
    order.formLabels
  );
  setAttr('#order-name', 'placeholder', order.placeholders[0]);
  setAttr('#order-phone', 'placeholder', order.placeholders[1]);
  setAttr('#order-quantity', 'placeholder', order.placeholders[2]);
  setAttr('#order-city', 'placeholder', order.placeholders[3]);
  setAttr('#order-state', 'placeholder', order.placeholders[4]);
  setAttr('#order-address', 'placeholder', order.placeholders[5]);
  setAttr('#order-notes', 'placeholder', order.placeholders[6]);
  document.querySelectorAll('#order-product option').forEach(function (option, index) {
    if (typeof order.productOptions[index] === 'string') option.textContent = order.productOptions[index];
  });
  setElementText(document.querySelector('.order-submit-btn'), order.submit);
  setElementText(document.querySelector('#order-success-message'), order.success);
  setText('.order-form-note', order.note);
}

function applyLanguage(language) {
  setStoredLanguage(language);
  const bundle = getLanguageBundle(language);
  applySharedTranslations(bundle);

  if (getCurrentPage() === 'services') {
    applyServicesTranslations(bundle);
  } else if (getCurrentPage() === 'order') {
    applyOrderTranslations(bundle);
  } else {
    applyHomeTranslations(bundle);
  }
}

(function initLanguageSwitcher() {
  const buttons = document.querySelectorAll('.lang-btn');
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyLanguage(button.dataset.lang || 'en');
    });
  });

  applyLanguage(getStoredLanguage());
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
    const shared = getLanguageBundle(getStoredLanguage()).shared;

    // Get field values (trimmed)
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Clear all previous errors
    ['name', 'email', 'subject', 'message'].forEach(clearError);

    // Validate: Full Name
    if (!name) {
      showError('name', shared.formErrors.nameRequired);
      isValid = false;
    } else if (name.length < 2) {
      showError('name', shared.formErrors.nameShort);
      isValid = false;
    }

    // Validate: Email
    if (!email) {
      showError('email', shared.formErrors.emailRequired);
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('email', shared.formErrors.emailInvalid);
      isValid = false;
    }

    // Validate: Subject
    if (!subject) {
      showError('subject', shared.formErrors.subjectRequired);
      isValid = false;
    }

    // Validate: Message
    if (!message) {
      showError('message', shared.formErrors.messageRequired);
      isValid = false;
    } else if (message.length < 10) {
      showError('message', shared.formErrors.messageShort);
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
    const shared = getLanguageBundle(getStoredLanguage()).shared;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      ${shared.formSending}
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
   9. ORDER FORM VALIDATION & SUBMISSION
   - Validates the basic order request fields
   - Shows success feedback after simulated submission
   ============================================================ */
(function initOrderForm() {
  const form = document.getElementById('order-form');
  const successMessage = document.getElementById('order-success-message');

  if (!form) return;

  function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');
  }

  function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + '-error');
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('error');
  }

  function validateForm() {
    let isValid = true;
    const orderContent = getLanguageBundle(getStoredLanguage()).order;

    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const product = document.getElementById('order-product').value.trim();
    const quantity = document.getElementById('order-quantity').value.trim();
    const city = document.getElementById('order-city').value.trim();
    const address = document.getElementById('order-address').value.trim();

    ['order-name', 'order-phone', 'order-product', 'order-quantity', 'order-city', 'order-address'].forEach(clearError);

    if (!name) {
      showError('order-name', orderContent.formErrors.nameRequired);
      isValid = false;
    }

    if (!phone) {
      showError('order-phone', orderContent.formErrors.phoneRequired);
      isValid = false;
    }

    if (!product) {
      showError('order-product', orderContent.formErrors.productRequired);
      isValid = false;
    }

    if (!quantity) {
      showError('order-quantity', orderContent.formErrors.quantityRequired);
      isValid = false;
    }

    if (!city) {
      showError('order-city', orderContent.formErrors.cityRequired);
      isValid = false;
    }

    if (!address) {
      showError('order-address', orderContent.formErrors.addressRequired);
      isValid = false;
    }

    return isValid;
  }

  ['order-name', 'order-phone', 'order-product', 'order-quantity', 'order-city', 'order-address'].forEach(function (fieldId) {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;

    const eventName = inputEl.tagName === 'SELECT' ? 'change' : 'input';
    inputEl.addEventListener(eventName, function () {
      clearError(fieldId);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const submitBtn = form.querySelector('.order-submit-btn');
    const originalBtnHTML = submitBtn.innerHTML;
    const orderContent = getLanguageBundle(getStoredLanguage()).order;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      ${orderContent.sending}
    `;

    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      if (successMessage) {
        successMessage.style.display = 'flex';
        setTimeout(function () {
          successMessage.style.display = 'none';
        }, 6000);
      }

      ['order-name', 'order-phone', 'order-product', 'order-quantity', 'order-city', 'order-address'].forEach(clearError);
      applyLanguage(getStoredLanguage());
    }, 1500);
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
