// seller.js - Quản lý người bán và sản phẩm
// Make sure all functions are available immediately
window.displayMyProducts = displayMyProducts;
window.addNewProduct = addNewProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveStoreInfo = saveStoreInfo;
window.displayMonthlyRevenue = displayMonthlyRevenue;
window.becomeSeller = becomeSeller;
window.initSeller = initSeller;
window.initSellerDashboard = initSellerDashboard;
window.initSellerFeatures = initSellerFeatures;

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra nếu đang ở trang seller.html
    if (window.location.pathname.includes('seller.html')) {
        initSellerDashboard();
    } else {
        initSellerFeatures();
    }
});

function initSellerFeatures() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) return;

    // Kiểm tra và hiển thị trạng thái người bán
    updateSellerUI(cur);

    // Xử lý nút trở thành người bán
    const becomeSellerBtn = document.getElementById('becomeSeller');
    if (becomeSellerBtn) {
        becomeSellerBtn.onclick = () => showSellerRegistrationForm(cur);
    }
}

function initSellerDashboard() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur || (cur.role !== 'seller' && cur.role !== 'admin')) {
        window.location.href = 'index.html';
        return;
    }

    // Hiển thị thông tin người bán
    displaySellerInfo(cur);
    
    // Hiển thị sản phẩm của người bán immediately
    displayMyProducts(cur);
    
    // Hiển thị báo cáo doanh thu
    displaySalesReport(cur);
    
    // Hiển thị doanh thu tháng này real-time
    displayMonthlyRevenue(cur);
    
    // Set up real-time updates for all data
    setupRealTimeUpdates(cur);
    
    // Xử lý form thêm sản phẩm
    const addProductBtn = document.getElementById('addProduct');
    const addProductModalBtn = document.getElementById('addProductModalBtn');
    const productForm = document.getElementById('productForm');

    if (addProductModalBtn && productForm) {
        addProductModalBtn.onclick = () => {
            productForm.style.display = productForm.style.display === 'none' ? 'block' : 'none';
        };
    }

    if (addProductBtn) {
        addProductBtn.onclick = () => addNewProduct(cur);
    }
    
    // Handle save store info
    const saveStoreInfoBtn = document.getElementById('saveStoreInfo');
    if (saveStoreInfoBtn) {
        saveStoreInfoBtn.onclick = () => saveStoreInfo(cur);
    }
}

function setupRealTimeUpdates(user) {
    // Set up real-time listeners for immediate updates
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then((firebase) => {
            // Listen for product changes
            const productsRef = firebase.ref(window.firebaseDatabase, 'products');
            productsRef.on('value', () => {
                displayMyProducts(user);
            });
            
            // Listen for order changes
            const ordersRef = firebase.ref(window.firebaseDatabase, 'orders');
            ordersRef.on('value', () => {
                displaySalesReport(user);
                displayMonthlyRevenue(user);
            });
        });
    }
}

function displaySellerInfo(user) {
    const sellerInfo = document.getElementById('sellerInfo');
    if (!sellerInfo) return;
    
    // Load seller info from Firebase with real-time listener
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then((firebase) => {
            try {
                // Set up real-time listener for user data
                const userRef = firebase.ref(window.firebaseDatabase, 'users/' + user.uid);
                userRef.on('value', (snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        sellerInfo.innerHTML = `
                            <div style="display: flex; gap: 20px; align-items: center;">
                                <div>
                                    <p><strong>Tên cửa hàng:</strong> ${userData.name || 'Chưa cập nhật'}</p>
                                    <p><strong>Địa chỉ:</strong> ${userData.sellerInfo?.address || 'Chưa cập nhật'}</p>
                                    <p><strong>Số điện thoại:</strong> ${userData.sellerInfo?.phone || userData.phone || 'Chưa cập nhật'}</p>
                                    <p><strong>Ngày đăng ký:</strong> ${userData.sellerInfo?.registeredAt ? new Date(userData.sellerInfo.registeredAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        `;
                    } else {
                        sellerInfo.innerHTML = '<p>Không thể tải thông tin người bán.</p>';
                    }
                });
            } catch (error) {
                console.error('Error loading seller info:', error);
                sellerInfo.innerHTML = '<p>Có lỗi xảy ra khi tải thông tin người bán.</p>';
            }
        });
    } else {
        sellerInfo.innerHTML = `
            <div style="display: flex; gap: 20px; align-items: center;">
                <div>
                    <p><strong>Tên cửa hàng:</strong> ${user.name || 'Chưa cập nhật'}</p>
                    <p><strong>Địa chỉ:</strong> ${user.sellerInfo?.address || 'Chưa cập nhật'}</p>
                    <p><strong>Số điện thoại:</strong> ${user.sellerInfo?.phone || user.phone || 'Chưa cập nhật'}</p>
                    <p><strong>Ngày đăng ký:</strong> ${user.sellerInfo?.registeredAt ? new Date(user.sellerInfo.registeredAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</p>
                </div>
            </div>
        `;
    }
}

function displayMyProducts(user) {
    const myProducts = document.getElementById('myProducts');
    if (!myProducts) return;
    
    // Show loading state
    myProducts.innerHTML = '<div class="empty-state">Đang tải sản phẩm...</div>';
    
    // Load products from Firebase with real-time listener
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then((firebase) => {
            try {
                // Set up real-time listener for products using correct Firebase v9 syntax
                const { ref, onValue } = firebase;
                const productsRef = ref(window.firebaseDatabase, 'products');
                
                onValue(productsRef, (snapshot) => {
                    try {
                        const productsData = snapshot.val();
                        let products = productsData ? Object.values(productsData) : [];
                        
                        // Filter products by current seller
                        products = products.filter(product => product.sellerId === user.uid);
                        
                        if (products.length === 0) {
                            myProducts.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên của bạn!</div>';
                            return;
                        }
                        
                        myProducts.innerHTML = `
                            <div class="grid">
                                ${products.map(product => `
                                    <div class="product card">
                                        <div class="pict">
                                            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/default-product.png'" style="width:100%;height:100%;object-fit:cover">
                                        </div>
                                        <div class="title">${product.name}</div>
                                        <div class="price">${formatCurrency(product.price)}</div>
                                        <div class="stock">Số lượng: ${product.quantity || 0}</div>
                                        <div style="display:flex;gap:8px;margin-top:8px">
                                            <button class="btn secondary" style="flex:1;font-size:12px;padding:6px" onclick="editProduct(${product.id})">Sửa</button>
                                            <button class="btn secondary" style="flex:1;font-size:12px;padding:6px" onclick="deleteProduct(${product.id})">Xóa</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    } catch (innerError) {
                        console.error('Error processing products:', innerError);
                        myProducts.innerHTML = '<div class="empty-state">Có lỗi xảy ra khi xử lý sản phẩm.</div>';
                    }
                });
            } catch (error) {
                console.error('Error loading products:', error);
                myProducts.innerHTML = '<div class="empty-state">Có lỗi xảy ra khi tải sản phẩm: ' + error.message + '</div>';
            }
        }).catch((importError) => {
            console.error('Error importing Firebase:', importError);
            myProducts.innerHTML = '<div class="empty-state">Không thể kết nối đến cơ sở dữ liệu.</div>';
        });
    } else {
        myProducts.innerHTML = '<div class="empty-state">Không thể kết nối đến cơ sở dữ liệu.</div>';
    }
}

// Update displaySalesReport to fetch real data from Firebase and set up real-time listener
function displaySalesReport(user) {
    const salesReport = document.getElementById('salesReport');
    const recentOrders = document.getElementById('recentOrders');
    if (!salesReport && !recentOrders) return;
    
    // Show loading state
    if (salesReport) {
        salesReport.innerHTML = '<div class="empty-state">Đang tải báo cáo...</div>';
    }
    if (recentOrders) {
        recentOrders.innerHTML = '<div class="empty-state">Đang tải đơn hàng...</div>';
    }
    
    // Load orders from Firebase with real-time listener
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then((firebase) => {
            try {
                // Set up real-time listener for orders
                const ordersRef = firebase.ref(window.firebaseDatabase, 'orders');
                ordersRef.on('value', (snapshot) => {
                    const ordersData = snapshot.val();
                    let orders = ordersData ? Object.values(ordersData) : [];
                    
                    // Filter orders that contain products from this seller
                    // Check each order's items to see if any belong to this seller
                    orders = orders.filter(order => {
                        if (!order.items || !Array.isArray(order.items)) return false;
                        return order.items.some(item => item.sellerId === user.uid);
                    });
                    
                    // Tính tổng doanh thu
                    let totalRevenue = 0;
                    let completedOrders = 0;
                    
                    orders.forEach(order => {
                        if (order.status === 'completed') {
                            completedOrders++;
                            // Tính doanh thu sau khi trừ 7% hoa hồng
                            const orderRevenue = order.total * 0.93;
                            totalRevenue += orderRevenue;
                        }
                    });
                    
                    // Update sales report section
                    if (salesReport) {
                        salesReport.innerHTML = `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                                <div class="card" style="text-align: center; padding: 20px;">
                                    <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${formatCurrency(totalRevenue)}</div>
                                    <div>Doanh thu (sau trừ 7% hoa hồng)</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 20px;">
                                    <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${completedOrders}</div>
                                    <div>Đơn hàng đã hoàn thành</div>
                                </div>
                                <div class="card" style="text-align: center; padding: 20px;">
                                    <div style="font-size: 24px; font-weight: bold; color: var(--primary);">${orders.length}</div>
                                    <div>Tổng đơn hàng</div>
                                </div>
                            </div>
                        `;
                    }
                    
                    // Update recent orders section
                    if (recentOrders) {
                        if (orders.length > 0) {
                            // Sort orders by timestamp (newest first)
                            orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            
                            recentOrders.innerHTML = `
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Trạng thái</th>
                                                <th>Tổng tiền</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${orders.map(order => `
                                                <tr>
                                                    <td>#${order.id}</td>
                                                    <td>${new Date(order.timestamp).toLocaleDateString('vi-VN')}</td>
                                                    <td><span class="badge ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</span></td>
                                                    <td>${formatCurrency(order.total)}</td>
                                                    <td>
                                                        <button class="btn secondary btn-sm" onclick="updateOrderStatus('${order.id}', '${getNextOrderStatus(order.status)}', '${order.status}')">Cập nhật trạng thái</button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `;
                        } else {
                            recentOrders.innerHTML = '<div class="empty-state">Chưa có đơn hàng nào.</div>';
                        }
                    }
                });
            } catch (error) {
                console.error('Error setting up real-time sales report:', error);
                if (salesReport) {
                    salesReport.innerHTML = '<div class="empty-state">Có lỗi xảy ra khi tải báo cáo doanh thu.</div>';
                }
                if (recentOrders) {
                    recentOrders.innerHTML = '<div class="empty-state">Có lỗi xảy ra khi tải đơn hàng.</div>';
                }
            }
        });
    } else {
        if (salesReport) {
            salesReport.innerHTML = '<div class="empty-state">Không thể kết nối đến cơ sở dữ liệu.</div>';
        }
        if (recentOrders) {
            recentOrders.innerHTML = '<div class="empty-state">Không thể kết nối đến cơ sở dữ liệu.</div>';
        }
    }
}

// Function to get next order status
function getNextOrderStatus(currentStatus) {
    const statusFlow = {
        'pending': 'confirmed',
        'confirmed': 'shipping',
        'shipping': 'delivered',
        'delivered': 'completed'
    };
    return statusFlow[currentStatus] || currentStatus;
}

// Function to update order status
async function updateOrderStatus(orderId, newStatus, currentStatus) {
    // Only allow sellers to update to next status in the flow
    const allowedTransitions = {
        'pending': 'confirmed',
        'confirmed': 'shipping',
        'shipping': 'delivered',
        'delivered': 'completed'
    };
    
    if (allowedTransitions[currentStatus] !== newStatus) {
        alert('Bạn không thể cập nhật trạng thái đơn hàng theo cách này.');
        return;
    }
    
    try {
        if (window.firebaseDatabase) {
            const firebase = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            const { ref, update } = firebase;
            
            const orderRef = ref(window.firebaseDatabase, 'orders/' + orderId);
            const statusTimestamp = {
                [getStatusTimestampField(newStatus)]: new Date().toISOString()
            };
            
            await update(orderRef, {
                status: newStatus,
                ...statusTimestamp
            });
            
            alert('Cập nhật trạng thái đơn hàng thành công!');
        } else {
            alert('Không thể kết nối đến cơ sở dữ liệu.');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
    }
}

// Function to get the timestamp field for a status
function getStatusTimestampField(status) {
    const fieldMap = {
        'confirmed': 'approvedAt',
        'shipping': 'shippedAt',
        'delivered': 'deliveredAt',
        'completed': 'completedAt',
        'cancelled': 'cancelledAt'
    };
    return fieldMap[status] || status + 'At';
}

function getOrderStatusClass(status) {
    const statusClasses = {
        'pending': 'info',
        'confirmed': 'warning',
        'shipping': 'warning',
        'delivered': 'success',
        'completed': 'success',
        'cancelled': 'danger',
        'returned': 'secondary'
    };
    return statusClasses[status] || 'info';
}

function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',
        'delivered': 'Đã giao',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'return_requested': 'Yêu cầu hoàn',
        'return_processed': 'Đã hoàn'
    };
    return statusMap[status] || status;
}

// Add the missing displayMonthlyRevenue function
function displayMonthlyRevenue(user) {
    const monthlyRevenueElement = document.getElementById('monthlyRevenue');
    if (!monthlyRevenueElement) return;
    
    // Show loading state
    monthlyRevenueElement.innerHTML = 'Đang tải...';
    
    // Load orders from Firebase with real-time listener
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then((firebase) => {
            try {
                // Use correct Firebase v9 syntax
                const { ref, onValue } = firebase;
                
                // Set up real-time listener for orders
                const ordersRef = ref(window.firebaseDatabase, 'orders');
                onValue(ordersRef, (snapshot) => {
                    const ordersData = snapshot.val();
                    let orders = ordersData ? Object.values(ordersData) : [];
                    
                    // Filter orders that contain products from this seller
                    // Check each order's items to see if any belong to this seller
                    orders = orders.filter(order => {
                        if (!order.items || !Array.isArray(order.items)) return false;
                        return order.items.some(item => item.sellerId === user.uid);
                    });
                    
                    // Calculate total revenue (all time)
                    let totalRevenue = 0;
                    
                    orders.forEach(order => {
                        if (order.status === 'completed') {
                            // Tính doanh thu sau khi trừ 7% hoa hồng
                            const orderRevenue = order.total * 0.93;
                            totalRevenue += orderRevenue;
                        }
                    });
                    
                    // Update total revenue display
                    monthlyRevenueElement.innerHTML = formatCurrency(totalRevenue);
                });
            } catch (error) {
                console.error('Error loading total revenue:', error);
                monthlyRevenueElement.innerHTML = 'Lỗi tải dữ liệu';
            }
        }).catch((importError) => {
            console.error('Error importing Firebase:', importError);
            monthlyRevenueElement.innerHTML = 'Không thể kết nối';
        });
    } else {
        monthlyRevenueElement.innerHTML = 'Không thể kết nối';
    }
}

function updateSellerUI(user) {
    const sellerStatusText = document.getElementById('sellerStatusText');
    const becomeSellerBtn = document.getElementById('becomeSeller');
    const addProductBtn = document.getElementById('addProductBtn');
    const viewMyProductsBtn = document.getElementById('viewMyProducts');

    if (user.role === 'seller' || user.role === 'admin') {
        sellerStatusText.textContent = user.role === 'admin' ? 'Quản trị viên' : 'Người bán';
        becomeSellerBtn.style.display = 'none';
        addProductBtn.style.display = 'inline-block';
        viewMyProductsBtn.style.display = 'inline-block';
    } else {
        sellerStatusText.textContent = 'Người mua';
        becomeSellerBtn.style.display = 'inline-block';
        addProductBtn.style.display = 'none';
        viewMyProductsBtn.style.display = 'none';
    }
}

// Hiển thị form đăng ký người bán
function showSellerRegistrationForm(user) {
    // Tạo modal form đăng ký người bán
    const modal = document.createElement('div');
    modal.id = 'sellerRegistrationModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; width: 90%;">
            <div class="modal-header">
                <h3>Đăng ký trở thành người bán</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <p>Vui lòng cung cấp thông tin cần thiết để trở thành người bán trên HgShop:</p>
                
                <div class="form-group">
                    <label for="sellerAddress">Địa chỉ người bán hàng:</label>
                    <input type="text" id="sellerAddress" class="form-control" placeholder="Nhập địa chỉ của bạn">
                </div>
                
                <div class="form-group">
                    <label for="sellerPhone">Số điện thoại thường dùng:</label>
                    <input type="tel" id="sellerPhone" class="form-control" placeholder="Nhập số điện thoại">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="agreeToTerms"> 
                        Tôi đồng ý với <a href="seller-terms.html" target="_blank">Điều khoản dịch vụ bán hàng trên HgShop</a>
                    </label>
                </div>
                
                <div class="form-group">
                    <button id="submitSellerRegistration" class="btn primary" style="width: 100%;">Đăng ký</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Xử lý đóng modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    // Đóng modal khi click ngoài nội dung
    window.onclick = function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    // Xử lý submit form
    const submitBtn = document.getElementById('submitSellerRegistration');
    submitBtn.onclick = () => {
        const address = document.getElementById('sellerAddress').value.trim();
        const phone = document.getElementById('sellerPhone').value.trim();
        const agreeToTerms = document.getElementById('agreeToTerms').checked;
        
        if (!address) {
            alert('Vui lòng nhập địa chỉ người bán hàng');
            return;
        }
        
        if (!phone) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        
        if (!agreeToTerms) {
            alert('Bạn phải đồng ý với điều khoản dịch vụ để trở thành người bán');
            return;
        }
        
        // Gọi hàm đăng ký người bán với thông tin bổ sung
        becomeSeller(user, address, phone);
        
        // Đóng modal
        document.body.removeChild(modal);
    };
}

async function becomeSeller(user, address, phone) {
    try {
        // Cập nhật role và thông tin người bán trong Firebase
        if (window.firebaseDatabase) {
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            await update(ref(window.firebaseDatabase, 'users/' + user.uid), {
                role: 'seller',
                sellerInfo: {
                    address: address,
                    phone: phone,
                    registeredAt: new Date().toISOString()
                }
            });
        }

        // Cập nhật localStorage
        user.role = 'seller';
        user.sellerInfo = {
            address: address,
            phone: phone,
            registeredAt: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Cập nhật UI
        updateSellerUI(user);
        
        alert('Chúc mừng! Bạn đã trở thành người bán. Bây giờ bạn có thể thêm sản phẩm mới.');
    } catch (error) {
        console.error('Error becoming seller:', error);
        alert('Có lỗi xảy ra khi đăng ký làm người bán: ' + error.message);
    }
}

async function addNewProduct(user) {
    const name = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const imageInput = document.getElementById('productImage');
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const specificationsText = document.getElementById('productSpecifications')?.value.trim();
    const quantity = parseInt(document.getElementById('productQuantity').value) || 100;

    if (!name || !price || !imageInput.files || imageInput.files.length === 0) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc (tên, giá, ảnh)');
        return;
    }

    try {
        // Upload image to Cloudinary first
        const imageUrl = await uploadProductImage(imageInput);
        if (!imageUrl) {
            throw new Error('Không thể tải ảnh lên Cloudinary');
        }

        // Parse specifications if provided
        let specifications = [];
        if (specificationsText) {
            specifications = specificationsText.split('\n').filter(spec => spec.trim() !== '');
        }

        // Tạo ID mới cho sản phẩm
        const productId = Date.now();
        
        const newProduct = {
            id: productId,
            name,
            category,
            price,
            image: imageUrl, // Use the Cloudinary URL
            description: description || 'Sản phẩm chất lượng từ người bán.',
            specifications: specifications.length > 0 ? specifications : ['Chất lượng tốt', 'Bảo hành 12 tháng'],
            supplier: user.name,
            rating: 4.0,
            reviews: [],
            sellerId: user.uid,
            sellerName: user.name,
            quantity: quantity,
            createdAt: new Date().toISOString()
        };

        // Lưu vào Firebase
        if (window.firebaseDatabase) {
            const { ref, set } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            await set(ref(window.firebaseDatabase, 'products/' + productId), newProduct);
        }

        alert('Thêm sản phẩm thành công!');
        
        // Reset form
        document.getElementById('productForm').style.display = 'none';
        document.querySelectorAll('#productForm input, #productForm textarea, #productForm select').forEach(el => {
            if (el.type !== 'file') el.value = '';
        });
        
        // Hide image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
        
        // Cập nhật hiển thị sản phẩm nếu đang ở trang seller
        if (window.location.pathname.includes('seller.html')) {
            displayMyProducts(user);
        }
        
        // Refresh products on index page (if needed)
        window.dispatchEvent(new Event('productAdded'));
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Có lỗi xảy ra khi thêm sản phẩm: ' + error.message);
    }
}

function editProduct(productId) {
    // Load product data from Firebase
    if (window.firebaseDatabase) {
        import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then(async (firebase) => {
            try {
                const snapshot = await firebase.get(firebase.ref(window.firebaseDatabase, 'products/' + productId));
                const product = snapshot.val();
                
                if (!product) {
                    alert('Không tìm thấy sản phẩm');
                    return;
                }
                
                // Format specifications for textarea
                const specificationsText = product.specifications ? product.specifications.join('\n') : '';
                
                // Create edit modal
                const modal = document.createElement('div');
                modal.id = 'editProductModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 500px; width: 90%;">
                        <div class="modal-header">
                            <h3>Chỉnh sửa sản phẩm</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="editProductName">Tên sản phẩm</label>
                                <input type="text" id="editProductName" class="form-control" value="${product.name}">
                            </div>
                            
                            <div class="form-group">
                                <label for="editProductDescription">Mô tả sản phẩm</label>
                                <textarea id="editProductDescription" class="form-control" rows="3">${product.description}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="editProductSpecifications">Thông số kỹ thuật (mỗi dòng một thông số)</label>
                                <textarea id="editProductSpecifications" class="form-control" rows="4">${specificationsText}</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group" style="flex:1">
                                    <label for="editProductPrice">Giá sản phẩm (đ)</label>
                                    <input type="number" id="editProductPrice" class="form-control" value="${product.price}">
                                </div>
                                <div class="form-group" style="flex:1">
                                    <label for="editProductQuantity">Số lượng</label>
                                    <input type="number" id="editProductQuantity" class="form-control" value="${product.quantity}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="editProductCategory">Danh mục</label>
                                <select id="editProductCategory" class="form-control">
                                    <option value="monitor" ${product.category === 'monitor' ? 'selected' : ''}>Màn hình</option>
                                    <option value="laptop" ${product.category === 'laptop' ? 'selected' : ''}>Laptop & Linh kiện</option>
                                    <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Phụ kiện</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editProductImage">Ảnh sản phẩm</label>
                                <input type="file" id="editProductImage" class="form-control" accept="image/*">
                                <div id="editImagePreview" style="margin-top:10px">
                                    <img src="${product.image}" style="max-width:200px;max-height:200px;border-radius:8px">
                                </div>
                            </div>
                            
                            <button id="updateProduct" class="btn primary" style="margin-top:10px">Cập nhật sản phẩm</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Handle image preview
                const editProductImage = document.getElementById('editProductImage');
                const editImagePreview = document.getElementById('editImagePreview');
                
                editProductImage.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            editImagePreview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:200px;border-radius:8px">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                // Handle close modal
                const closeBtn = modal.querySelector('.close');
                closeBtn.onclick = () => {
                    document.body.removeChild(modal);
                };
                
                window.onclick = function(event) {
                    if (event.target === modal) {
                        document.body.removeChild(modal);
                    }
                };
                
                // Handle update product
                const updateProductBtn = document.getElementById('updateProduct');
                updateProductBtn.onclick = async () => {
                    const updatedName = document.getElementById('editProductName').value.trim();
                    const updatedDescription = document.getElementById('editProductDescription').value.trim();
                    const updatedSpecificationsText = document.getElementById('editProductSpecifications').value.trim();
                    const updatedPrice = parseInt(document.getElementById('editProductPrice').value);
                    const updatedQuantity = parseInt(document.getElementById('editProductQuantity').value);
                    const updatedCategory = document.getElementById('editProductCategory').value;
                    
                    if (!updatedName || !updatedPrice) {
                        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                        return;
                    }
                    
                    try {
                        let updatedImage = product.image; // Default to existing image
                        
                        // Upload new image if selected
                        if (editProductImage.files && editProductImage.files.length > 0) {
                            const imageUrl = await uploadProductImage(editProductImage);
                            if (imageUrl) {
                                updatedImage = imageUrl;
                            }
                        }
                        
                        // Parse specifications if provided
                        let updatedSpecifications = product.specifications || [];
                        if (updatedSpecificationsText) {
                            updatedSpecifications = updatedSpecificationsText.split('\n').filter(spec => spec.trim() !== '');
                        }
                        
                        // Update product in Firebase
                        const updatedProduct = {
                            ...product,
                            name: updatedName,
                            description: updatedDescription,
                            specifications: updatedSpecifications,
                            price: updatedPrice,
                            quantity: updatedQuantity,
                            category: updatedCategory,
                            image: updatedImage,
                            updatedAt: new Date().toISOString()
                        };
                        
                        await firebase.set(firebase.ref(window.firebaseDatabase, 'products/' + productId), updatedProduct);
                        
                        alert('Cập nhật sản phẩm thành công!');
                        document.body.removeChild(modal);
                        
                        // Refresh product display
                        const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
                        if (cur && window.location.pathname.includes('seller.html')) {
                            displayMyProducts(cur);
                        }
                        
                        // Refresh products on index page
                        window.dispatchEvent(new Event('productAdded'));
                    } catch (error) {
                        console.error('Error updating product:', error);
                        alert('Có lỗi xảy ra khi cập nhật sản phẩm: ' + error.message);
                    }
                };
            } catch (error) {
                console.error('Error loading product:', error);
                alert('Có lỗi xảy ra khi tải thông tin sản phẩm: ' + error.message);
            }
        });
    }
}

function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    try {
        // Xóa từ Firebase
        if (window.firebaseDatabase) {
            import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js").then(async (firebase) => {
                try {
                    await firebase.remove(firebase.ref(window.firebaseDatabase, 'products/' + productId));
                    
                    alert('Đã xóa sản phẩm!');
                    
                    // Cập nhật hiển thị nếu đang ở trang seller
                    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
                    if (cur && window.location.pathname.includes('seller.html')) {
                        displayMyProducts(cur);
                    }
                    
                    // Refresh products on index page
                    window.dispatchEvent(new Event('productAdded'));
                } catch (error) {
                    console.error('Error deleting product:', error);
                    alert('Có lỗi xảy ra khi xóa sản phẩm: ' + error.message);
                }
            });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm: ' + error.message);
    }
}

// Save store information to Firebase
async function saveStoreInfo(user) {
    const storeName = document.getElementById('storeName').value.trim();
    const storeDescription = document.getElementById('storeDescription').value.trim();
    
    if (!storeName) {
        alert('Vui lòng nhập tên cửa hàng');
        return;
    }
    
    try {
        // Update store info in Firebase
        if (window.firebaseDatabase) {
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            await update(ref(window.firebaseDatabase, 'users/' + user.uid), {
                storeInfo: {
                    name: storeName,
                    description: storeDescription,
                    updatedAt: new Date().toISOString()
                }
            });
        }
        
        alert('Lưu thông tin cửa hàng thành công!');
    } catch (error) {
        console.error('Error saving store info:', error);
        alert('Có lỗi xảy ra khi lưu thông tin cửa hàng: ' + error.message);
    }
}

function viewMyProducts(user) {
    // Chuyển đến trang seller dashboard
    window.location.href = 'seller.html';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Make functions globally available
window.displayMyProducts = displayMyProducts;
window.addNewProduct = addNewProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.saveStoreInfo = saveStoreInfo;
window.displayMonthlyRevenue = displayMonthlyRevenue;
window.becomeSeller = becomeSeller;
window.initSeller = initSeller;
window.initSellerDashboard = initSellerDashboard;
window.initSellerFeatures = initSellerFeatures;
window.updateSellerUI = updateSellerUI;
window.showSellerRegistrationForm = showSellerRegistrationForm;
window.viewMyProducts = viewMyProducts;
window.formatCurrency = formatCurrency;
