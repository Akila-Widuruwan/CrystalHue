document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // 1. Mobile Menu Toggle
    // =====================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function() {
            this.classList.toggle('is-active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking links
        document.querySelectorAll('.nav-links').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 960) {
                    mobileMenu.classList.remove('is-active');
                    navMenu.classList.remove('active');
                }
            });
        });
    }

    // =====================
    // 2. Image Slider (Smooth)
    // =====================
    const slider = document.querySelector('.product-slider');
    const slides = document.querySelectorAll('.product-slider img');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentIndex = 0;
    let isAnimating = false;

    // Initialize slider
    function initSlider() {
        slides.forEach((slide, index) => {
            slide.style.position = 'absolute';
            slide.style.left = `${index * 100}%`;
            slide.style.transition = 'transform 0.5s ease-in-out';
            slide.style.opacity = '1';
        });
        updateSliderPosition();
    }

    function updateSliderPosition() {
        slides.forEach(slide => {
            slide.style.transform = `translateX(-${currentIndex * 100}%)`;
        });
    }

    function goToSlide(index) {
        if (isAnimating || index === currentIndex) return;
        
        isAnimating = true;
        currentIndex = (index + slides.length) % slides.length;
        updateSliderPosition();
        
        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    if (slider && slides.length > 0) {
        initSlider();
        
        // Navigation buttons
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
            });
            
            nextBtn.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
            });
        }
        
        // Touch support
        let touchStartX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (diff > 50) nextBtn.click(); // Swipe left
            if (diff < -50) prevBtn.click(); // Swipe right
        }, { passive: true });
    }

    // =====================
    // 3. Cart System (Synchronized)
    // =====================
    const CART_KEY = 'projector_cart_sync';
    const PRODUCT_ID = 'hy300-pro-plus';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || {};
        } catch (e) {
            console.error("Cart read error:", e);
            return {};
        }
    }

    function updateGlobalCart(productId, quantity) {
        const cart = getCart();
        if (quantity <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = quantity;
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        
        // Update all cart counters on page
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
        });
        
        // Dispatch event for other pages
        const cartUpdatedEvent = new CustomEvent('cartUpdated', {
            detail: { count: totalItems }
        });
        document.dispatchEvent(cartUpdatedEvent);
    }

    // Add to cart button
    const buyButton = document.querySelector('.buy-button');
    if (buyButton) {
        buyButton.addEventListener('click', function(e) {
            e.preventDefault();
            const cart = getCart();
            const currentQty = cart[PRODUCT_ID] || 0;
            updateGlobalCart(PRODUCT_ID, currentQty + 1);
            
            // Visual feedback
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.classList.add('clicked');
            
            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('clicked');
            }, 1500);
        });
    }

    // Listen for cart updates from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === CART_KEY) {
            updateCartCount();
        }
    });

    // Initialize cart display
    updateCartCount();
});