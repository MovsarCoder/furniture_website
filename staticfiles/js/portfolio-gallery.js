(function () {
    'use strict';

    function initPortfolioGallery(slider) {
        const images = Array.from(slider.querySelectorAll('.portfolio-gallery-image'));
        if (images.length <= 1) return;

        const prevButton = slider.querySelector('[data-portfolio-prev]');
        const nextButton = slider.querySelector('[data-portfolio-next]');
        let currentIndex = images.findIndex((image) => image.classList.contains('is-active'));
        if (currentIndex < 0) currentIndex = 0;

        function showImage(index) {
            currentIndex = (index + images.length) % images.length;
            images.forEach((image, imageIndex) => {
                image.classList.toggle('is-active', imageIndex === currentIndex);
            });
        }

        prevButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            showImage(currentIndex - 1);
        });

        nextButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            showImage(currentIndex + 1);
        });
    }

    function init() {
        document.querySelectorAll('[data-portfolio-gallery]').forEach(initPortfolioGallery);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
