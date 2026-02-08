/**
 * Product Detail Page JavaScript
 * Handles modals, image zoom, and interactions
 */

(function() {
    'use strict';

    // Toggle Product Details Modal
    function toggleProductDetails() {
        const modal = document.getElementById('productDetailsModal');
        const toggle = document.querySelector('.product-details-toggle-top') || document.querySelector('.product-details-toggle');
        
        if (!modal || !toggle) return;
        
        const isActive = modal.classList.contains('active');
        
        if (isActive) {
            modal.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            modal.classList.add('active');
            toggle.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Animate sections on open
            const sections = modal.querySelectorAll('.details-section');
            sections.forEach((section, index) => {
                section.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }

    // Open Image Modal
    function openImageModal(imageUrl) {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('modalImage');
        
        if (!modal || !img) return;
        
        img.src = imageUrl;
        img.alt = document.querySelector('.product-title')?.textContent || 'Product image';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        const closeBtn = modal.querySelector('.image-modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
    }

    // Close Image Modal
    function closeImageModal() {
        const modal = document.getElementById('imageModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close modal on backdrop click
    function handleBackdropClick(event) {
        if (event.target.classList.contains('modal-backdrop')) {
            toggleProductDetails();
        }
        if (event.target.classList.contains('image-modal')) {
            closeImageModal();
        }
    }

    // Keyboard navigation
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
    }

    // Smooth scroll to section
    function scrollToSection(element) {
        if (!element) return;
        
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Initialize on DOM ready
    function init() {
        // Make functions globally available
        window.toggleProductDetails = toggleProductDetails;
        window.openImageModal = openImageModal;
        window.closeImageModal = closeImageModal;

        // Event listeners
        document.addEventListener('keydown', handleKeyboard);
        document.addEventListener('click', handleBackdropClick);

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Lazy load images
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

        // Add loading animation
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

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
