// ===== ENHANCED STATISTICS ANIMATION =====
// Улучшенная анимация статистики с плавными эффектами
(function(){
  const nums = document.querySelectorAll('.num[data-count]');
  const easeOutQuart = t => 1 - (--t) * t * t * t;
  const formatNum = n => n.toLocaleString('ru-RU');

  function animate(el, to, duration = 3000){
    let start = null;
    const progressBar = el.closest('.stat-card').querySelector('.progress-bar');
    const iconWrapper = el.closest('.stat-card').querySelector('.stat-icon-wrapper');
    const sparkles = el.closest('.stat-card').querySelectorAll('.sparkle');
    const icon = el.closest('.stat-card').querySelector('.stat-icon');

    function step(ts){
      if(!start) start = ts;
      let progress = (ts - start) / duration;
      if(progress > 1) progress = 1;

      // Используем более плавную easing функцию
      const eased = easeOutQuart(progress);
      const value = Math.floor(to * eased);

      el.textContent = formatNum(value);

      // Анимация прогресс-бара с задержкой
      if(progressBar && progress > 0.3){
        const targetWidth = progressBar.getAttribute('data-width') || '100';
        const barProgress = Math.min((progress - 0.3) / 0.7, 1);
        progressBar.style.width = (barProgress * parseFloat(targetWidth)) + '%';
      }

      // Пульсация иконки во время анимации
      if(icon && progress < 1) {
        const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
        icon.style.transform = `scale(${pulseScale})`;
      }

      // Активация искр в процессе анимации
      sparkles.forEach((sparkle, index) => {
        if(progress > (index + 1) * 0.25) {
          sparkle.style.animationPlayState = 'running';
        }
      });

      // Добавляем свечение при завершении
      if(progress >= 1) {
        el.style.textShadow = '0 0 20px rgba(59, 130, 246, 0.6)';
        if(icon) {
          icon.style.transform = 'scale(1)';
          icon.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)';
        }
      }

      if(progress < 1){
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach((entry, idx)=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const max = +el.dataset.count;
        
        // Увеличенная задержка для лучшего эффекта
        setTimeout(() => {
          animate(el, max, 2800);
        }, idx * 500);

        io.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  nums.forEach(n=>io.observe(n));

  // Добавляем эффекты при наведении на карточки статистики
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.stat-icon');
      const progressGlow = card.querySelector('.progress-glow');
      const sparkles = card.querySelectorAll('.sparkle');
      
      if(icon) {
        icon.style.transform = 'scale(1.1) rotate(6deg)';
        icon.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      
      if(progressGlow) {
        progressGlow.style.opacity = '0.6';
      }
      
      sparkles.forEach((sparkle, idx) => {
        setTimeout(() => {
          sparkle.style.animation = 'sparkleFloat 2s ease-in-out infinite';
        }, idx * 120);
      });
    });
    
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.stat-icon');
      const progressGlow = card.querySelector('.progress-glow');
      const sparkles = card.querySelectorAll('.sparkle');
      
      if(icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.transition = 'transform 0.4s ease';
      }
      
      if(progressGlow) {
        progressGlow.style.opacity = '0';
      }
      
      sparkles.forEach(sparkle => {
        sparkle.style.animation = 'sparkleFloat 3s ease-in-out infinite';
      });
    });
  });
})();

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
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    currentX = startX;
    initialTransform = currentIndex * (100 / reviewsPerView);
    reviewsTrack.style.transition = 'none';
    stopAutoplay();
  }

  function handleMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diffX = currentX - startX;
    const percentage = (diffX / reviewsTrack.offsetWidth) * 100;
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
  if (prev) {
    prev.setAttribute('aria-controls', 'reviewsTrack');
    prev.setAttribute('aria-label', 'Предыдущий отзыв');
  }
  if (next) {
    next.setAttribute('aria-controls', 'reviewsTrack');
    next.setAttribute('aria-label', 'Следующий отзыв');
  }
  
  track.setAttribute('role', 'region');
  track.setAttribute('aria-label', 'Отзывы клиентов');
})();

// ===== АКТИВНЫЕ ПУНКТЫ МЕНЮ ПРИ ПРОКРУТКЕ =====
(function(){
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  // Функция для определения активного раздела при прокрутке
  function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a');
    const homeLink = document.querySelector('.nav a[href="/"]');
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
        const activeLink = document.querySelector(`.nav a[href="#${sectionId}"], .nav a[href="/#${sectionId}"]`);
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
    console.error('Модальное окно консультации не найдено');
    return;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Фокус на первое поле
  const firstInput = form.querySelector('input[name="name"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }
  
  console.log('Модальное окно консультации открыто');
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
    switch (name) {
      case 'name':
        if (!value.trim()) {
          showError('name', 'Пожалуйста, введите ваше имя');
          return false;
        }
        if (value.trim().length < 2) {
          showError('name', 'Имя должно содержать минимум 2 символа');
          return false;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          showError('phone', 'Пожалуйста, введите номер телефона');
          return false;
        }
        // More flexible phone validation for international numbers
        const cleanPhone = value.replace(/[\s\(\)\-\+\.]/g, '');
        if (cleanPhone.length < 8 || cleanPhone.length > 15) {
          showError('phone', 'Пожалуйста, введите корректный номер телефона (8-15 цифр)');
          return false;
        }
        if (!/^[0-9]+$/.test(cleanPhone)) {
          showError('phone', 'Номер телефона должен содержать только цифры');
          return false;
        }
        break;
        
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError('email', 'Пожалуйста, введите корректный email адрес');
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
        showResult(data.error || 'Произошла ошибка при отправке заявки', false);
      }
      
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      showResult('Произошла ошибка при отправке заявки. Проверьте подключение к интернету и попробуйте снова.', false);
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
  const languageForm = document.getElementById('languageForm');
  
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
    console.log('Selecting language:', langCode);
    
    // Check if form exists
    if (languageForm) {
      console.log('Using form submission');
      // Create hidden input for language selection
      const languageInput = document.createElement('input');
      languageInput.type = 'hidden';
      languageInput.name = 'language';
      languageInput.value = langCode;
      
      // Add to form and submit
      languageForm.appendChild(languageInput);
      languageForm.submit();
    } else {
      console.log('Using fallback URL redirect');
      // Fallback: redirect to language switch URL directly
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      window.location.href = `/i18n/setlang/?language=${langCode}&next=${encodeURIComponent(currentPath)}`;
    }
  }
  
  // Event listeners
  langCurrent.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Language selector clicked');
    toggleDropdown();
  });
  
  langOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      const langCode = option.dataset.lang;
      console.log('Language option clicked:', langCode);
      selectLanguage(langCode);
    });
    
    // Keyboard navigation
    option.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const langCode = option.dataset.lang;
        console.log('Language option selected via keyboard:', langCode);
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
  langCurrent.setAttribute('aria-label', 'Select language');
  
  langDropdown.setAttribute('role', 'listbox');
  langDropdown.setAttribute('aria-label', 'Choose language');
  
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
