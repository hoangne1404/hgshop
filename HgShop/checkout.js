/* checkout.js - checkout logic: show summary, geolocation, create order, notifications */

document.addEventListener('DOMContentLoaded', ()=>{
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const cur = JSON.parse(localStorage.getItem('currentUser')||'null');
  const orderSummary = document.getElementById('orderSummary');
  const fullname = document.getElementById('fullname');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const locateBtn = document.getElementById('locateBtn');
  const mapWrap = document.getElementById('mapWrap');
  const placeOrder = document.getElementById('placeOrder');
  const qrBox = document.getElementById('qrBox');

  if(cart.length===0){ orderSummary.innerHTML = '<div class="card">Giỏ hàng trống. <a href="index.html">Quay lại</a></div>'; return; }

  let total=0;
  let html = '<table class="order-table"><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th></tr>';
  cart.forEach(i=>{ 
    html+=`
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <img src="images/sanpham/${i.image}" alt="${i.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" onerror="this.src='images/default-product.png'">
            <div>${i.name}</div>
          </div>
        </td>
        <td>${i.qty}</td>
        <td>${(i.price*i.qty).toLocaleString('vi-VN')}đ</td>
      </tr>
    `; 
    total+=i.price*i.qty; 
  });
  html+=`<tr><td colspan="2"><strong>Tổng</strong></td><td><strong>${total.toLocaleString('vi-VN')}đ</strong></td></tr></table>`;
  orderSummary.innerHTML = html;

  if(cur){ fullname.value = cur.name || ''; phone.value = cur.phone || ''; }

  locateBtn.onclick = ()=>{
    if(!navigator.geolocation) return alert('Trình duyệt không hỗ trợ định vị');
    locateBtn.textContent = 'Đang lấy vị trí...';
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      mapWrap.classList.remove('hidden');
      mapWrap.innerHTML = `<iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed"></iframe>`;
      locateBtn.textContent = 'Xác nhận vị trí hiện tại';
      address.value = `Vị trí hiện tại: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }, err=>{
      locateBtn.textContent = 'Xác nhận vị trí hiện tại';
      alert('Không lấy được vị trí: ' + err.message);
    }, {enableHighAccuracy:true});
  };

  document.querySelectorAll('input[name="pay"]').forEach(r=>{
    r.onchange = e => { qrBox.classList.toggle('hidden', e.target.value!=='qr'); };
  });

  placeOrder.onclick = ()=>{
    if(!fullname.value || !phone.value || !address.value) return alert('Vui lòng điền thông tin giao hàng đầy đủ');

    const orders = JSON.parse(localStorage.getItem('orders')||'[]');
    const order = {
      id: 'ORD'+Date.now(),
      userEmail: cur?cur.email:'guest',
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
    location.href = 'index.html';
  };
});