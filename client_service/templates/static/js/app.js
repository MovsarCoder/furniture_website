// Smooth scroll for navigation links
(function(){
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if(targetElement) {
        const navbar = document.querySelector('.navbar');
        const navH = navbar ? navbar.offsetHeight : 84;
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navH;
        
        // Плавная прокрутка
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
})();

// Parallax effect removed - keeping hero section static

// Enhanced hover effects for cards
(function(){
  if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
  const cards = document.querySelectorAll('.card, .feature, .review, .branch');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.5)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '';
    });
  });
})();

// Optional image fade-in animation.
// Apply only to images explicitly marked with data-fade-in
// to avoid delaying LCP and accidental invisible cached images.
(function(){
  const images = document.querySelectorAll('img[data-fade-in]');
  if (!images.length) return;

  const reveal = (img) => {
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  };

  images.forEach((img) => {
    img.style.opacity = '0';
    img.style.transform = 'scale(0.98)';
    img.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

    if (img.complete) {
      reveal(img);
      return;
    }

    img.addEventListener('load', () => reveal(img), { once: true });
    img.addEventListener('error', () => reveal(img), { once: true });
  });
})();

// Premium stats count-up animation
(function(){
  const counters = document.querySelectorAll('#stats [data-count-up]');
  if (!counters.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const locale = document.documentElement.lang || undefined;
  const formatter = new Intl.NumberFormat(locale);

  const renderValue = (el, value) => {
    const prefix = el.dataset.countPrefix || '';
    const suffix = el.dataset.countSuffix || '';
    el.textContent = `${prefix}${formatter.format(value)}${suffix}`;
  };

  const animateCounter = (el) => {
    const target = Number(el.dataset.countTo || 0);
    const startValue = Number(el.dataset.countFrom || 0);
    const duration = Number(el.dataset.countDuration || 1400);

    if (!Number.isFinite(target)) {
      renderValue(el, 0);
      return;
    }

    if (prefersReducedMotion || duration <= 0) {
      renderValue(el, Math.round(target));
      return;
    }

    const startTs = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValue + (target - startValue) * eased);
      renderValue(el, value);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const revealCounter = (el) => {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    animateCounter(el);
  };

  counters.forEach((counter) => {
    renderValue(counter, Number(counter.dataset.countFrom || 0));
  });

  if (!('IntersectionObserver' in window)) {
    counters.forEach(revealCounter);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => observer.observe(counter));
})();

// Navbar scroll effect for sticky navbar — REFACTORED
(function(){
  const navbar = document.querySelector('.navbar');
  if(!navbar) return;

  let ticking = false;

  function updateNavbar() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', updateNavbar);
  updateNavbar(); // Initialize on load
})();

// Enhanced Reviews carousel functionality with modern features
(function(){
  const reviewsTrack = document.querySelector('.reviews-track');
  const reviews = document.querySelectorAll('.review-card');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');

  if(!reviewsTrack || !reviews.length) return;

  let currentIndex = 0;
  let reviewsPerView = getReviewsPerView();
  let maxIndex = Math.max(0, reviews.length - reviewsPerView);
  let autoplayInterval = null;
  let isHovered = false;
  let isDragging = false;
  let hasDragged = false;
  let startX = 0;
  let currentX = 0;
  let initialTransform = 0;

  function getReviewsPerView() {
    const width = window.innerWidth;
    if (width > 1200) return Math.min(3, reviews.length);
    if (width > 768) return Math.min(2, reviews.length);
    return 1;
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const dotsCount = Math.ceil(reviews.length / reviewsPerView);
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.dot');
    const currentDot = Math.floor(currentIndex / reviewsPerView);
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentDot);
    });
  }

  function updateCarousel() {
    const translateX = -currentIndex * (100 / reviewsPerView);
    reviewsTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update navigation buttons
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    
    updateDots();
  }

  function goToSlide(slideIndex) {
    currentIndex = Math.max(0, Math.min(slideIndex * reviewsPerView, maxIndex));
    updateCarousel();
    resetAutoplay();
  }

  function next() {
    if(currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop back to start
    }
    updateCarousel();
  }

  function prev() {
    if(currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = maxIndex; // Loop to end
    }
    updateCarousel();
  }

  function startAutoplay() {
    // Clear any existing interval first
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    
    // Only start autoplay if not hovered and there are multiple slides
    if (!isHovered && reviews.length > reviewsPerView) {
      autoplayInterval = setInterval(() => {
        if (!isHovered && !isDragging) {
          next();
        }
      }, 4000); // Fixed interval - no acceleration
    }
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    // Small delay before restarting to prevent immediate restart
    setTimeout(() => {
      if (!isHovered) {
        startAutoplay();
      }
    }, 100);
  }

  // Touch/Mouse drag functionality
  function handleStart(e) {
    isDragging = true;
    hasDragged = false;
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY; // Store initial Y position
    currentX = startX;
    initialTransform = currentIndex * (100 / reviewsPerView);
    reviewsTrack.style.transition = 'none';
    stopAutoplay();
  }

  function handleMove(e) {
    if (!isDragging) return;
    
    // Only prevent default when we're definitely dragging horizontally
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    const diffX = Math.abs(clientX - startX);
    const diffY = Math.abs(clientY - startY);
    
    // Only prevent default if horizontal movement is greater than vertical
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
    
    currentX = clientX;
    const moveDiffX = currentX - startX;
    const percentage = (moveDiffX / reviewsTrack.offsetWidth) * 100;
    const newTransform = -initialTransform - percentage;
    
    reviewsTrack.style.transform = `translateX(${newTransform}%)`;
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const diffX = currentX - startX;
    const threshold = 50; // Minimum drag distance to trigger slide change
    
    reviewsTrack.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentIndex > 0) {
        prev();
      } else if (diffX < 0 && currentIndex < maxIndex) {
        next();
      } else {
        updateCarousel(); // Snap back
      }
    } else {
      updateCarousel(); // Snap back
    }
    
    startAutoplay();
  }

  // Event listeners
  prevBtn?.addEventListener('click', () => { prev(); resetAutoplay(); });
  nextBtn?.addEventListener('click', () => { next(); resetAutoplay(); });

  // Touch events
  reviewsTrack.addEventListener('touchstart', handleStart, { passive: false });
  reviewsTrack.addEventListener('touchmove', handleMove, { passive: false });
  reviewsTrack.addEventListener('touchend', handleEnd);

  // Mouse events
  reviewsTrack.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);

  // Prevent context menu on long press
  reviewsTrack.addEventListener('contextmenu', e => e.preventDefault());

  // Proper hover handling - stop autoplay when hovering over the entire reviews section
  const reviewsSection = reviewsTrack.closest('.reviews');
  if (reviewsSection) {
    reviewsSection.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });
    
    reviewsSection.addEventListener('mouseleave', () => {
      isHovered = false;
      resetAutoplay();
    });
  }

  // Handle helpful button clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.helpful-btn')) {
      const btn = e.target.closest('.helpful-btn');
      const countEl = btn.querySelector('.helpful-count');
      if (countEl) {
        const currentCount = parseInt(countEl.textContent.match(/\d+/)[0]);
        countEl.textContent = `(${currentCount + 1})`;
        btn.style.color = 'var(--brand)';
        btn.style.transform = 'scale(1.05)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 200);
      }
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newReviewsPerView = getReviewsPerView();
      if (newReviewsPerView !== reviewsPerView) {
        reviewsPerView = newReviewsPerView;
        maxIndex = Math.max(0, reviews.length - reviewsPerView);
        currentIndex = Math.min(currentIndex, maxIndex);
        createDots();
        updateCarousel();
      }
    }, 250);
  });

  // Initialize
  createDots();
  updateCarousel();
  startAutoplay();

  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAutoplay();
      } else {
        stopAutoplay();
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(reviewsTrack);
})();

(function(){
  const carousel = document.querySelector('[data-carousel="home"]');
  if (!carousel) return;

  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-track');
  const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const prevNumEl = carousel.querySelector('[data-carousel-prev-num]');
  const nextNumEl = carousel.querySelector('[data-carousel-next-num]');
  const dotsContainer = carousel.querySelector('[data-carousel-dots]');

  if (!viewport || !track || originalSlides.length === 0) return;

  const total = originalSlides.length;
  const transitionValue = "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
  const cloneCopiesEachSide = total > 1 ? 3 : 0;
  const startRealIndex = total > 1 ? Math.floor((total - 1) / 2) : 0;
  let allSlides = [];
  let currentIndex = 0;
  let autoplayInterval = null;
  let resizeTimeout = null;
  let isHovered = false;
  let isDragging = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let startTranslate = 0;
  let currentTranslate = 0;

  originalSlides.forEach((slide, i) => {
    slide.dataset.realIndex = String(i);
  });

  function normalizeRealIndex(value) {
    if (!total) return 0;
    return ((value % total) + total) % total;
  }

  function setTrackTransition(animate) {
    track.style.setProperty(
      "transition",
      animate ? transitionValue : "none",
      "important"
    );
  }

  function buildInfiniteTrack() {
    track.querySelectorAll('[data-clone="true"]').forEach((clone) => clone.remove());

    if (total <= 1) {
      allSlides = [...originalSlides];
      currentIndex = 0;
      return;
    }

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();

    for (let copy = 0; copy < cloneCopiesEachSide; copy++) {
      originalSlides.forEach((slide, i) => {
        const cloneBefore = slide.cloneNode(true);
        cloneBefore.dataset.clone = "true";
        cloneBefore.dataset.realIndex = String(i);
        before.appendChild(cloneBefore);
      });
    }

    for (let copy = 0; copy < cloneCopiesEachSide; copy++) {
      originalSlides.forEach((slide, i) => {
        const cloneAfter = slide.cloneNode(true);
        cloneAfter.dataset.clone = "true";
        cloneAfter.dataset.realIndex = String(i);
        after.appendChild(cloneAfter);
      });
    }

    track.insertBefore(before, track.firstChild);
    track.appendChild(after);

    allSlides = Array.from(track.querySelectorAll(".carousel-slide"));
    currentIndex = startRealIndex + total * cloneCopiesEachSide;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getMaxTranslate() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function getTranslateFor(i) {
    const slide = allSlides[i];
    if (!slide) return 0;
    const target = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    return clamp(target, 0, getMaxTranslate());
  }

  function applyTranslate(value, animate) {
    currentTranslate = clamp(value, 0, getMaxTranslate());
    setTrackTransition(animate);
    track.style.transform = `translateX(-${currentTranslate}px)`;
  }

  function getRealIndex(i) {
    const slide = allSlides[i];
    const raw = slide ? Number(slide.dataset.realIndex) : 0;
    return Number.isFinite(raw) ? normalizeRealIndex(raw) : 0;
  }

  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `carousel-dot ${i === startRealIndex ? "active" : ""}`;
      dot.addEventListener("click", () => goToReal(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const realIndex = getRealIndex(currentIndex);
    const dots = dotsContainer.querySelectorAll(".carousel-dot");

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === realIndex);
    });
  }

  function updateSlideStates() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    allSlides.forEach((slide) => {
      slide.classList.remove("active-slide", "inactive-slide");
    });

    const activeSlide = allSlides[currentIndex];
    if (activeSlide) {
      activeSlide.classList.add("active-slide");
    }

    if (!isMobile) {
      const prevSlide = allSlides[currentIndex - 1];
      const nextSlide = allSlides[currentIndex + 1];
      prevSlide?.classList.add("inactive-slide");
      nextSlide?.classList.add("inactive-slide");
    }
  }

  function normalizeInfinitePosition() {
    if (total <= 1) return;

    const centerStart = total * cloneCopiesEachSide;
    const centerEnd = centerStart + total - 1;
    let normalizedIndex = currentIndex;

    while (normalizedIndex > centerEnd) {
      normalizedIndex -= total;
    }
    while (normalizedIndex < centerStart) {
      normalizedIndex += total;
    }

    if (normalizedIndex !== currentIndex) {
      currentIndex = normalizedIndex;
      applyTranslate(getTranslateFor(currentIndex), false);
      updateSlideStates();
    }
  }

  function keepIndexInRenderedRange() {
    if (total <= 1) return;
    const maxRenderedIndex = allSlides.length - 1;
    while (currentIndex > maxRenderedIndex) {
      currentIndex -= total;
    }
    while (currentIndex < 0) {
      currentIndex += total;
    }
  }

  function update(animate = true) {
    keepIndexInRenderedRange();
    applyTranslate(getTranslateFor(currentIndex), animate);
    updateSlideStates();
    updateDots();

    const realIndex = getRealIndex(currentIndex);
    if (prevNumEl) {
      prevNumEl.textContent = String(((realIndex - 1 + total) % total) + 1);
    }
    if (nextNumEl) {
      nextNumEl.textContent = String(((realIndex + 1) % total) + 1);
    }

    if (!animate) {
      normalizeInfinitePosition();
    }
  }

  function moveBy(delta) {
    if (total <= 1) return;
    currentIndex += delta;
    update(true);
    resetAutoplay();
  }

  function goToReal(realTarget) {
    if (total <= 1) return;

    const target = normalizeRealIndex(realTarget);
    const currentReal = getRealIndex(currentIndex);
    let delta = target - currentReal;

    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;

    currentIndex += delta;
    update(true);
    resetAutoplay();
  }

  function next() {
    moveBy(1);
  }

  function prev() {
    moveBy(-1);
  }

  function startAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    if (total <= 1) return;

    autoplayInterval = setInterval(() => {
      if (!isHovered && !isDragging) next();
    }, 4500);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    setTimeout(() => {
      if (!isHovered) startAutoplay();
    }, 120);
  }

  function handleStart(e) {
    const point = e.type === "mousedown" ? e : e.touches[0];
    isDragging = true;
    hasDragged = false;
    startX = point.clientX;
    startY = point.clientY;
    currentX = startX;
    startTranslate = currentTranslate;
    applyTranslate(currentTranslate, false);
    stopAutoplay();
  }

  function handleMove(e) {
    if (!isDragging) return;
    const point = e.type === "mousemove" ? e : e.touches[0];
    const diffX = point.clientX - startX;
    const diffY = point.clientY - startY;
    if (Math.abs(diffX) > 6) {
      hasDragged = true;
    }

    if (e.type === "touchmove" && Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
    }

    currentX = point.clientX;
    applyTranslate(startTranslate - diffX, false);
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    const diff = currentX - startX;
    const threshold = Math.min(96, viewport.clientWidth * 0.16);

    if (Math.abs(diff) > threshold) {
      diff < 0 ? next() : prev();
    } else {
      update();
    }

    startAutoplay();
    setTimeout(() => {
      hasDragged = false;
    }, 0);
  }

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  track.addEventListener("click", (e) => {
    if (isDragging || hasDragged) return;
    const slide = e.target.closest(".carousel-slide");
    if (!slide) return;
    const realIndex = Number(slide.dataset.realIndex);
    if (!Number.isFinite(realIndex)) return;
    goToReal(realIndex);
  });

  carousel.addEventListener("mouseenter", () => {
    isHovered = true;
    stopAutoplay();
  });

  carousel.addEventListener("mouseleave", () => {
    isHovered = false;
    resetAutoplay();
  });

  track.addEventListener("touchstart", handleStart, { passive: false });
  track.addEventListener("touchmove", handleMove, { passive: false });
  track.addEventListener("touchend", handleEnd);
  track.addEventListener("touchcancel", handleEnd);
  track.addEventListener("mousedown", handleStart);
  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", handleEnd);
  track.addEventListener("contextmenu", (e) => e.preventDefault());
  track.addEventListener("transitionend", (e) => {
    if (e.target !== track || e.propertyName !== "transform") return;
    normalizeInfinitePosition();
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      update(false);
    }, 160);
  });

  const gettext = window.gettext || function(key) { return key; };
  prevBtn?.setAttribute("aria-label", gettext("Previous photo"));
  nextBtn?.setAttribute("aria-label", gettext("Next photo"));
  track.setAttribute("role", "region");
  track.setAttribute("aria-label", gettext("Photo carousel"));

  buildInfiniteTrack();
  const slideImages = Array.from(track.querySelectorAll(".carousel-image, img"));

  createDots();
  update(false);
  startAutoplay();

  slideImages.forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", () => update(false));
      img.addEventListener("error", () => update(false));
    }
  });

  window.addEventListener("load", () => update(false), { once: true });
})();

// Mobile burger menu toggle with a11y
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if(!toggle || !nav) return;
  const furnitureItem = nav.querySelector('.nav-item');
  const furnitureToggle = furnitureItem ? furnitureItem.querySelector('.nav-parent-link') : null;

  function closeFurnitureSubmenu(){
    if(!furnitureItem || !furnitureToggle) return;
    furnitureItem.classList.remove('mobile-open');
    furnitureToggle.setAttribute('aria-expanded', 'false');
  }

  function setMenuState(opened){
    nav.classList.toggle('open', opened);
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    document.body.classList.toggle('menu-open', opened);

    if(opened){
      document.addEventListener('keydown', onEsc);
      const firstLink = nav.querySelector('a');
      firstLink && firstLink.focus();
      return;
    }

    closeFurnitureSubmenu();
    document.removeEventListener('keydown', onEsc);
  }

  function closeMenu(){
    setMenuState(false);
  }

  function onEsc(e){
    if(e.key === 'Escape') closeMenu();
  }

  toggle.addEventListener('click', ()=>{
    const opened = !nav.classList.contains('open');
    setMenuState(opened);
  });

  if (furnitureToggle && furnitureItem) {
    furnitureToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth > 768) return;
      const opened = furnitureItem.classList.toggle('mobile-open');
      furnitureToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  document.addEventListener('click', (e)=>{
    if(!nav.contains(e.target) && !toggle.contains(e.target)){
      closeMenu();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if(link.getAttribute('href') === '#') return;
      closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if(window.innerWidth > 768) closeMenu();
  });
})();

// Enhanced accessibility and keyboard navigation for reviews
(function(){
  const track = document.getElementById('reviewsTrack');
  const prev = document.getElementById('reviewsPrev');
  const next = document.getElementById('reviewsNext');
  
  if(!track) return;
  
  // Add keyboard navigation support
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('.reviews')) {
      if (e.key === 'ArrowLeft' && prev && !prev.disabled) {
        prev.click();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && next && !next.disabled) {
        next.click();
        e.preventDefault();
      }
    }
  });
  
  // Enhanced accessibility attributes
  const gettext = window.gettext || function(key) { return key; };
  if (prev) {
    prev.setAttribute('aria-controls', 'reviewsTrack');
    prev.setAttribute('aria-label', gettext('Previous review'));
  }
  if (next) {
    next.setAttribute('aria-controls', 'reviewsTrack');
    next.setAttribute('aria-label', gettext('Next review'));
  }
  
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', gettext('Customer reviews'));
})();

// ===== АКТИВНЫЕ ПУНКТЫ МЕНЮ ПРИ ПРОКРУТКЕ =====
(function(){
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  // Функция для определения активного раздела при прокрутке
  function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a');
    const homeLink = document.querySelector('.nav a[href$="#home"], .nav a[href="/"]');
    const scrollPos = window.scrollY + 100;
    
    // Убираем класс active у всех ссылок
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Если мы в самом верху страницы, активируем ссылку "Главная"
    if (window.scrollY < 100) {
      if (homeLink) {
        homeLink.classList.add('active');
      }
      return;
    }
    
    // Определяем текущий активный раздел
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        const sectionId = section.getAttribute('id');
        // Ищем ссылку, которая ведет к этому разделу
        const activeLink = document.querySelector(`.nav a[href$="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
        break;
      }
    }
    
    lastScrollY = window.scrollY;
    ticking = false;
  }
  
  // Оптимизированная функция для обработки прокрутки
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(setActiveNavLink);
      ticking = true;
    }
  }
  
  // Добавляем обработчик события прокрутки
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Вызываем функцию при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    // Немного задержим вызов, чтобы страница успела загрузиться
    setTimeout(setActiveNavLink, 100);
  });
  
  // Обработка кликов по навигационным ссылкам
  document.addEventListener('click', function(e) {
    const navLink = e.target.closest('.nav a');
    if (navLink) {
      // Убираем класс active у всех ссылок
      document.querySelectorAll('.nav a').forEach(link => {
        link.classList.remove('active');
      });
      
      // Добавляем класс active к кликнутой ссылке
      navLink.classList.add('active');
    }
  });
})();

// ===== ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ МОДАЛЬНОГО ОКНА =====

// Add scroll-triggered animations
(function() {
  const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
  if (!animatedElements.length) return;
  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
  });
})();
// Глобальная функция для открытия модального окна консультации
window.openConsultationModal = function() {
  const modal = document.getElementById('consultationModal');
  const form = document.getElementById('consultationForm');
  
  if (!modal || !form) {
    const gettext = window.gettext || function(key) { return key; };
    console.error(gettext('Consultation modal not found'));
    return;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Фокус на первое поле
  const firstInput = form.querySelector('input[name="name"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
  
};

// Функция быстрого просмотра работы
window.quickView = function(workId) {
  // Переход к детальной странице работы
  window.location.href = `/portfolio/${workId}/`;
};

// ===== МОДАЛЬНОЕ ОКНО КОНСУЛЬТАЦИИ =====
(function(){
  const modal = document.getElementById('consultationModal');
  const openBtn = document.getElementById('consultationBtn');
  const closeBtn = document.getElementById('modalClose');
  const backdrop = document.getElementById('modalBackdrop');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('consultationForm');
  const submitBtn = document.getElementById('submitBtn');
  const formResult = document.getElementById('formResult');
  
  if (!modal || !openBtn || !form) return;
  
  // Функции управления модальным окном
  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Фокус на первое поле
    const firstInput = form.querySelector('input[name="name"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearForm();
  }
  
  function clearForm() {
    form.reset();
    hideResult();
    clearErrors();
    resetSubmitButton();
  }
  
  function showResult(message, isSuccess = true) {
    formResult.textContent = message;
    formResult.className = `form-result ${isSuccess ? 'success' : 'error'}`;
    formResult.style.display = 'block';
  }
  
  function hideResult() {
    formResult.style.display = 'none';
  }
  
  function showError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('visible');
    }
  }
  
  function clearErrors() {
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => {
      error.classList.remove('visible');
      error.textContent = '';
    });
  }
  
  function setLoadingState(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.disabled = true;
    } else {
      btnText.style.display = 'flex';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }
  
  function resetSubmitButton() {
    setLoadingState(false);
  }
  
  // Validation functions
  function validateField(name, value) {
    const gettext = window.gettext || function(key) { return key; };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          showError('name', gettext('Please enter your name'));
          return false;
        }
        if (value.trim().length < 2) {
          showError('name', gettext('Name must be at least 2 characters'));
          return false;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          showError('phone', gettext('Please enter phone number'));
          return false;
        }
        // More flexible phone validation for international numbers
        const cleanPhone = value.replace(/[\s\(\)\-\+\.]/g, '');
        if (cleanPhone.length < 8 || cleanPhone.length > 15) {
          showError('phone', gettext('Please enter a valid phone number (8-15 digits)'));
          return false;
        }
        if (!/^[0-9]+$/.test(cleanPhone)) {
          showError('phone', gettext('Phone number must contain only digits'));
          return false;
        }
        break;
        
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError('email', gettext('Please enter a valid email address'));
          return false;
        }
        break;
    }
    return true;
  }
  
  function validateForm(formData) {
    clearErrors();
    hideResult();
    
    let isValid = true;
    
    // Проверяем обязательные поля
    if (!validateField('name', formData.get('name'))) isValid = false;
    if (!validateField('phone', formData.get('phone'))) isValid = false;
    if (!validateField('email', formData.get('email'))) isValid = false;
    
    return isValid;
  }
  
  // Обработчики событий
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  
  [closeBtn, backdrop, cancelBtn].forEach(element => {
    if (element) {
      element.addEventListener('click', closeModal);
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // Валидация в реальном времени
  ['name', 'phone', 'email'].forEach(fieldName => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.addEventListener('blur', () => {
        validateField(fieldName, field.value);
      });
      
      field.addEventListener('input', () => {
        // Убираем ошибку при вводе
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement && errorElement.classList.contains('visible')) {
          errorElement.classList.remove('visible');
        }
      });
    }
  });
  
  // Отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    if (!validateForm(formData)) {
      return;
    }
    
    setLoadingState(true);
    
    try {
      const response = await fetch('/admin_service/consultation-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          consultation_type: formData.get('consultation_type'),
          message: formData.get('message'),
          preferred_time: formData.get('preferred_time')
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showResult(data.message, true);
        form.reset();
        
        // Автоматически закрываем модальное окно через 3 секунды
        setTimeout(() => {
          closeModal();
        }, 3000);
        
      } else {
        const gettext = window.gettext || function(key) { return key; };
        showResult(data.error || gettext('An error occurred while sending the request'), false);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      const gettext = window.gettext || function(key) { return key; };
      showResult(gettext('An error occurred while sending the request. Check your internet connection and try again.'), false);
    } finally {
      setLoadingState(false);
    }
  });
  
  // Функция получения CSRF токена
  function getCsrfToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
      return csrfToken.value;
    }
    
    // Альтернативный способ получения из cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    
    return '';
  }
  
  // Simple phone input without auto-formatting for international support
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    // Just allow international phone characters, no auto-formatting
    phoneInput.addEventListener('input', (e) => {
      // Allow digits, spaces, parentheses, dashes, plus sign, and dots
      const value = e.target.value;
      const cleanValue = value.replace(/[^0-9\s\(\)\-\+\.]/g, '');
      if (value !== cleanValue) {
        e.target.value = cleanValue;
      }
    });
    
    // Add placeholder for better UX
    phoneInput.placeholder = '+7 123 456 78 90, +33 1 23 45 67 89, +49 30 12345678, +44 20 1234 5678';
  }
})();

// ===== DJANGO LANGUAGE SELECTOR =====
(function(){
  const languageSelector = document.querySelector('.language-selector');
  const langCurrent = document.getElementById('langCurrent');
  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');
  
  if (!languageSelector || !langCurrent || !langDropdown) return;
  
  let isOpen = false;
  
  function toggleDropdown(force = null) {
    isOpen = force !== null ? force : !isOpen;
    languageSelector.classList.toggle('open', isOpen);
    
    // Update aria attributes for accessibility
    langCurrent.setAttribute('aria-expanded', isOpen.toString());
    
    if (isOpen) {
      // Focus on current language option when opened
      const activeOption = langDropdown.querySelector('.lang-option.active');
      if (activeOption) {
        activeOption.focus();
      }
    }
  }
  
  function closeDropdown() {
    toggleDropdown(false);
  }
  
  function selectLanguage(langCode) {
    const selectedOption = langDropdown.querySelector(`[data-lang="${langCode}"]`);
    if (!selectedOption) {
      return;
    }
    
    const targetDomain = selectedOption.getAttribute('data-domain');
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    const protocol = window.location.protocol;
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    const isLocal = currentHost === '127.0.0.1' || currentHost === 'localhost' || currentHost.startsWith('192.168.');
    
    if (isLocal || !targetDomain) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', langCode);
      window.location.href = url.toString();
      return;
    }
    
    if (currentHost === targetDomain || currentHost === `www.${targetDomain}`) {
      const url = new URL(window.location.href);
      url.searchParams.delete('lang');
      if (url.toString() !== window.location.href) {
        window.location.href = url.toString();
      }
      return;
    }
    
    let newUrl;
    if (currentPort) {
      newUrl = `${protocol}//${targetDomain}:${currentPort}${currentPath}`;
    } else {
      newUrl = `${protocol}//${targetDomain}${currentPath}`;
    }

    window.location.href = newUrl;
  }
  
  langCurrent.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
  
  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const langCode = option.dataset.lang;
      selectLanguage(langCode);
    });
    
    // Keyboard navigation
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const langCode = option.dataset.lang;
        selectLanguage(langCode);
      } else if (e.key === 'Escape') {
        closeDropdown();
        langCurrent.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextOption = option.nextElementSibling;
        if (nextOption) nextOption.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevOption = option.previousElementSibling;
        if (prevOption) prevOption.focus();
      }
    });
    
    // Make options focusable
    option.setAttribute('tabindex', '0');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!languageSelector.contains(e.target)) {
      closeDropdown();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeDropdown();
      langCurrent.focus();
    }
  });
  
  // Set up accessibility attributes
  langCurrent.setAttribute('role', 'button');
  langCurrent.setAttribute('aria-haspopup', 'listbox');
  langCurrent.setAttribute('aria-expanded', 'false');
  const gettext = window.gettext || function(key) { return key; };
  langCurrent.setAttribute('aria-label', gettext('Select language'));
  
  langDropdown.setAttribute('role', 'listbox');
  langDropdown.setAttribute('aria-label', gettext('Choose language'));
  
  langOptions.forEach(option => {
    option.setAttribute('role', 'option');
    const langName = option.querySelector('.lang-name').textContent;
    option.setAttribute('aria-label', `Switch to ${langName}`);
  });
  
  // Smooth hover effects
  langOptions.forEach(option => {
    option.addEventListener('mouseenter', () => {
      if (!option.classList.contains('active')) {
        option.style.transform = 'translateX(8px)';
      }
    });
    
    option.addEventListener('mouseleave', () => {
      if (!option.classList.contains('active')) {
        option.style.transform = 'translateX(0)';
      }
    });
  });
  
  // Add ripple effect on click
  langOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(59, 130, 246, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.left = (e.clientX - this.getBoundingClientRect().left - 10) + 'px';
      ripple.style.top = (e.clientY - this.getBoundingClientRect().top - 10) + 'px';
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '1000';
      
      this.style.position = 'relative';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // CSS for ripple animation
  if (!document.querySelector('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
