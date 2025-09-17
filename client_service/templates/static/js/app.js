// Banner slider with enhanced animations
(function(){
  const slider = document.getElementById('bannerSlider');
  if(!slider) return;
  const track = slider.querySelector('.slides');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsWrap = slider.querySelector('.dots');
  const prev = slider.querySelector('[data-dir="-1"]');
  const next = slider.querySelector('[data-dir="1"]');
  let idx = 0;
  let timer;
  let isTransitioning = false;

  // Create dots with enhanced styling
  const dots = slides.map((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i===0?' active':'');
    dotsWrap.appendChild(d);
    d.addEventListener('click', ()=>go(i));
    return d;
  });

  function go(i){
    if(isTransitioning) return;
    isTransitioning = true;

    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx*100}%)`;

    // Update dots with smooth transition
    dots.forEach((d,di)=>d.classList.toggle('active', di===idx));

    // Add slide content animation
    slides.forEach((slide, slideIdx) => {
      const content = slide.querySelector('.slide-content');
      if(content) {
        if(slideIdx === idx) {
          content.style.opacity = '0';
          content.style.transform = 'translateY(30px)';
          setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
            content.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          }, 50);
        } else {
          content.style.opacity = '0.7';
        }
      }
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 100);

    restart();
  }

  function step(dir){
    if(!isTransitioning) go(idx + dir);
  }

  function start(){
    //  Скорость автопролистывания слайдов
    timer = setInterval(()=>step(1), 3000);
  }

  function stop(){
    clearInterval(timer);
  }

  function restart(){
    stop();
    start();
  }

  // Enhanced event listeners
  prev?.addEventListener('click', ()=>step(-1));
  next?.addEventListener('click', ()=>step(1));

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  // Touch/swipe support
  let startX = 0;
  let startY = 0;

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  slider.addEventListener('touchend', (e) => {
    if(!startX || !startY) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;

    if(Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if(diffX > 0) {
        step(1); // Swipe left - next
      } else {
        step(-1); // Swipe right - previous
      }
    }

    startX = 0;
    startY = 0;
  });

  start();
})();

// Stats count-up + progress bars + pop effect
(function(){
  const nums = document.querySelectorAll('.num[data-count]');
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const formatNum = n => n.toLocaleString('ru-RU');

  function animate(el, to, duration = 2000){
    let start = null;
    const bar = el.closest('.stat').querySelector('.bar');

    function step(ts){
      if(!start) start = ts;
      let progress = (ts - start) / duration;
      if(progress > 1) progress = 1;

      const eased = easeOutCubic(progress);
      const value = Math.floor(to * eased);

      el.textContent = formatNum(value);

      if(bar){
        bar.style.width = (value / to * 100) + '%';
      }

      if(progress < 1){
        requestAnimationFrame(step);
      } else {
        // Pop effect
        el.style.transform = 'scale(1.15)';
        el.style.transition = 'transform 0.3s ease, text-shadow 0.3s ease';
        el.style.textShadow = '0 0 15px rgba(59,130,246,0.7)';
        setTimeout(() => {
          el.style.transform = 'scale(1)';
          el.style.textShadow = 'none';
        }, 300);
      }
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach((e, idx)=>{
      if(e.isIntersecting){
        const el = e.target;
        const max = +el.dataset.count;

        setTimeout(() => {
          animate(el, max, 2200);
        }, idx * 300);

        io.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  nums.forEach(n=>io.observe(n));
})();

// Smooth scroll for navigation links
(function(){
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if(targetElement) {
        const navbar = document.querySelector('.navbar');
        const navH = navbar ? navbar.offsetHeight : 84;
        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - navH;
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
  const cards = document.querySelectorAll('.card, .feature, .stat, .review, .branch');

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

// Loading animation for images
(function(){
  const images = document.querySelectorAll('img');

  images.forEach(img => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    });

    // Set initial state
    img.style.opacity = '0';
    img.style.transform = 'scale(0.95)';
    img.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  });
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

// Reviews carousel functionality
(function(){
  const reviewsTrack = document.querySelector('.reviews-track');
  const reviews = document.querySelectorAll('.review');
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');

  if(!reviewsTrack || !reviews.length) return;

  let currentIndex = 0;
  const reviewsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
  const maxIndex = Math.max(0, reviews.length - reviewsPerView);

  function updateCarousel() {
    const translateX = -currentIndex * (100 / reviewsPerView);
    reviewsTrack.style.transform = `translateX(${translateX}%)`;
  }

  function next() {
    if(currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  function prev() {
    if(currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  // Auto-play reviews
  setInterval(() => {
    if(currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  }, 4000);

  // Handle window resize
  window.addEventListener('resize', () => {
    const newReviewsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
    const newMaxIndex = Math.max(0, reviews.length - newReviewsPerView);
    if(currentIndex > newMaxIndex) {
      currentIndex = newMaxIndex;
    }
    updateCarousel();
  });
})();

// Mobile burger menu toggle with a11y
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if(!toggle || !nav) return;

  function closeMenu(){
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onEsc);
  }

  function onEsc(e){
    if(e.key === 'Escape') closeMenu();
  }

  toggle.addEventListener('click', ()=>{
    const opened = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    if(opened){
      document.addEventListener('keydown', onEsc);
      const firstLink = nav.querySelector('a');
      firstLink && firstLink.focus();
    } else {
      document.removeEventListener('keydown', onEsc);
    }
  });

  document.addEventListener('click', (e)=>{
    if(!nav.contains(e.target) && !toggle.contains(e.target)){
      closeMenu();
    }
  });
})();

// Improve reviews autoplay and a11y controls
(function(){
  const track = document.getElementById('reviewsTrack');
  const prev = document.getElementById('revPrev');
  const next = document.getElementById('revNext');
  if(!track) return;

  let hover = false;

  function setHover(v){ hover = v; }

  prev && prev.setAttribute('aria-controls', 'reviewsTrack');
  next && next.setAttribute('aria-controls', 'reviewsTrack');

  prev && prev.addEventListener('mouseenter', ()=>setHover(true));
  next && next.addEventListener('mouseenter', ()=>setHover(true));
  prev && prev.addEventListener('mouseleave', ()=>setHover(false));
  next && next.addEventListener('mouseleave', ()=>setHover(false));
  track.addEventListener('mouseenter', ()=>setHover(true));
  track.addEventListener('mouseleave', ()=>setHover(false));

  let windowFocused = true;
  window.addEventListener('focus', ()=>windowFocused = true);
  window.addEventListener('blur', ()=>windowFocused = false);

  const nativeSetInterval = window.setInterval;
  window.setInterval = function(handler, timeout){
    if(typeof handler === 'function' && timeout === 4000){
      const wrapped = () => { if(!hover && windowFocused) handler(); };
      return nativeSetInterval(wrapped, timeout);
    }
    return nativeSetInterval(handler, timeout);
  }
})();

