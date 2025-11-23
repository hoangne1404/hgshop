/* checkout.js - checkout logic: show summary, geolocation, create order, notifications */

document.addEventListener('DOMContentLoaded', ()=>{
  console.log('Checkout page loaded');
  
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  console.log('Cart loaded from localStorage:', cart);
  
  const cur = JSON.parse(localStorage.getItem('currentUser')||'null');
  console.log('Current user:', cur);
  
  const orderSummary = document.getElementById('orderSummary');
  const fullname = document.getElementById('fullname');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const locateBtn = document.getElementById('locateBtn');
  const mapWrap = document.getElementById('mapWrap');
  const placeOrder = document.getElementById('placeOrder');
  const qrBox = document.getElementById('qrBox');

  // Kiểm tra đăng nhập
  if (!cur) {
    alert('Vui lòng đăng nhập để thanh toán!');
    window.location.href = 'login.html';
    return;
  }

  // Validate required user data
  if (!cur.uid || !cur.email) {
    console.error('Missing required user data:', cur);
    alert('Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại!');
    window.location.href = 'login.html';
    return;
  }

  if(cart.length===0){ 
    console.log('Cart is empty, showing empty cart message');
    orderSummary.innerHTML = '<div class="card" style="text-align:center;padding:40px"><p>Giỏ hàng trống.</p><a href="index.html" class="btn primary">Quay lại mua sắm</a></div>'; 
    return; 
  }

  // Render order summary with real-time updates
  function renderOrderSummary() {
    let total=0;
    let html = `
      <div class="order-summary-items">
        ${cart.map(item => {
          console.log('Processing cart item:', item);
          // Validate required item data
          if (!item.id || !item.name || item.price === undefined || item.qty === undefined) {
            console.error('Invalid cart item data:', item);
            return ''; // Skip invalid items
          }
          
          const itemTotal = item.price * item.qty;
          total += itemTotal;
          return `
            <div class="order-item">
              <div class="order-item-image">
                <img src="images/sanpham/${item.image || 'default-product.png'}" alt="${item.name}" onerror="this.src='images/default-product.png'">
              </div>
              <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">${item.price.toLocaleString('vi-VN')}đ x ${item.qty}</div>
              </div>
              <div class="order-item-total">${itemTotal.toLocaleString('vi-VN')}đ</div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="order-total">
        <div>Tổng cộng:</div>
        <div class="total-amount">${total.toLocaleString('vi-VN')}đ</div>
      </div>
    `;
    orderSummary.innerHTML = html;
    return total;
  }

  let total = renderOrderSummary();

  if(cur){ 
    fullname.value = cur.name || ''; 
    phone.value = cur.phone || ''; 
  }

  // Set up real-time cart updates
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      const updatedCart = JSON.parse(e.newValue || '[]');
      cart.splice(0, cart.length, ...updatedCart);
      total = renderOrderSummary();
    }
  });

  locateBtn.onclick = ()=>{
    if(!navigator.geolocation) return alert('Trình duyệt không hỗ trợ định vị');
    locateBtn.textContent = 'Đang lấy vị trí...';
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      mapWrap.classList.remove('hidden');
      mapWrap.innerHTML = `<iframe width="100%" height="300" frameborder="0" src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed"></iframe>`;
      locateBtn.textContent = 'Xác nhận vị trí hiện tại';
      address.value = `Vị trí hiện tại: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }, err=>{
      locateBtn.textContent = 'Xác nhận vị trí hiện tại';
      alert('Không lấy được vị trí: ' + err.message);
    }, {enableHighAccuracy:true, timeout: 10000, maximumAge: 300000});
  };

  document.querySelectorAll('input[name="pay"]').forEach(r=>{
    r.onchange = e => { 
      qrBox.classList.toggle('hidden', e.target.value!=='qr');
    };
  });

  placeOrder.onclick = async ()=>{
    if(!fullname.value || !phone.value || !address.value) return alert('Vui lòng điền thông tin giao hàng đầy đủ');

    try {
      // Save order to Firebase
      if (window.firebaseDatabase) {
        // Import Firebase database functions
        let ref, push, serverTimestamp;
        try {
          console.log('Importing Firebase database module...');
          const firebaseDatabaseModule = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
          ref = firebaseDatabaseModule.ref;
          push = firebaseDatabaseModule.push;
          serverTimestamp = firebaseDatabaseModule.serverTimestamp;
          console.log('Firebase database module imported successfully');
        } catch (importError) {
          console.error('Failed to import Firebase database module:', importError);
          throw new Error('Không thể kết nối với cơ sở dữ liệu. Vui lòng thử lại sau.');
        }
        
        const order = {
          id: 'ORD'+Date.now(),
          userId: cur.uid,
          userEmail: cur.email,
          userName: fullname.value,
          phone: phone.value,
          address: address.value,
          items: cart,
          total: total,
          method: document.querySelector('input[name="pay"]:checked').value,
          status: 'pending',
          timestamp: serverTimestamp(),
          // Thêm các trường mới
          approvedAt: null,
          deliveredAt: null,
          returnRequest: null
        };
        
        console.log('Attempting to save order to Firebase:', order);
        
        try {
          // Save to Firebase
          const ordersRef = ref(window.firebaseDatabase, 'orders');
          const newOrderRef = await push(ordersRef, order);
          console.log('Order saved successfully with key:', newOrderRef.key);
        } catch (saveError) {
          console.error('Failed to save order to Firebase:', saveError);
          throw new Error('Không thể lưu đơn hàng. Vui lòng kiểm tra kết nối mạng và thử lại.');
        }
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Notify admin through Firebase
        try {
          const notification = {
            type: 'new_order',
            orderId: order.id,
            orderTotal: total,
            timestamp: serverTimestamp(),
            read: false
          };
          
          const notificationsRef = ref(window.firebaseDatabase, 'admin_notifications');
          await push(notificationsRef, notification);
          console.log('Admin notification sent successfully');
        } catch (notificationError) {
          console.error('Failed to send admin notification:', notificationError);
          // Don't throw here as this is not critical for the order placement
        }
        
        alert('Đặt hàng thành công. Trạng thái: Chờ xác nhận.');
        window.location.href = 'profile.html#orders';
      } else {
        // Fallback to localStorage if Firebase is not available
        console.log('Firebase not available, using localStorage fallback');
        const orders = JSON.parse(localStorage.getItem('orders')||'[]');
        const order = {
          id: 'ORD'+Date.now(),
          userEmail: cur.email,
          name: fullname.value,
          phone: phone.value,
          address: address.value,
          items: cart,
          total: total,
          method: document.querySelector('input[name="pay"]:checked').value,
          status: 'Chờ xác nhận',
          createdAt: new Date().toISOString(),
          // Thêm các trường mới
          approvedAt: null,
          deliveredAt: null,
          returnRequest: null
        };
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // notify admin
        const notes = JSON.parse(localStorage.getItem('notifications')||'{}');
        const adminEmail = 'hoangne1404@gmail.com';
        notes[adminEmail] = notes[adminEmail]||[];
        notes[adminEmail].push(`Đơn ${order.id} vừa tạo: ${order.total.toLocaleString('vi-VN')}đ`);
        localStorage.setItem('notifications', JSON.stringify(notes));

        localStorage.removeItem('cart');
        alert('Đặt hàng thành công. Trạng thái: Chờ xác nhận.');
        location.href = 'profile.html#orders';
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // Provide more specific error messages
      if (error.message) {
        alert('Có lỗi xảy ra khi đặt hàng: ' + error.message);
      } else {
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    }
  };
});