/* script.js - Main frontend logic for HgShop */

// Function to update user avatar
function updateUserAvatar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const avatarIcon = document.getElementById('avatarIcon');
    
    if (avatarIcon && currentUser) {
        // Try multiple possible avatar fields with more comprehensive checking
        let avatarUrl = null;
        
        // Check various possible avatar fields
        if (currentUser.avatar && currentUser.avatar.trim() !== '' && currentUser.avatar !== 'images/default-avatar.png') {
            avatarUrl = currentUser.avatar;
        } else if (currentUser.photoURL && currentUser.photoURL.trim() !== '') {
            avatarUrl = currentUser.photoURL;
        } else if (currentUser.avatarUrl && currentUser.avatarUrl.trim() !== '') {
            avatarUrl = currentUser.avatarUrl;
        }
        
        if (avatarUrl) {
            avatarIcon.src = avatarUrl;
            console.log('Avatar updated successfully to:', avatarUrl);
        }
    }
}

// Function to update seller menu based on user role
function updateSellerMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const becomeSellerLink = document.getElementById('becomeSellerLink');
    const sellerMenuText = document.getElementById('sellerMenuText');
    
    if (becomeSellerLink && sellerMenuText && currentUser) {
        if (currentUser.role === 'seller') {
            sellerMenuText.textContent = 'Cửa hàng của tôi';
            becomeSellerLink.href = 'seller.html';
        } else {
            sellerMenuText.textContent = 'Trở thành người bán';
            becomeSellerLink.href = 'become-seller.html';
        }
    }
}

// Call these functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update user avatar and seller menu on page load
    updateUserAvatar();
    updateSellerMenu();
});

// Remove Firebase configuration from here since it's now in the HTML files
// The Firebase objects will be available globally from the HTML files

document.addEventListener('DOMContentLoaded', async function () {
    console.log('script.js DOMContentLoaded event fired');
    
    // Check authentication status
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(user => {
            if (user) {
                console.log("User is signed in:", user.email);
                loadUserData(user.uid);
            } else {
                console.log("No user is signed in");
            }
        });
    }

    // Load products from Firebase
    await initProducts();

    // Initialize UI components with a delay to ensure DOM is fully loaded
    setTimeout(initUI, 100);
});

async function loadUserData(uid) {
    try {
        if (window.firebaseDatabase) {
            const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            const snapshot = await get(ref(window.firebaseDatabase, 'users/' + uid));
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem('currentUser', JSON.stringify({
                    uid: uid,
                    ...userData
                }));
                // Update user avatar and seller menu when user data is loaded
                updateUserAvatar();
                updateSellerMenu();
            }
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

async function initProducts() {
    try {
        if (window.firebaseDatabase) {
            const { ref, get, onValue } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Set up real-time listener for products
            const productsRef = ref(window.firebaseDatabase, 'products');
            onValue(productsRef, (snapshot) => {
                const productsData = snapshot.val();
                let products = productsData ? Object.values(productsData) : [];
                
                // Sort products by sales in descending order for featured products
                products.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                
                renderProducts(products);
            });
        } else {
            // Fallback to sample products if Firebase is not available
            const sampleProducts = [
                {
                    id: 1,
                    name: "Màn hình Dell 24 inch",
                    description: "Màn hình Dell UltraSharp U2422H với độ phân giải Full HD, tấm nền IPS, hỗ trợ xoay nghiêng.",
                    price: 2500000,
                    quantity: 50,
                    category: "monitor",
                    image: "monitor1.jpg",
                    seller: "HgShop",
                    rating: 4.5,
                    reviews: [],
                    specifications: [
                        "Kích thước: 24 inch",
                        "Độ phân giải: 1920 x 1080 (Full HD)",
                        "Tấm nền: IPS",
                        "Tần số quét: 60Hz",
                        "Cổng kết nối: HDMI, DisplayPort"
                    ],
                    supplier: "Dell Vietnam",
                    type: "Màn hình máy tính",
                    sales: 120
                },
                {
                    id: 2,
                    name: "Laptop ASUS Vivobook",
                    description: "Laptop ASUS Vivobook 15 OLED, RAM 8GB, SSD 512GB, CPU AMD Ryzen 5.",
                    price: 15990000,
                    quantity: 20,
                    category: "laptop",
                    image: "laptop1.jpg",
                    seller: "HgShop",
                    rating: 4.7,
                    reviews: [],
                    specifications: [
                        "CPU: AMD Ryzen 5 5500U",
                        "RAM: 8GB DDR4",
                        "Ổ cứng: 512GB SSD",
                        "Màn hình: 15.6 inch OLED",
                        "Trọng lượng: 1.7kg"
                    ],
                    supplier: "ASUS Vietnam",
                    type: "Laptop",
                    sales: 85
                },
                {
                    id: 3,
                    name: "Bàn phím cơ Corsair K70",
                    description: "Bàn phím cơ Corsair K70 RGB MK.2 với switch Cherry MX Speed, đèn RGB tùy chỉnh.",
                    price: 3200000,
                    quantity: 30,
                    category: "accessories",
                    image: "keyboard1.jpg",
                    seller: "HgShop",
                    rating: 4.8,
                    reviews: [],
                    specifications: [
                        "Loại switch: Cherry MX Speed",
                        "Đèn nền: RGB đa màu",
                        "Kết nối: USB-C",
                        "Tính năng: Anti-ghosting",
                        "Phụ kiện: Đệm cổ tay đi kèm"
                    ],
                    supplier: "Corsair",
                    type: "Phụ kiện",
                    sales: 210
                }
            ];
            
            // Sort products by sales in descending order for featured products
            sampleProducts.sort((a, b) => b.sales - a.sales);
            
            renderProducts(sampleProducts);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products if Firebase fails
        const sampleProducts = [
            {
                id: 1,
                name: "Màn hình Dell 24 inch",
                description: "Màn hình Dell UltraSharp U2422H với độ phân giải Full HD, tấm nền IPS, hỗ trợ xoay nghiêng.",
                price: 2500000,
                quantity: 50,
                category: "monitor",
                image: "monitor1.jpg",
                seller: "HgShop",
                rating: 4.5,
                reviews: [],
                specifications: [
                    "Kích thước: 24 inch",
                    "Độ phân giải: 1920 x 1080 (Full HD)",
                    "Tấm nền: IPS",
                    "Tần số quét: 60Hz",
                    "Cổng kết nối: HDMI, DisplayPort"
                ],
                supplier: "Dell Vietnam",
                type: "Màn hình máy tính",
                sales: 120
            },
            {
                id: 2,
                name: "Laptop ASUS Vivobook",
                description: "Laptop ASUS Vivobook 15 OLED, RAM 8GB, SSD 512GB, CPU AMD Ryzen 5.",
                price: 15990000,
                quantity: 20,
                category: "laptop",
                image: "laptop1.jpg",
                seller: "HgShop",
                rating: 4.7,
                reviews: [],
                specifications: [
                    "CPU: AMD Ryzen 5 5500U",
                    "RAM: 8GB DDR4",
                    "Ổ cứng: 512GB SSD",
                    "Màn hình: 15.6 inch OLED",
                    "Trọng lượng: 1.7kg"
                ],
                supplier: "ASUS Vietnam",
                type: "Laptop",
                sales: 85
            },
            {
                id: 3,
                name: "Bàn phím cơ Corsair K70",
                description: "Bàn phím cơ Corsair K70 RGB MK.2 với switch Cherry MX Speed, đèn RGB tùy chỉnh.",
                price: 3200000,
                quantity: 30,
                category: "accessories",
                image: "keyboard1.jpg",
                seller: "HgShop",
                rating: 4.8,
                reviews: [],
                specifications: [
                    "Loại switch: Cherry MX Speed",
                    "Đèn nền: RGB đa màu",
                    "Kết nối: USB-C",
                    "Tính năng: Anti-ghosting",
                    "Phụ kiện: Đệm cổ tay đi kèm"
                ],
                supplier: "Corsair",
                type: "Phụ kiện",
                sales: 210
            }
        ];
        
        // Sort products by sales in descending order for featured products
        sampleProducts.sort((a, b) => b.sales - a.sales);
        
        renderProducts(sampleProducts);
    }
}

function renderProducts(products) {
    // This function is now primarily used for the main product grid on other pages
    // For the index page, we use the carousel rendering in index.html
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state">Không có sản phẩm nào</div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const isOutOfStock = p.quantity <= 0;
        // Calculate average rating from reviews if available
        let avgRating = p.rating || 0;
        if (p.reviews && p.reviews.length > 0) {
            const totalRating = p.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            avgRating = Math.round((totalRating / p.reviews.length) * 10) / 10;
        }
        
        return `
        <div class="card product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${p.id}" data-category="${p.category}">
            <div class="product-image-container">
                <img src="${p.image.startsWith('http') ? p.image : 'images/sanpham/' + p.image}" alt="${p.name}" class="product-image" onerror="this.src='images/default-product.png'">
                ${isOutOfStock ? '<div class="out-of-stock-overlay">Hết hàng</div>' : ''}
                <button class="quick-buy-btn" onclick="addToCart(${p.id}, 1)" ${isOutOfStock ? 'disabled' : ''}>🛒</button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-description">${p.description}</p>
                <div class="product-meta">
                    <span class="product-price">${parseInt(p.price).toLocaleString('vi-VN')}đ</span>
                    <span class="product-rating">
                        ${renderStarRating(avgRating)}
                        <span style="color: #666; font-size: 14px;">(${avgRating})</span>
                    </span>
                </div>
                <!-- Display sales information -->
                <div class="product-sales-info">
                    Đã bán: ${getLocalSalesCount(p.id) || p.sales || 0}
                </div>
                <div class="product-stock">
                    ${isOutOfStock ? 
                        '<span class="stock-status out-of-stock">Hết hàng</span>' : 
                        `<span class="stock-status in-stock">Còn ${p.quantity} sản phẩm</span>`}
                </div>
                <div class="product-actions">
                    <button class="btn secondary" onclick="viewProduct(${p.id})">Chi tiết</button>
                    <button class="btn primary" onclick="buyNow(${p.id})" ${isOutOfStock ? 'disabled' : ''}>Mua ngay</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    // Update cart count after rendering products
    updateCartCount();
}

// Update cart count display
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((total, item) => total + (item.qty || 0), 0);
        cartCountElement.textContent = totalItems;
    }
    
    // Also update cart count in header if on index page
    const headerCartCount = document.querySelector('#cartBtn #cartCount');
    if (headerCartCount) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((total, item) => total + (item.qty || 0), 0);
        headerCartCount.textContent = totalItems;
    }
}

// Helper function to render star rating
function renderStarRating(rating) {
    // For index page, we want to show 0 stars as ☆☆☆☆☆
    if (rating === 0 || !rating) {
        return '☆☆☆☆☆';
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    // For index page, show exactly 5 stars with proper filled/empty icons
    return '★'.repeat(fullStars) + (hasHalfStar ? '★' : '') + '☆'.repeat(emptyStars);
}

function initUI() {
    console.log('Initializing UI components');
    
    // Category filtering
    document.querySelectorAll('.cat').forEach(cat => {
        cat.addEventListener('click', () => {
            document.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
            const category = cat.dataset.cat;
            filterProducts(category);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            searchProducts(searchTerm);
        });
    }

    // Cart functionality is now handled in index.html to avoid conflicts
    // Notification functionality is now handled in index.html to avoid conflicts
    // Avatar functionality is now handled in index.html to avoid conflicts

    // Initialize cart
    updateCartUI();
    
    console.log('UI components initialized');
}

function filterProducts(category) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchProducts(term) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        if (name.includes(term) || description.includes(term)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToCart(productId, qty = 1) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        // Update quantity
        cart[existingItemIndex].qty += qty;
    } else {
        // Add new item
        // We need to find the product details
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCard) {
            const name = productCard.querySelector('.product-name').textContent;
            const price = parseInt(productCard.querySelector('.product-price').textContent.replace(/\D/g, ''));
            const image = productCard.querySelector('.product-image').src.split('/').pop();
            
            cart.push({
                id: productId,
                name: name,
                price: price,
                image: image,
                qty: qty
            });
        }
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in real-time
    updateCartCount();
    
    // Show confirmation
    alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
}

function viewProduct(productId) {
    // Implementation for viewing product details
    window.location.href = `product-detail.html?id=${productId}`;
}

function buyNow(productId) {
    // Implementation for buying product immediately
    console.log('Buy now clicked for product:', productId);
    addToCart(productId, 1);
    // Add a small delay to ensure the cart is saved before redirecting
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 100);
}

function updateCartUI() {
    // Implementation for updating cart UI
    console.log("Updating cart UI");
}

// Make functions globally available
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.buyNow = buyNow;
window.filterProducts = filterProducts;

// Function to get local sales count for a product
function getLocalSalesCount(productId) {
    try {
        console.log(`Getting local sales count for product ${productId}`);
        let localSales = JSON.parse(localStorage.getItem('localProductSales') || '{}');
        console.log(`Local sales data:`, localSales);
        const sales = localSales[productId] || 0;
        console.log(`Sales for product ${productId}: ${sales}`);
        return sales;
    } catch (error) {
        console.error('Error getting local sales count:', error);
        return 0;
    }
}
