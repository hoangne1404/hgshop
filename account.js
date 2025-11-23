// account.js - Quản lý trang tài khoản người dùng
document.addEventListener('DOMContentLoaded', function() {
    initAccountPage();
});

function initAccountPage() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) {
        window.location.href = 'login.html';
        return;
    }

    // Hiển thị thông tin người dùng
    displayUserInfo(cur);
    
    // Hiển thị đơn hàng
    displayUserOrders(cur);
    
    // Hiển thị section người bán
    displaySellerSection(cur);
}

function displayUserInfo(user) {
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.innerHTML = `
            <strong>Họ tên:</strong> ${user.name || 'Chưa cập nhật'}<br>
            <strong>Email:</strong> ${user.email || 'Chưa cập nhật'}<br>
            <strong>Số điện thoại:</strong> ${user.phone || 'Chưa cập nhật'}<br>
            <strong>Vai trò:</strong> ${user.role === 'admin' ? 'Quản trị viên' : user.role === 'seller' ? 'Người bán' : 'Người mua'}
        `;
    }
    
    // Điền thông tin vào form chỉnh sửa
    if (document.getElementById('edit_name')) {
        document.getElementById('edit_name').value = user.name || '';
    }
    if (document.getElementById('edit_phone')) {
        document.getElementById('edit_phone').value = user.phone || '';
    }
}

function displayUserOrders(user) {
    const ordersSection = document.getElementById('ordersSection');
    if (!ordersSection) return;
    
    const ordersTitle = document.getElementById('ordersTitle');
    const myOrders = document.getElementById('myOrders');
    
    if (ordersTitle) ordersTitle.textContent = 'Đơn hàng của tôi';
    
    // Lấy đơn hàng của người dùng
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders = orders.filter(order => order.userId === user.uid);
    
    if (myOrders) {
        if (orders.length === 0) {
            myOrders.innerHTML = '<p>Chưa có đơn hàng nào.</p>';
        } else {
            myOrders.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <span><strong>Đơn hàng #${order.id}</strong></span>
                        <span class="order-status ${order.status}">${getOrderStatusText(order.status)}</span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="images/sanpham/${item.image}" alt="${item.name}" onerror="this.src='images/default-product.png'">
                                <div>
                                    <div>${item.name}</div>
                                    <div>Số lượng: ${item.qty}</div>
                                    <div>Giá: ${formatCurrency(item.price)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-footer">
                        <div><strong>Tổng tiền:</strong> ${formatCurrency(order.total)}</div>
                        <div>${renderOrderActions(order)}</div>
                    </div>
                </div>
            `).join('');
        }
    }
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

function renderOrderActions(order) {
    let actions = '';
    
    if (order.status === 'delivered') {
        actions += `<button class="btn secondary" onclick="showReviewForm('${order.id}')">Đánh giá</button>`;
    }
    
    if (order.status === 'completed') {
        // Không có hành động nào
    }
    
    if (order.status === 'return_requested') {
        actions += `<button class="btn secondary" onclick="showReturnStatus('${order.id}')">Xem trạng thái hoàn</button>`;
    }
    
    return actions;
}

function displaySellerSection(user) {
    const sellerSection = document.getElementById('becomeSellerSection');
    if (!sellerSection) return;
    
    if (user.role === 'seller' || user.role === 'admin') {
        // Người dùng đã là người bán
        sellerSection.innerHTML = `
            <h3>Cửa hàng của tôi</h3>
            <p>Bạn là <strong>${user.role === 'admin' ? 'quản trị viên' : 'người bán'}</strong> trên HgShop.</p>
            <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
                <button id="addProductBtn" class="btn primary">Thêm sản phẩm mới</button>
                <button id="viewMyProducts" class="btn secondary">Xem sản phẩm của tôi</button>
                <button id="viewSalesReport" class="btn secondary">Báo cáo doanh số</button>
            </div>
            
            <!-- Modal thêm sản phẩm -->
            <div id="addProductModal" class="modal hidden">
                <div class="modal-content" style="max-width: 600px; width: 90%;">
                    <div class="modal-header">
                        <h3>Thêm sản phẩm mới</h3>
                        <span id="closeProductModal" class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="productName">Tên sản phẩm *</label>
                            <input type="text" id="productName" class="form-control" placeholder="Nhập tên sản phẩm">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productPrice">Giá (VNĐ) *</label>
                                <input type="number" id="productPrice" class="form-control" placeholder="Nhập giá sản phẩm">
                            </div>
                            
                            <div class="form-group">
                                <label for="productCategory">Danh mục</label>
                                <select id="productCategory" class="form-control">
                                    <option value="laptop">Laptop</option>
                                    <option value="monitor">Màn hình</option>
                                    <option value="accessories">Phụ kiện</option>
                                    <option value="components">Linh kiện</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productImage">URL ảnh sản phẩm *</label>
                            <input type="text" id="productImage" class="form-control" placeholder="Nhập URL ảnh sản phẩm">
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Mô tả sản phẩm</label>
                            <textarea id="productDescription" class="form-control" rows="3" placeholder="Nhập mô tả sản phẩm"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="productSpecs">Thông số kỹ thuật (mỗi dòng một thông số)</label>
                            <textarea id="productSpecs" class="form-control" rows="4" placeholder="VD: CPU: Intel Core i7&#10;RAM: 16GB&#10;Ổ cứng: 512GB SSD"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <button id="submitProduct" class="btn primary" style="width: 100%;">Thêm sản phẩm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Người dùng chưa phải là người bán
        sellerSection.innerHTML = `
            <h3>Trở thành người bán hàng</h3>
            <p>Bạn hiện đang là <strong>người mua</strong>. Trở thành người bán để có thể đăng bán sản phẩm trên HgShop.</p>
            <p><strong>Lợi ích khi trở thành người bán:</strong></p>
            <ul>
                <li>Đăng bán sản phẩm của bạn</li>
                <li>Quản lý đơn hàng và doanh thu</li>
                <li>Tiếp cận hàng triệu khách hàng tiềm năng</li>
                <li>Hỗ trợ marketing và quảng bá sản phẩm</li>
            </ul>
            <button id="becomeSeller" class="btn primary">Đăng ký trở thành người bán</button>
        `;
    }
    
    // Khởi tạo tính năng người bán
    initSellerFeatures();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}