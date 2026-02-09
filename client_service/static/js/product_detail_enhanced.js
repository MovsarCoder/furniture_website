/**
 * Enhanced Product Detail Page JavaScript
 * Handles product details toggle with improved animations
 */

(function() {
    'use strict';

    // Toggle Product Details Modal with enhanced functionality
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

    // Initialize on DOM ready
    function init() {
        // Make function globally available
        window.toggleProductDetails = toggleProductDetails;

        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();