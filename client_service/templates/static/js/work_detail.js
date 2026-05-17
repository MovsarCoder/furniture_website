/**
 * Product Detail Page JavaScript
 * Handles modals, image zoom, and interactions
 */

(function() {
    'use strict';

    let galleryImages = [];
    let currentImageIndex = 0;

    function readGalleryData() {
        const dataElement = document.getElementById('product-gallery-data');
        if (!dataElement) return [];

        try {
            return JSON.parse(dataElement.textContent || '[]');
        } catch (error) {
            return [];
        }
    }

    function toggleProductDetails() {
        const modal = document.getElementById('productDetailsModal');
        const toggle = document.querySelector('.product-details-toggle-top') || document.querySelector('.product-details-toggle');
        
        if (!modal) return;
        
        const isActive = modal.classList.contains('active');
        
        if (isActive) {
            modal.classList.remove('active');
            if (toggle) toggle.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            modal.classList.add('active');
            if (toggle) toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            const sections = modal.querySelectorAll('.details-section');
            sections.forEach((section, index) => {
                section.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }

    function setActiveThumbnail(index) {
        document.querySelectorAll('[data-gallery-index]').forEach((button) => {
            button.classList.toggle('active', Number(button.dataset.galleryIndex) === index);
        });
    }

    function updateMainCounter() {
        const counter = document.querySelector('[data-gallery-main-counter]');
        if (!counter || !galleryImages.length) return;
        counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }

    function updateMainImage(index) {
        if (!galleryImages[index]) return;

        currentImageIndex = index;
        const mainImage = document.querySelector('[data-gallery-main]');
        if (mainImage) {
            mainImage.src = galleryImages[index].url;
            mainImage.alt = galleryImages[index].alt || mainImage.alt;
        }
        setActiveThumbnail(index);
        updateMainCounter();
    }

    function renderImageModal() {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('modalImage');
        const counter = modal?.querySelector('[data-gallery-counter]');
        const prev = modal?.querySelector('[data-gallery-prev]');
        const next = modal?.querySelector('[data-gallery-next]');

        if (!modal || !img || !galleryImages.length) return;

        const image = galleryImages[currentImageIndex];
        img.src = image.url;
        img.alt = image.alt || document.querySelector('.product-title')?.textContent || 'Product image';

        if (counter) {
            counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        }

        const hideArrows = galleryImages.length <= 1;
        if (prev) prev.hidden = hideArrows;
        if (next) next.hidden = hideArrows;

        setActiveThumbnail(currentImageIndex);
        updateMainCounter();
    }

    function openImageModal(indexOrUrl) {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('modalImage');

        if (!modal || !img) return;
        if (!galleryImages.length && typeof indexOrUrl === 'string') {
            galleryImages = [{ url: indexOrUrl, alt: img.alt || 'Product image' }];
        }
        if (!galleryImages.length) return;

        if (typeof indexOrUrl === 'number') {
            currentImageIndex = indexOrUrl;
        } else if (typeof indexOrUrl === 'string') {
            const foundIndex = galleryImages.findIndex((image) => image.url === indexOrUrl);
            currentImageIndex = foundIndex >= 0 ? foundIndex : 0;
        }

        renderImageModal();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        const closeBtn = modal.querySelector('.image-modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
    }

    function closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showImageByDirection(direction) {
        if (galleryImages.length <= 1) return;

        currentImageIndex = (currentImageIndex + direction + galleryImages.length) % galleryImages.length;
        renderImageModal();
        updateMainImage(currentImageIndex);
    }

    function handleBackdropClick(event) {
        if (event.target.classList.contains('modal-backdrop')) {
            toggleProductDetails();
        }
        if (event.target.classList.contains('image-modal')) {
            closeImageModal();
        }
    }

    function handleKeyboard(e) {
        if (e.key === 'Escape') {
            const detailsModal = document.getElementById('productDetailsModal');
            const imageModal = document.getElementById('imageModal');
            
            if (detailsModal?.classList.contains('active')) {
                toggleProductDetails();
            }
            if (imageModal?.classList.contains('active')) {
                closeImageModal();
            }
        }

        const imageModal = document.getElementById('imageModal');
        if (imageModal?.classList.contains('active')) {
            if (e.key === 'ArrowRight') {
                showImageByDirection(1);
            }
            if (e.key === 'ArrowLeft') {
                showImageByDirection(-1);
            }
            return;
        }

        const mainImage = document.querySelector('[data-gallery-main]');
        if (!mainImage || galleryImages.length <= 1) return;

        if (e.key === 'ArrowRight') {
            showImageByDirection(1);
        }
        if (e.key === 'ArrowLeft') {
            showImageByDirection(-1);
        }
    }

    function bindGallery() {
        galleryImages = readGalleryData();
        let touchStartX = 0;
        let touchStartY = 0;

        document.querySelectorAll('[data-gallery-index]').forEach((button) => {
            button.addEventListener('click', () => {
                updateMainImage(Number(button.dataset.galleryIndex || 0));
            });

            button.addEventListener('mouseenter', () => {
                if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
                updateMainImage(Number(button.dataset.galleryIndex || 0));
            });

            button.addEventListener('focus', () => {
                updateMainImage(Number(button.dataset.galleryIndex || 0));
            });
        });

        const mainImage = document.querySelector('[data-gallery-main]');
        mainImage?.addEventListener('click', () => openImageModal(currentImageIndex));

        const openCurrent = document.querySelector('[data-gallery-open-current]');
        openCurrent?.addEventListener('click', (event) => {
            event.stopPropagation();
            openImageModal(currentImageIndex);
        });

        document.querySelector('[data-gallery-main-prev]')?.addEventListener('click', (event) => {
            event.stopPropagation();
            showImageByDirection(-1);
        });

        document.querySelector('[data-gallery-main-next]')?.addEventListener('click', (event) => {
            event.stopPropagation();
            showImageByDirection(1);
        });

        const modal = document.getElementById('imageModal');
        modal?.querySelector('[data-gallery-close]')?.addEventListener('click', closeImageModal);
        modal?.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showImageByDirection(-1));
        modal?.querySelector('[data-gallery-next]')?.addEventListener('click', () => showImageByDirection(1));
        modal?.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });
        modal?.addEventListener('touchend', (event) => {
            if (galleryImages.length <= 1) return;

            const touch = event.changedTouches[0];
            const diffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;

            if (Math.abs(diffX) < 48 || Math.abs(diffX) < Math.abs(diffY)) return;
            showImageByDirection(diffX < 0 ? 1 : -1);
        }, { passive: true });

        const stage = document.querySelector('.product-gallery-stage');
        stage?.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });
        stage?.addEventListener('touchend', (event) => {
            if (galleryImages.length <= 1) return;

            const touch = event.changedTouches[0];
            const diffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;

            if (Math.abs(diffX) < 48 || Math.abs(diffX) < Math.abs(diffY)) return;
            showImageByDirection(diffX < 0 ? 1 : -1);
        }, { passive: true });

        updateMainCounter();
    }

    function init() {
        window.toggleProductDetails = toggleProductDetails;
        window.openImageModal = openImageModal;
        window.closeImageModal = closeImageModal;

        bindGallery();

        document.addEventListener('keydown', handleKeyboard);
        document.addEventListener('click', handleBackdropClick);

        document.documentElement.style.scrollBehavior = 'smooth';

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        const productSection = document.querySelector('.product-detail-section');
        if (productSection) {
            productSection.style.opacity = '0';
            productSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                productSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                productSection.style.opacity = '1';
                productSection.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
