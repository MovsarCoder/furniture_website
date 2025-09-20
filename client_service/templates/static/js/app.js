// ===== CORE FUNCTIONALITY =====
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

// ===== ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ МОДАЛЬНОГО ОКНА =====
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
      const response = await fetch('/consultation-request/', {
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

