/* admin.js - admin order management with enhanced features và quản lý user/sản phẩm */

document.addEventListener('DOMContentLoaded', async ()=>{
  // First, try to get user from localStorage
  let cur = JSON.parse(localStorage.getItem('currentUser')||'null');
  
  // If not found in localStorage, try to get from Firebase Auth
  if (!cur && window.firebaseAuth) {
    try {
      const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
      
      // Wait for auth state to be ready
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(window.firebaseAuth, async (user) => {
          unsubscribe(); // Unsubscribe immediately
          if (user) {
            // Get user data from database
            if (window.firebaseDatabase) {
              const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
              const userRef = ref(window.firebaseDatabase, 'users/' + user.uid);
              const snapshot = await get(userRef);
              
              if (snapshot.exists()) {
                const userData = snapshot.val();
                cur = {
                  uid: user.uid,
                  email: user.email,
                  ...userData
                };
                // Save to localStorage for future use
                localStorage.setItem('currentUser', JSON.stringify(cur));
              }
            }
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('Error getting user from Firebase Auth:', error);
    }
  }
  
  console.log('Current user:', cur);
  
  // Check if user is admin
  if(!cur || cur.role!=='admin'){ 
    console.log('User is not admin, redirecting to login');
    alert('Cần quyền admin'); 
    location.href='login.html'; 
    return; 
  }
  
  const wrap = document.getElementById('ordersAdmin');
  const statsContainer = document.getElementById('adminStats');
  console.log('Admin page loaded, wrap element:', wrap);

  // Tab management
  let currentTab = 'orders';
  
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }
  
  // Initialize tabs
  initTabs();

  // Initial render
  render();

  async function render(){
    if (currentTab === 'orders') {
      await renderOrders();
    } else if (currentTab === 'users') {
      await renderUsers();
    } else if (currentTab === 'products') {
      await renderProducts();
    } else if (currentTab === 'revenue') {
      await renderRevenue();
    }
  }

  async function renderOrders() {
    // Show loading state
    wrap.innerHTML = '<div class="empty-state">Đang tải đơn hàng...</div>';
    
    // Load orders from Firebase with real-time listener
    if (window.firebaseDatabase) {
        const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
        
        // Set up real-time listener for orders
        const ordersRef = ref(window.firebaseDatabase, 'orders');
        onValue(ordersRef, (snapshot) => {
          console.log('Firebase orders snapshot received');
          const ordersData = snapshot.val();
          console.log('Raw orders data from Firebase:', ordersData);
          
          let orders = [];
          if (ordersData) {
            // Handle different data structures
            if (Array.isArray(ordersData)) {
              orders = ordersData;
            } else if (typeof ordersData === 'object') {
              // Convert object to array
              orders = Object.values(ordersData);
            }
          }
          
          console.log('Processed orders array:', orders);
          
          // Sort by timestamp (newest first)
          orders.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.createdAt || 0);
            const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          
          // Update stats
          updateDashboardStats(orders);
          
          if(orders.length===0){ 
              wrap.innerHTML='<div class="empty-state">Chưa có đơn hàng.</div>'; 
              return; 
          }
          
          wrap.innerHTML = `
            <div class="admin-content-header">
              <h2 class="admin-content-title">Quản lý đơn hàng (${orders.length})</h2>
            </div>
            <div class="order-list">
              ${orders.map(order => `
                <div class="order-card">
                  <div class="order-header">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-status ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</div>
                  </div>
                  <div class="order-details">
                    <div><strong>Khách hàng:</strong> ${order.userEmail || order.email || 'Không có email'}</div>
                    <div><strong>Địa chỉ:</strong> ${order.address || 'Không có địa chỉ'}</div>
                    <div><strong>Phương thức:</strong> ${order.method === 'cod' ? 'Thanh toán khi nhận' : order.method === 'qr' ? 'Chuyển khoản (QR)' : 'Không xác định'}</div>
                    <div><strong>Ngày tạo:</strong> ${new Date(order.timestamp || order.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
                    <div><strong>Tổng tiền:</strong> ${parseInt(order.total || 0).toLocaleString('vi-VN')}đ</div>
                  </div>
                  <div class="order-items">
                    <strong>Sản phẩm:</strong>
                    ${order.items && Array.isArray(order.items) ? order.items.map(item => `${item.name || 'Sản phẩm'} x${item.qty || 0}`).join(', ') : 'Không có thông tin sản phẩm'}
                  </div>
                  ${order.approvedAt ? `<div><strong>Duyệt lúc:</strong> ${new Date(order.approvedAt).toLocaleString('vi-VN')}</div>` : ''}
                  ${order.deliveredAt ? `<div><strong>Giao lúc:</strong> ${new Date(order.deliveredAt).toLocaleString('vi-VN')}</div>` : ''}
                  ${order.returnRequest ? `
                    <div style="margin-top:12px;padding:12px;background:#fef2f2;border-radius:8px">
                      <h4>Yêu cầu hoàn hàng</h4>
                      <p><strong>Lý do:</strong> ${order.returnRequest.reason}</p>
                      <p><strong>Trạng thái:</strong> ${order.returnRequest.status}</p>
                      <p><strong>Ngày yêu cầu:</strong> ${new Date(order.returnRequest.requestedAt).toLocaleString('vi-VN')}</p>
                      ${order.returnRequest.status === 'pending' ? `
                        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                          <button class="btn-secondary" data-action="approve-return" data-id="${order.id}">Chấp nhận</button>
                          <button class="btn-danger" data-action="reject-return" data-id="${order.id}">Từ chối</button>
                          <textarea id="returnNote-${order.id}" placeholder="Ghi chú (nếu từ chối)" style="flex:1;padding:8px;border-radius:4px;border:1px solid #e5e7eb"></textarea>
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                  <div class="order-actions">
                    <select data-id="${order.id}" class="status-select" style="flex:1;max-width:200px">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                      <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                      <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao hàng</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao hàng</option>
                      <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                      <option value="returned" ${order.status === 'returned' ? 'selected' : ''}>Đã hoàn hàng</option>
                    </select>
                    <button class="btn-danger" data-action="delete-order" data-id="${order.id}">Xóa đơn</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          
          // Add event listeners for actions
          document.querySelectorAll('[data-action="approve-return"]').forEach(b=>{
            b.onclick = ()=>{
              processReturnRequest(b.dataset.id, 'approved');
            };
          });
          
          document.querySelectorAll('[data-action="reject-return"]').forEach(b=>{
            b.onclick = ()=>{
              const note = document.getElementById(`returnNote-${b.dataset.id}`).value;
              processReturnRequest(b.dataset.id, 'rejected', note);
            };
          });
          
          document.querySelectorAll('.status-select').forEach(sel=>{
            sel.onchange = ()=>{
              const id = sel.dataset.id;
              const val = sel.value;
              updateOrderStatus(id, val);
            };
          });
          
          // Xử lý nút xóa đơn hàng
          document.querySelectorAll('[data-action="delete-order"]').forEach(b=>{
            b.onclick = ()=>{
              if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
                deleteOrder(b.dataset.id);
              }
            };
          });
        });
    } else {
        // Fallback to localStorage
        console.log('Using localStorage fallback for orders');
        const orders = JSON.parse(localStorage.getItem('orders')||'[]').sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
        console.log('LocalStorage orders:', orders);
        
        // Update stats
        updateDashboardStats(orders);
        
        if(orders.length===0){ wrap.innerHTML='<div class="empty-state">Chưa có đơn hàng.</div>'; return; }
        wrap.innerHTML = `
        <div class="admin-content-header">
          <h2 class="admin-content-title">Quản lý đơn hàng (${orders.length})</h2>
        </div>
        <div class="order-list">
          ${orders.map(order => `
            <div class="order-card">
              <div class="order-header">
                <div class="order-id">#${order.id}</div>
                <div class="order-status ${getOrderStatusClass(order.status)}">${getOrderStatusText(order.status)}</div>
              </div>
              <div class="order-details">
                <div><strong>Khách hàng:</strong> ${order.userEmail}</div>
                <div><strong>Địa chỉ:</strong> ${order.address}</div>
                <div><strong>Phương thức:</strong> ${order.method === 'cod' ? 'Thanh toán khi nhận' : 'Chuyển khoản (QR)'}</div>
                <div><strong>Ngày tạo:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                <div><strong>Tổng tiền:</strong> ${parseInt(order.total).toLocaleString('vi-VN')}đ</div>
              </div>
              <div class="order-items">
                <strong>Sản phẩm:</strong>
                ${order.items && Array.isArray(order.items) ? order.items.map(item => `${item.name} x${item.qty}`).join(', ') : 'Không có thông tin sản phẩm'}
              </div>
              ${order.approvedAt ? `<div><strong>Duyệt lúc:</strong> ${new Date(order.approvedAt).toLocaleString('vi-VN')}</div>` : ''}
              ${order.deliveredAt ? `<div><strong>Giao lúc:</strong> ${new Date(order.deliveredAt).toLocaleString('vi-VN')}</div>` : ''}
              ${order.returnRequest ? `
                <div style="margin-top:12px;padding:12px;background:#fef2f2;border-radius:8px">
                  <h4>Yêu cầu hoàn hàng</h4>
                  <p><strong>Lý do:</strong> ${order.returnRequest.reason}</p>
                  <p><strong>Trạng thái:</strong> ${order.returnRequest.status}</p>
                  <p><strong>Ngày yêu cầu:</strong> ${new Date(order.returnRequest.requestedAt).toLocaleString('vi-VN')}</p>
                  ${order.returnRequest.status === 'pending' ? `
                    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                      <button class="btn-secondary" data-action="approve-return" data-id="${order.id}">Chấp nhận</button>
                      <button class="btn-danger" data-action="reject-return" data-id="${order.id}">Từ chối</button>
                      <textarea id="returnNote-${order.id}" placeholder="Ghi chú (nếu từ chối)" style="flex:1;padding:8px;border-radius:4px;border:1px solid #e5e7eb"></textarea>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
              <div class="order-actions">
                <select data-id="${order.id}" class="status-select" style="flex:1;max-width:200px">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                  <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                  <option value="shipping" ${order.status === 'shipping' ? 'selected' : ''}>Đang giao hàng</option>
                  <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao hàng</option>
                  <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                  <option value="returned" ${order.status === 'returned' ? 'selected' : ''}>Đã hoàn hàng</option>
                </select>
                <button class="btn-danger" data-action="delete-order" data-id="${order.id}">Xóa đơn</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Add event listeners for actions
      document.querySelectorAll('[data-action="approve-return"]').forEach(b=>{
        b.onclick = ()=>{
          processReturnRequest(b.dataset.id, 'approved');
        };
      });
      
      document.querySelectorAll('[data-action="reject-return"]').forEach(b=>{
        b.onclick = ()=>{
          const note = document.getElementById(`returnNote-${b.dataset.id}`).value;
          processReturnRequest(b.dataset.id, 'rejected', note);
        };
      });
      
      document.querySelectorAll('.status-select').forEach(sel=>{
        sel.onchange = ()=>{
          const id = sel.dataset.id;
          const val = sel.value;
          updateOrderStatus(id, val);
        };
      });
      
      // Xử lý nút xóa đơn hàng
      document.querySelectorAll('[data-action="delete-order"]').forEach(b=>{
        b.onclick = ()=>{
          if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
            deleteOrder(b.dataset.id);
          }
        };
      });
    }
  }

  async function renderUsers() {
    // Show loading state
    wrap.innerHTML = '<div class="empty-state">Đang tải người dùng...</div>';
    
    // Load users from Firebase with real-time listener
    if (window.firebaseDatabase) {
      const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
      
      // Set up real-time listener for users
      const usersRef = ref(window.firebaseDatabase, 'users');
      onValue(usersRef, (snapshot) => {
        const usersData = snapshot.val();
        const users = usersData ? Object.entries(usersData).map(([uid, user]) => ({ uid, ...user })) : [];
        
        if (users.length === 0) {
          wrap.innerHTML = '<div class="empty-state">Chưa có người dùng nào.</div>';
          return;
        }
        
        wrap.innerHTML = `
          <div class="admin-content-header">
            <h2 class="admin-content-title">Quản lý người dùng (${users.length})</h2>
            <button class="btn-primary" onclick="showAddUserForm()">Thêm người dùng mới</button>
          </div>
          <div class="user-list">
            ${users.map(user => `
              <div class="user-item">
                <div style="flex:1">
                  <div><strong>${user.name}</strong> (${user.email})</div>
                  <div>Điện thoại: ${user.phone || 'Chưa có'} | Vai trò: 
                    <span class="role-badge ${user.role}">${user.role === 'admin' ? 'Quản trị viên' : user.role === 'seller' ? 'Người bán' : 'Người dùng'}</span>
                  </div>
                  <div>Ngày tạo: ${new Date(user.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn-secondary" onclick="editUser('${user.uid}')">Sửa</button>
                  <button class="btn-danger" onclick="deleteUser('${user.uid}', '${user.email}')">Xóa</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      });
    } else {
      // Fallback to localStorage
      try {
        const snapshot = await database.ref('users').once('value');
        const usersData = snapshot.val();
        const users = usersData ? Object.entries(usersData).map(([uid, user]) => ({ uid, ...user })) : [];
        
        if (users.length === 0) {
          wrap.innerHTML = '<div class="empty-state">Chưa có người dùng nào.</div>';
          return;
        }
        
        wrap.innerHTML = `
          <div class="admin-content-header">
            <h2 class="admin-content-title">Quản lý người dùng (${users.length})</h2>
            <button class="btn-primary" onclick="showAddUserForm()">Thêm người dùng mới</button>
          </div>
          <div class="user-list">
            ${users.map(user => `
              <div class="user-item">
                <div style="flex:1">
                  <div><strong>${user.name}</strong> (${user.email})</div>
                  <div>Điện thoại: ${user.phone || 'Chưa có'} | Vai trò: 
                    <span class="role-badge ${user.role}">${user.role === 'admin' ? 'Quản trị viên' : user.role === 'seller' ? 'Người bán' : 'Người dùng'}</span>
                  </div>
                  <div>Ngày tạo: ${new Date(user.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn-secondary" onclick="editUser('${user.uid}')">Sửa</button>
                  <button class="btn-danger" onclick="deleteUser('${user.uid}', '${user.email}')">Xóa</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (error) {
        console.error('Error loading users:', error);
        wrap.innerHTML = '<div class="empty-state">Lỗi khi tải danh sách người dùng.</div>';
      }
    }
  }

  async function renderProducts() {
    // Show loading state
    wrap.innerHTML = '<div class="empty-state">Đang tải sản phẩm...</div>';
    
    // Load products from Firebase with real-time listener
    if (window.firebaseDatabase) {
      const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
      
      // Set up real-time listener for products
      const productsRef = ref(window.firebaseDatabase, 'products');
      onValue(productsRef, (snapshot) => {
        const productsData = snapshot.val();
        const products = productsData ? Object.values(productsData) : [];
        
        if (products.length === 0) {
          wrap.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào.</div>';
          return;
        }
        
        wrap.innerHTML = `
          <div class="admin-content-header">
            <h2 class="admin-content-title">Quản lý sản phẩm (${products.length})</h2>
            <button class="btn-primary" onclick="showAddProductForm()">Thêm sản phẩm mới</button>
          </div>
          <div class="product-list">
            ${products.map(product => `
              <div class="product-item">
                <img src="${product.image.startsWith('http') ? product.image : 'images/sanpham/' + product.image}" alt="${product.name}" onerror="this.src='images/default-product.png'">
                <div style="flex:1">
                  <div><strong>${product.name}</strong></div>
                  <div>Giá: ${parseInt(product.price).toLocaleString('vi-VN')}đ | Danh mục: ${product.category}</div>
                  <div>Số lượng: ${product.quantity || 0} | Người bán: ${product.sellerName || product.seller || 'HgShop'}</div>
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn-secondary" onclick="editProduct(${product.id})">Sửa</button>
                  <button class="btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      });
    } else {
      // Fallback to localStorage
      try {
        const snapshot = await database.ref('products').once('value');
        const productsData = snapshot.val();
        const products = productsData ? Object.values(productsData) : [];
        
        if (products.length === 0) {
          wrap.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào.</div>';
          return;
        }
        
        wrap.innerHTML = `
          <div class="admin-content-header">
            <h2 class="admin-content-title">Quản lý sản phẩm (${products.length})</h2>
            <button class="btn-primary" onclick="showAddProductForm()">Thêm sản phẩm mới</button>
          </div>
          <div class="product-list">
            ${products.map(product => `
              <div class="product-item">
                <img src="${product.image.startsWith('http') ? product.image : 'images/sanpham/' + product.image}" alt="${product.name}" onerror="this.src='images/default-product.png'">
                <div style="flex:1">
                  <div><strong>${product.name}</strong></div>
                  <div>Giá: ${parseInt(product.price).toLocaleString('vi-VN')}đ | Danh mục: ${product.category}</div>
                  <div>Số lượng: ${product.quantity || 0} | Người bán: ${product.sellerName || product.seller || 'HgShop'}</div>
                </div>
                <div style="display:flex;gap:8px">
                  <button class="btn-secondary" onclick="editProduct(${product.id})">Sửa</button>
                  <button class="btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } catch (error) {
        console.error('Error loading products:', error);
        wrap.innerHTML = '<div class="empty-state">Lỗi khi tải danh sách sản phẩm.</div>';
      }
    }
  }

  async function renderRevenue() {
    // Show loading state
    wrap.innerHTML = '<div class="empty-state">Đang tải thống kê...</div>';
    
    // Load orders from Firebase with real-time listener
    if (window.firebaseDatabase) {
      const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
      
      // Set up real-time listener for orders
      const ordersRef = ref(window.firebaseDatabase, 'orders');
      onValue(ordersRef, (snapshot) => {
        const ordersData = snapshot.val();
        const orders = ordersData ? Object.values(ordersData) : [];
        
        const revenueStats = calculateRevenue(orders);
        
        wrap.innerHTML = `
          <div class="admin-content-header">
            <h2 class="admin-content-title">Thống kê doanh thu</h2>
          </div>
          <div id="revenueStats"></div>
        `;
        
        renderRevenueStats(revenueStats);
      });
    } else {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orders')||'[]');
      const revenueStats = calculateRevenue(orders);
      
      wrap.innerHTML = `
        <div class="admin-content-header">
          <h2 class="admin-content-title">Thống kê doanh thu</h2>
        </div>
        <div id="revenueStats"></div>
      `;
      
      renderRevenueStats(revenueStats);
    }
  }

  function updateDashboardStats(orders) {
    if (!statsContainer) return;
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-title">Tổng đơn hàng</div>
        <div class="stat-value">${totalOrders}</div>
        <div class="stat-trend">Tất cả đơn hàng</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Đơn hoàn thành</div>
        <div class="stat-value">${completedOrders}</div>
        <div class="stat-trend positive">${Math.round((completedOrders/totalOrders)*100 || 0)}% hoàn thành</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Đơn chờ xử lý</div>
        <div class="stat-value">${pendingOrders}</div>
        <div class="stat-trend">${Math.round((pendingOrders/totalOrders)*100 || 0)}% đang chờ</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Doanh thu</div>
        <div class="stat-value">${parseInt(totalRevenue).toLocaleString('vi-VN')}đ</div>
        <div class="stat-trend positive">Tổng doanh thu</div>
      </div>
    `;
  }

  async function updateOrderStatus(orderId, status) {
    try {
        if (window.firebaseDatabase) {
            const { ref, get, update, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Find the order by its id field in Firebase
            const ordersRef = ref(window.firebaseDatabase, 'orders');
            const snapshot = await get(ordersRef);
            const ordersData = snapshot.val();
            
            if (ordersData) {
                // Find the Firebase key for the order with matching id
                let orderKey = null;
                for (const key in ordersData) {
                    if (ordersData[key].id === orderId) {
                        orderKey = key;
                        break;
                    }
                }
                
                if (orderKey) {
                    // Get the current order data
                    const order = ordersData[orderKey];
                    
                    // Update order status in Firebase using the correct key
                    const orderRef = ref(window.firebaseDatabase, 'orders/' + orderKey);
                    const updates = {
                        status: status,
                        updatedAt: serverTimestamp()
                    };
                    
                    // Add timestamps for specific statuses
                    if (status === 'confirmed') {
                        updates.approvedAt = serverTimestamp();
                    } else if (status === 'delivered') {
                        updates.deliveredAt = serverTimestamp();
                    } else if (status === 'completed') {
                        updates.completedAt = serverTimestamp();
                        
                        // When order is completed, reduce product quantities
                        if (order.items && Array.isArray(order.items)) {
                            for (const item of order.items) {
                                console.log(`Processing item:`, item);
                                if (item.id) {
                                    try {
                                        // Get current product data
                                        const productRef = ref(window.firebaseDatabase, 'products/' + item.id);
                                        const productSnapshot = await get(productRef);
                                        if (productSnapshot.exists()) {
                                            const product = productSnapshot.val();
                                            console.log(`Product data:`, product);
                                            const newQuantity = Math.max(0, (product.quantity || 0) - (item.qty || 0));
                                            
                                            // Update product quantity only (sales tracking will be handled separately)
                                            await update(productRef, {
                                                quantity: newQuantity
                                            });
                                            
                                            // Also update sales count in localStorage as fallback
                                            console.log(`Updating local sales count for item ${item.id} with quantity ${item.qty || 0}`);
                                            updateLocalSalesCount(item.id, item.qty || 0);
                                        }
                                    } catch (productError) {
                                        console.error('Error updating product quantity for item:', item, productError);
                                    }
                                }
                            }
                        }
                    } else if (status === 'cancelled') {
                        updates.cancelledAt = serverTimestamp();
                        
                        // When order is cancelled, restore product quantities if they were previously reduced
                        // This would require tracking the original quantities, which is more complex
                        // For now, we'll just add a note that this might need manual adjustment
                    } else if (status === 'returned') {
                        updates.returnedAt = serverTimestamp();
                        
                        // When order is returned, restore product quantities
                        if (order.items && Array.isArray(order.items)) {
                            for (const item of order.items) {
                                console.log(`Processing returned item:`, item);
                                if (item.id) {
                                    try {
                                        // Get current product data
                                        const productRef = ref(window.firebaseDatabase, 'products/' + item.id);
                                        const productSnapshot = await get(productRef);
                                        if (productSnapshot.exists()) {
                                            const product = productSnapshot.val();
                                            console.log(`Product data for returned item:`, product);
                                            const newQuantity = (product.quantity || 0) + (item.qty || 0);
                                            
                                            // Update product quantity only (sales tracking will be handled separately)
                                            await update(productRef, {
                                                quantity: newQuantity
                                            });
                                            
                                            // Also update sales count in localStorage as fallback
                                            console.log(`Updating local sales count for returned item ${item.id} with quantity -${item.qty || 0}`);
                                            updateLocalSalesCount(item.id, -(item.qty || 0));
                                        }
                                    } catch (productError) {
                                        console.error('Error restoring product quantity for item:', item, productError);
                                    }
                                }
                            }
                        }
                    }
                    
                    await update(orderRef, updates);
                    
                    // Notify user (in a real implementation, you would send a notification)
                    console.log(`Order ${orderId} updated to status: ${status}`);
                    
                    // Update the select element directly to reflect the change immediately
                    const selectElement = document.querySelector(`.status-select[data-id="${orderId}"]`);
                    if (selectElement) {
                        selectElement.value = status;
                    }
                    
                    // Update the status display element directly
                    const orderCards = document.querySelectorAll('.order-card');
                    orderCards.forEach(card => {
                        const orderIdElement = card.querySelector('.order-id');
                        if (orderIdElement && orderIdElement.textContent.includes(orderId)) {
                            const statusElement = card.querySelector('.order-status');
                            if (statusElement) {
                                statusElement.className = `order-status ${getOrderStatusClass(status)}`;
                                statusElement.textContent = getOrderStatusText(status);
                            }
                        }
                    });
                    
                    render();
                } else {
                    alert('Không tìm thấy đơn hàng để cập nhật!');
                }
            } else {
                alert('Không tìm thấy đơn hàng để cập nhật!');
            }
        } else {
            // Fallback to localStorage
            let orders = JSON.parse(localStorage.getItem('orders')||'[]');
            orders = orders.map(o => {
                if(o.id === orderId) {
                    const updated = {...o, status};
                    if (status === 'confirmed') {
                        updated.approvedAt = new Date().toISOString();
                    }
                    if (status === 'delivered') {
                        updated.deliveredAt = new Date().toISOString();
                    }
                    // Handle product quantity updates for localStorage fallback
                    if (status === 'completed') {
                        // Reduce product quantities
                        if (updated.items && Array.isArray(updated.items)) {
                            updated.items.forEach(item => {
                                // In localStorage, we would need to update product quantities manually
                                // This is a simplified version - in a real app you would need to update the products in localStorage
                                console.log(`Would reduce quantity for product ${item.id} by ${item.qty}`);
                            });
                        }
                    }
                    return updated;
                }
                return o;
            });
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Thông báo cho user
            const updated = orders.find(o=>o.id===orderId);
            const notes = JSON.parse(localStorage.getItem('notifications')||'{}');
            notes[updated.userEmail] = notes[updated.userEmail]||[];
            notes[updated.userEmail].push(`Đơn ${updated.id} cập nhật trạng thái: ${getOrderStatusText(status)}`);
            localStorage.setItem('notifications', JSON.stringify(notes));
            
            render();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Lỗi khi cập nhật trạng thái đơn hàng: ' + error.message);
    }
  }

  async function processReturnRequest(orderId, action, adminNote = '') {
    try {
        if (window.firebaseDatabase) {
            const { ref, get, update, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Find the order by its id field in Firebase
            const ordersRef = ref(window.firebaseDatabase, 'orders');
            const snapshot = await get(ordersRef);
            const ordersData = snapshot.val();
            
            if (ordersData) {
                // Find the Firebase key for the order with matching id
                let orderKey = null;
                for (const key in ordersData) {
                    if (ordersData[key].id === orderId) {
                        orderKey = key;
                        break;
                    }
                }
                
                if (orderKey) {
                    // Update return request in Firebase using the correct key
                    const orderRef = ref(window.firebaseDatabase, 'orders/' + orderKey);
                    const updates = {
                        'returnRequest.status': action === 'approved' ? 'approved' : 'rejected',
                        'returnRequest.processedAt': serverTimestamp()
                    };
                    
                    if (action === 'approved') {
                        updates.status = 'returned';
                    }
                    
                    if (adminNote) {
                        updates['returnRequest.adminNote'] = adminNote;
                    }
                    
                    await update(orderRef, updates);
                    render();
                } else {
                    alert('Không tìm thấy đơn hàng để cập nhật!');
                }
            } else {
                alert('Không tìm thấy đơn hàng để cập nhật!');
            }
        } else {
            // Fallback to localStorage
            let orders = JSON.parse(localStorage.getItem('orders')||'[]');
            const orderIndex = orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
                if (action === 'approved') {
                    orders[orderIndex].returnRequest.status = 'Đã chấp nhận';
                    orders[orderIndex].status = 'Hoàn thành';
                } else {
                    orders[orderIndex].returnRequest.status = 'Đã từ chối';
                    orders[orderIndex].returnRequest.adminNote = adminNote;
                }
                orders[orderIndex].returnRequest.processedAt = new Date().toISOString();
                
                localStorage.setItem('orders', JSON.stringify(orders));
                
                // Thông báo cho user
                const updated = orders[orderIndex];
                const notes = JSON.parse(localStorage.getItem('notifications')||'{}');
                notes[updated.userEmail] = notes[updated.userEmail]||[];
                notes[updated.userEmail].push(`Yêu cầu hoàn hàng đơn ${updated.id} đã được ${action === 'approved' ? 'chấp nhận' : 'từ chối'}`);
                localStorage.setItem('notifications', JSON.stringify(notes));
            }
            
            render();
        }
    } catch (error) {
        console.error('Error processing return request:', error);
        alert('Lỗi khi xử lý yêu cầu hoàn hàng: ' + error.message);
    }
  }

  async function deleteOrder(orderId) {
    try {
        if (window.firebaseDatabase) {
            const { ref, get, remove } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Find the order by its id field in Firebase
            const ordersRef = ref(window.firebaseDatabase, 'orders');
            const snapshot = await get(ordersRef);
            const ordersData = snapshot.val();
            
            if (ordersData) {
                // Find the Firebase key for the order with matching id
                let orderKey = null;
                for (const key in ordersData) {
                    if (ordersData[key].id === orderId) {
                        orderKey = key;
                        break;
                    }
                }
                
                if (orderKey) {
                    // Delete order from Firebase using the correct key
                    const orderRef = ref(window.firebaseDatabase, 'orders/' + orderKey);
                    await remove(orderRef);
                    alert('Đã xóa đơn hàng!');
                    render();
                } else {
                    alert('Không tìm thấy đơn hàng để xóa!');
                }
            } else {
                alert('Không tìm thấy đơn hàng để xóa!');
            }
        } else {
            // Fallback to localStorage
            let orders = JSON.parse(localStorage.getItem('orders')||'[]');
            orders = orders.filter(o => o.id !== orderId);
            localStorage.setItem('orders', JSON.stringify(orders));
            alert('Đã xóa đơn hàng!');
            render();
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Lỗi khi xóa đơn hàng: ' + error.message);
    }
  }

  function calculateRevenue(orders) {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const monthlyRevenue = {};
    
    completedOrders.forEach(order => {
      const month = new Date(order.timestamp || order.createdAt).toLocaleString('vi-VN', { year: 'numeric', month: 'long' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total || 0);
    });
    
    return {
      total: totalRevenue,
      monthly: monthlyRevenue,
      completedCount: completedOrders.length
    };
  }

  function renderRevenueStats(stats) {
    const revenueStatsEl = document.getElementById('revenueStats');
    if (!revenueStatsEl) return;
    
    revenueStatsEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:30px">
        <div class="stat-card">
          <div style="font-size:14px;color:#6b7280">Tổng doanh thu</div>
          <div style="font-size:24px;font-weight:bold;color:#16a34a">${parseInt(stats.total).toLocaleString('vi-VN')}đ</div>
        </div>
        <div class="stat-card">
          <div style="font-size:14px;color:#6b7280">Đơn hàng hoàn thành</div>
          <div style="font-size:24px;font-weight:bold">${stats.completedCount}</div>
        </div>
      </div>
      ${Object.keys(stats.monthly).length > 0 ? `
        <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
          <h3>Doanh thu theo tháng</h3>
          ${Object.entries(stats.monthly).map(([month, revenue]) => `
            <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e5e7eb">
              <span>${month}</span>
              <span style="font-weight:bold">${parseInt(revenue).toLocaleString('vi-VN')}đ</span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state">Chưa có dữ liệu doanh thu.</div>'}
    `;
  }

  function getOrderStatusClass(status) {
    const statusClasses = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'shipping': 'shipping',
      'delivered': 'delivered',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'returned': 'returned'
    };
    return statusClasses[status] || 'pending';
  }

  function getOrderStatusText(status) {
    const statusTexts = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'returned': 'Đã hoàn hàng'
    };
    return statusTexts[status] || 'Chờ xác nhận';
  }

  // Global functions for user management
  window.showAddUserForm = function() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Thêm người dùng mới</h3>
          <button class="close" onclick="this.closest('.modal').remove()">✖</button>
        </div>
        <div class="modal-body">
          <form id="addUserForm">
            <div class="form-group">
              <label for="userName">Họ tên</label>
              <input type="text" id="userName" class="form-control" placeholder="Họ tên" required>
            </div>
            <div class="form-group">
              <label for="userEmail">Email</label>
              <input type="email" id="userEmail" class="form-control" placeholder="Email" required>
            </div>
            <div class="form-group">
              <label for="userPassword">Mật khẩu</label>
              <input type="password" id="userPassword" class="form-control" placeholder="Mật khẩu" required>
            </div>
            <div class="form-group">
              <label for="userPhone">Số điện thoại</label>
              <input type="text" id="userPhone" class="form-control" placeholder="Số điện thoại">
            </div>
            <div class="form-group">
              <label for="userRole">Vai trò</label>
              <select id="userRole" class="form-control">
                <option value="user">Người dùng</option>
                <option value="seller">Người bán</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">Thêm người dùng</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addNewUser();
      modal.remove();
    });
  };

  window.addNewUser = async function() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const phone = document.getElementById('userPhone').value;
    const role = document.getElementById('userRole').value;

    try {
      if (window.firebaseAuth && window.firebaseDatabase) {
        const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
        const { ref, set, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
        
        // Tạo user với Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        const user = userCredential.user;

        // Lưu thông tin user vào Realtime Database
        await set(ref(window.firebaseDatabase, 'users/' + user.uid), {
          name: name,
          email: email,
          phone: phone,
          role: role,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Fallback to old Firebase
        // Tạo user với Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Lưu thông tin user vào Realtime Database
        await database.ref('users/' + user.uid).set({
          name: name,
          email: email,
          phone: phone,
          role: role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      }

      alert('Thêm người dùng thành công!');
      renderUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Lỗi khi thêm người dùng: ' + error.message);
    }
  };

  window.editUser = async function(uid) {
    try {
      let user;
      if (window.firebaseDatabase) {
        const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
        const snapshot = await get(ref(window.firebaseDatabase, 'users/' + uid));
        user = snapshot.val();
      } else {
        // Fallback to old Firebase
        const snapshot = await database.ref('users/' + uid).once('value');
        user = snapshot.val();
      }
      
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Sửa thông tin người dùng</h3>
            <button class="close" onclick="this.closest('.modal').remove()">✖</button>
          </div>
          <div class="modal-body">
            <form id="editUserForm">
              <div class="form-group">
                <label for="editUserName">Họ tên</label>
                <input type="text" id="editUserName" class="form-control" value="${user.name}" required>
              </div>
              <div class="form-group">
                <label for="editUserEmail">Email</label>
                <input type="email" id="editUserEmail" class="form-control" value="${user.email}" required>
              </div>
              <div class="form-group">
                <label for="editUserPhone">Số điện thoại</label>
                <input type="text" id="editUserPhone" class="form-control" value="${user.phone || ''}">
              </div>
              <div class="form-group">
                <label for="editUserRole">Vai trò</label>
                <select id="editUserRole" class="form-control">
                  <option value="user" ${user.role === 'user' ? 'selected' : ''}>Người dùng</option>
                  <option value="seller" ${user.role === 'seller' ? 'selected' : ''}>Người bán</option>
                  <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Quản trị viên</option>
                </select>
              </div>
              <button type="submit" class="btn-primary" style="width:100%">Cập nhật</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('editUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {
          name: document.getElementById('editUserName').value,
          email: document.getElementById('editUserEmail').value,
          phone: document.getElementById('editUserPhone').value,
          role: document.getElementById('editUserRole').value
        };

        if (window.firebaseDatabase) {
          const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
          await update(ref(window.firebaseDatabase, 'users/' + uid), updates);
        } else {
          // Fallback to old Firebase
          await database.ref('users/' + uid).update(updates);
        }
        
        alert('Cập nhật thông tin thành công!');
        modal.remove();
        renderUsers();
      });
    } catch (error) {
      console.error('Error editing user:', error);
      alert('Lỗi khi sửa thông tin người dùng: ' + error.message);
    }
  };

  window.deleteUser = async function(uid, email) {
    if (confirm(`Bạn có chắc muốn xóa người dùng ${email}?`)) {
      try {
        if (window.firebaseAuth && window.firebaseDatabase) {
          const { deleteUser } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
          const { ref, remove } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
          
          // Xóa user khỏi Firebase Auth (if it's the current user)
          // Note: In a real implementation, you would need to handle this more carefully
          
          // Xóa user khỏi Realtime Database
          await remove(ref(window.firebaseDatabase, 'users/' + uid));
        } else {
          // Fallback to old Firebase
          // Xóa user khỏi Firebase Auth
          const user = firebase.auth().currentUser;
          if (user && user.email === email) {
            await user.delete();
          }
          
          // Xóa user khỏi Realtime Database
          await database.ref('users/' + uid).remove();
        }
        
        alert('Xóa người dùng thành công!');
        renderUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Lỗi khi xóa người dùng: ' + error.message);
      }
    }
  };

  // Global functions for product management
  window.showAddProductForm = function() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Thêm sản phẩm mới</h3>
          <button class="close" onclick="this.closest('.modal').remove()">✖</button>
        </div>
        <div class="modal-body">
          <form id="addProductForm">
            <div class="form-group">
              <label for="productName">Tên sản phẩm</label>
              <input type="text" id="productName" class="form-control" placeholder="Tên sản phẩm" required>
            </div>
            <div class="form-group">
              <label for="productDescription">Mô tả sản phẩm</label>
              <textarea id="productDescription" class="form-control" placeholder="Mô tả sản phẩm" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:1">
                <label for="productPrice">Giá sản phẩm (đ)</label>
                <input type="number" id="productPrice" class="form-control" placeholder="Giá sản phẩm" required>
              </div>
              <div class="form-group" style="flex:1">
                <label for="productQuantity">Số lượng</label>
                <input type="number" id="productQuantity" class="form-control" placeholder="Số lượng" value="100">
              </div>
            </div>
            <div class="form-group">
              <label for="productCategory">Danh mục</label>
              <select id="productCategory" class="form-control">
                <option value="monitor">Màn hình</option>
                <option value="laptop">Laptop & Linh kiện</option>
                <option value="accessories">Phụ kiện</option>
              </select>
            </div>
            <div class="form-group">
              <label for="productImage">Ảnh sản phẩm (URL hoặc tên file)</label>
              <input type="text" id="productImage" class="form-control" placeholder="Tên file ảnh (ví dụ: product.jpg)">
            </div>
            <div class="form-group">
              <label for="productSupplier">Nhà cung cấp</label>
              <input type="text" id="productSupplier" class="form-control" placeholder="Nhà cung cấp" value="HgShop">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">Thêm sản phẩm</button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addNewProduct();
      modal.remove();
    });
  };

  window.addNewProduct = async function() {
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value;
    const supplier = document.getElementById('productSupplier').value;

    try {
      const newProductId = Date.now();
      
      const newProduct = {
        id: newProductId,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        category: category,
        image: image,
        seller: 'HgShop',
        rating: 0,
        reviews: [],
        specifications: ['Thông số kỹ thuật đang cập nhật'],
        supplier: supplier,
        type: 'Sản phẩm mới'
      };

      if (window.firebaseDatabase) {
        const { ref, set } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
        await set(ref(window.firebaseDatabase, 'products/' + newProductId), newProduct);
      } else {
        // Fallback to old Firebase
        await database.ref('products/' + newProductId).set(newProduct);
      }
      
      alert('Thêm sản phẩm thành công!');
      renderProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Lỗi khi thêm sản phẩm: ' + error.message);
    }
  };

  window.editProduct = async function(productId) {
    try {
      let product;
      if (window.firebaseDatabase) {
        const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
        const snapshot = await get(ref(window.firebaseDatabase, 'products/' + productId));
        product = snapshot.val();
      } else {
        // Fallback to old Firebase
        const snapshot = await database.ref('products/' + productId).once('value');
        product = snapshot.val();
      }
      
      if (!product) {
        alert('Không tìm thấy sản phẩm!');
        return;
      }

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Sửa sản phẩm</h3>
            <button class="close" onclick="this.closest('.modal').remove()">✖</button>
          </div>
          <div class="modal-body">
            <form id="editProductForm">
              <div class="form-group">
                <label for="editProductName">Tên sản phẩm</label>
                <input type="text" id="editProductName" class="form-control" value="${product.name}" required>
              </div>
              <div class="form-group">
                <label for="editProductDescription">Mô tả sản phẩm</label>
                <textarea id="editProductDescription" class="form-control" rows="3">${product.description || ''}</textarea>
              </div>
              <div class="form-row">
                <div class="form-group" style="flex:1">
                  <label for="editProductPrice">Giá sản phẩm (đ)</label>
                  <input type="number" id="editProductPrice" class="form-control" value="${product.price}" required>
                </div>
                <div class="form-group" style="flex:1">
                  <label for="editProductQuantity">Số lượng</label>
                  <input type="number" id="editProductQuantity" class="form-control" value="${product.quantity || 100}">
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
                <label for="editProductImage">Ảnh sản phẩm (URL hoặc tên file)</label>
                <input type="text" id="editProductImage" class="form-control" value="${product.image}">
              </div>
              <div class="form-group">
                <label for="editProductSupplier">Nhà cung cấp</label>
                <input type="text" id="editProductSupplier" class="form-control" value="${product.supplier || 'HgShop'}">
              </div>
              <button type="submit" class="btn-primary" style="width:100%">Cập nhật sản phẩm</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updates = {
          name: document.getElementById('editProductName').value,
          description: document.getElementById('editProductDescription').value,
          price: parseInt(document.getElementById('editProductPrice').value),
          quantity: parseInt(document.getElementById('editProductQuantity').value),
          category: document.getElementById('editProductCategory').value,
          image: document.getElementById('editProductImage').value,
          supplier: document.getElementById('editProductSupplier').value
        };

        if (window.firebaseDatabase) {
          const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
          await update(ref(window.firebaseDatabase, 'products/' + productId), updates);
        } else {
          // Fallback to old Firebase
          await database.ref('products/' + productId).update(updates);
        }
        
        alert('Cập nhật sản phẩm thành công!');
        modal.remove();
        renderProducts();
      });
    } catch (error) {
      console.error('Error editing product:', error);
      alert('Lỗi khi sửa sản phẩm: ' + error.message);
    }
  };

  window.deleteProduct = async function(productId) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        if (window.firebaseDatabase) {
          const { ref, remove } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
          await remove(ref(window.firebaseDatabase, 'products/' + productId));
        } else {
          // Fallback to old Firebase
          await database.ref('products/' + productId).remove();
        }
        
        alert('Xóa sản phẩm thành công!');
        renderProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Lỗi khi xóa sản phẩm: ' + error.message);
      }
    }
  };

  // Function to update local sales count in localStorage
  function updateLocalSalesCount(productId, quantityChange) {
    try {
      console.log(`Updating local sales count for product ${productId} with change ${quantityChange}`);
      
      // Get current local sales data
      let localSales = JSON.parse(localStorage.getItem('localProductSales') || '{}');
      console.log(`Current local sales data:`, localSales);
      
      // Update sales count for this product
      const currentSales = localSales[productId] || 0;
      const newSales = Math.max(0, currentSales + quantityChange);
      console.log(`Current sales for product ${productId}: ${currentSales}, new sales: ${newSales}`);
      
      // Save updated sales count
      localSales[productId] = newSales;
      localStorage.setItem('localProductSales', JSON.stringify(localSales));
      
      console.log(`Updated local sales count for product ${productId}: ${currentSales} -> ${newSales}`);
      console.log(`Updated local sales data:`, localSales);
    } catch (error) {
      console.error('Error updating local sales count:', error);
    }
  }

  // Function to get local sales count for a product
  function getLocalSalesCount(productId) {
    try {
      let localSales = JSON.parse(localStorage.getItem('localProductSales') || '{}');
      return localSales[productId] || 0;
    } catch (error) {
      console.error('Error getting local sales count:', error);
      return 0;
    }
  }
  
  initTabs();
  render();
});