document.addEventListener('DOMContentLoaded', function() {
    // =====================
    // 1. Cart Data Management
    // =====================
    const CART_KEY = 'projector_cart_sync';
    const PRODUCT_ID = 'hy300-pro-plus';
    
    // Get cart data from localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    }
    
    // Update cart in localStorage
    function updateCart(productId, quantity) {
        const cart = getCart();
        if (quantity <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = quantity;
        }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartItems();
    }
    
    // =====================
    // 2. Render Cart Items
    // =====================
    function renderCartItems() {
        const cart = getCart();
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        
        if (!cart[PRODUCT_ID]) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            document.querySelector('.checkout-btn').style.display = 'none';
            return;
        }
        
        // Calculate total
        const price = 49.99;
        const quantity = cart[PRODUCT_ID];
        const subtotal = price * quantity;
        
        // Render cart item
        cartItemsContainer.innerHTML = `
            <div class="cart-item">
                <img src="images/projector-front.jpg" alt="Magcubic Projector">
                <div class="item-details">
                    <h2>Magcubic 4K HY300 Pro+ Projector</h2>
                    <p class="item-price">$${price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="remove-item"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Update summary
        document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.querySelector('.total-price').textContent = `$${subtotal.toFixed(2)}`;
        
        // Add event listeners
        document.querySelector('.minus').addEventListener('click', () => {
            updateCart(PRODUCT_ID, quantity - 1);
        });
        
        document.querySelector('.plus').addEventListener('click', () => {
            updateCart(PRODUCT_ID, quantity + 1);
        });
        
        document.querySelector('.remove-item').addEventListener('click', () => {
            updateCart(PRODUCT_ID, 0);
        });
    }
    
    // =====================
    // 3. PayPal Integration
    // =====================
    function setupPayPal() {
        paypal.Buttons({
            createOrder: function(data, actions) {
                const cart = getCart();
                const quantity = cart[PRODUCT_ID] || 0;
                const total = (49.99 * quantity).toFixed(2);
                
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    alert('Transaction completed by ' + details.payer.name.given_name);
                    // Clear cart after successful payment
                    localStorage.removeItem(CART_KEY);
                    renderCartItems();
                });
            },
            onError: function(err) {
                console.error("PayPal error:", err);
                alert("Payment failed. Please try again.");
            }
        }).render('#paypal-button-container');
    }
    
    // =====================
    // 4. Checkout Button Handler
    // =====================
    document.querySelector('.checkout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        // Hide checkout button, show PayPal
        this.style.display = 'none';
        document.getElementById('paypal-button-container').style.display = 'block';
    });
    
    // Initialize
    renderCartItems();
    setupPayPal();
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === CART_KEY) {
            renderCartItems();
        }
    });
});