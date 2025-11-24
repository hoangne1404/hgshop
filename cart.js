// cart.js - Cart functionality for HgShop

// Add to cart function
function addToCart(productId, qty = 1) {
    console.log('Adding to cart:', productId, qty);
    
    // Check if we have product data and if it's in stock
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        // Try to get quantity from the product card
        // For products page, we need to check if the product is in stock
        const stockElement = productCard.querySelector('.stock-status');
        if (stockElement && stockElement.classList.contains('out-of-stock')) {
            alert('Sản phẩm này hiện đã hết hàng!');
            return;
        }
    } else if (typeof window.currentFeaturedProduct !== 'undefined' && 
               window.currentFeaturedProduct && 
               window.currentFeaturedProduct.id == productId) {
        // Check if the featured product is in stock
        if (window.currentFeaturedProduct.quantity <= 0) {
            alert('Sản phẩm này hiện đã hết hàng!');
            return;
        }
    }
    
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Current cart:', cart);
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    console.log('Existing item index:', existingItemIndex);
    
    if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].qty += qty;
        console.log('Updated existing item quantity');
    } else {
        // Add new item
        // We need to find the product details
        // Try to find product card first (for product pages)
        let productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        console.log('Found product card:', productCard);
        
        // If not found, try to find carousel item (for index page)
        if (!productCard) {
            productCard = document.querySelector(`.carousel-item[data-id="${productId}"]`);
            console.log('Found carousel item:', productCard);
        }
        
        if (productCard) {
            // Try to get name from different possible selectors
            const nameElement = productCard.querySelector('.product-name') || 
                               productCard.querySelector('h4') || 
                               productCard.querySelector('h3');
            const name = nameElement ? nameElement.textContent : 'Sản phẩm';
            console.log('Product name:', name);
            
            // Try to get price (may not be available in carousel items)
            let price = 0;
            const priceElement = productCard.querySelector('.product-price');
            if (priceElement) {
                price = parseInt(priceElement.textContent.replace(/\D/g, '')) || 0;
            } else {
                // If no price element found, try to get price from the current featured product
                if (typeof window.currentFeaturedProduct !== 'undefined' && 
                    window.currentFeaturedProduct && 
                    window.currentFeaturedProduct.id == productId) {
                    price = parseInt(window.currentFeaturedProduct.price) || 0;
                    console.log('Got price from currentFeaturedProduct:', price);
                }
            }
            console.log('Product price:', price);
            
            // Try to get image
            let image = 'default-product.png';
            const imageElement = productCard.querySelector('.product-image') || 
                                productCard.querySelector('img');
            if (imageElement) {
                // Store the full image path or just the filename
                const src = imageElement.src;
                console.log('Image source:', src);
                if (src.includes('images/sanpham/')) {
                    // Extract just the filename
                    image = src.split('images/sanpham/').pop();
                } else if (src.includes('http')) {
                    // Keep full URL for external images
                    image = src;
                } else {
                    // Extract just the filename for other cases
                    image = src.split('/').pop();
                }
            } else {
                // If no image element found, try to get image from the current featured product
                if (typeof window.currentFeaturedProduct !== 'undefined' && 
                    window.currentFeaturedProduct && 
                    window.currentFeaturedProduct.id == productId) {
                    image = window.currentFeaturedProduct.image || 'default-product.png';
                    console.log('Got image from currentFeaturedProduct:', image);
                }
            }
            console.log('Product image:', image);
            
            const newItem = {
                id: productId,
                name: name,
                price: price,
                image: image,
                qty: qty
            };
            
            cart.push(newItem);
            console.log('Added new item to cart:', newItem);
        } else {
            // If we can't find the product card, try to get product info from the current featured product
            if (typeof window.currentFeaturedProduct !== 'undefined' && 
                window.currentFeaturedProduct && 
                window.currentFeaturedProduct.id == productId) {
                const featuredProduct = window.currentFeaturedProduct;
                const newItem = {
                    id: productId,
                    name: featuredProduct.name || 'Sản phẩm',
                    price: parseInt(featuredProduct.price) || 0,
                    image: featuredProduct.image || 'default-product.png',
                    qty: qty
                };
                
                cart.push(newItem);
                console.log('Added item from currentFeaturedProduct to cart:', newItem);
            } else {
                // If we can't find the product card, we'll need to get product info from Firebase
                // For now, let's add a basic item
                const basicItem = {
                    id: productId,
                    name: 'Sản phẩm',
                    price: 0,
                    image: 'default-product.png',
                    qty: qty
                };
                
                cart.push(basicItem);
                console.log('Added basic item to cart:', basicItem);
            }
        }
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
    
    // Update cart count in real-time
    updateCartCount();
    
    // Show confirmation
    alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
}

// Update cart count display
function updateCartCount() {
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((total, item) => total + (item.qty || 0), 0);
    
    // Update cart count in header
    const headerCartCount = document.getElementById('cartCount');
    if (headerCartCount) {
        headerCartCount.textContent = totalItems > 0 ? totalItems : '0';
        // Make sure the badge is visible
        headerCartCount.style.display = 'flex';
    }
    
    // Also update any other cart count elements that might exist
    const otherCartCounts = document.querySelectorAll('[id="cartCount"]');
    otherCartCounts.forEach(element => {
        if (element && element !== headerCartCount) {
            element.textContent = totalItems > 0 ? totalItems : '0';
            element.style.display = 'flex';
        }
    });
    
    // Update notification badge as well
    const notificationBadge = document.getElementById('notificationBadge');
    if (notificationBadge) {
        // For now, we'll just set it to 0, but this could be updated with actual notification count
        notificationBadge.textContent = '0';
        notificationBadge.style.display = 'flex';
    }
}

// Render cart items in sidebar
function renderCartItems() {
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItemsElement) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
        if (cartTotalElement) cartTotalElement.textContent = '0đ';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += (item.price || 0) * (item.qty || 0);
    });
    
    // Render cart items with images
    cartItemsElement.innerHTML = cart.map(item => {
        // Determine the correct image source
        let imageSrc;
        if (item.image.startsWith('http')) {
            // External image URL
            imageSrc = item.image;
        } else if (item.image === 'default-product.png') {
            // Default image
            imageSrc = 'images/default-product.png';
        } else {
            // Local image in sanpham folder
            imageSrc = 'images/sanpham/' + item.image;
        }
        
        return `
        <div class="cart-item">
            <img src="${imageSrc}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='images/default-product.png'">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${parseInt(item.price || 0).toLocaleString('vi-VN')}đ</div>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" onclick="updateCartItem(${item.id}, -1)">-</button>
                <span class="qty">${item.qty || 0}</span>
                <button class="qty-btn" onclick="updateCartItem(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                ${parseInt((item.price || 0) * (item.qty || 0)).toLocaleString('vi-VN')}đ
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">✖</button>
        </div>
    `}).join('');
    
    // Update total
    if (cartTotalElement) {
        cartTotalElement.textContent = `${parseInt(total).toLocaleString('vi-VN')}đ`;
    }
    
    // Enable checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
}

// Update cart item quantity
function updateCartItem(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
        cart[itemIndex].qty += change;
        
        // Remove item if quantity <= 0
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        updateCartCount();
        renderCartItems();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    renderCartItems();
}

// Make functions globally available
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.renderCartItems = renderCartItems;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;