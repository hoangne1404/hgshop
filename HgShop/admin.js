/* admin.js - admin order management with enhanced features */

document.addEventListener('DOMContentLoaded', ()=>{
  const cur = JSON.parse(localStorage.getItem('currentUser')||'null');
  if(!cur || cur.role!=='admin'){ alert('Cần quyền admin'); location.href='login.html'; return; }
  const wrap = document.getElementById('ordersAdmin');

  function render(){
    const orders = JSON.parse(localStorage.getItem('orders')||'[]').sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    
    // Tính doanh thu
    const revenueStats = calculateRevenue(orders);
    renderRevenueStats(revenueStats);

    if(orders.length===0){ wrap.innerHTML='<div class="card">Chưa có đơn hàng.</div>'; return; }
    wrap.innerHTML = '';
    orders.forEach(o=>{
      const div = document.createElement('div'); div.className='card'; div.style.marginBottom='10px';
      
      let statusColor = '#6b7280';
      if(o.status === 'Đã xác nhận') statusColor = '#2563eb';
      if(o.status === 'Đang chuẩn bị') statusColor = '#f59e0b';
      if(o.status === 'Đang giao') statusColor = '#d97706';
      if(o.status === 'Đã giao') statusColor = '#16a34a';
      if(o.status === 'Hoàn thành') statusColor = '#15803d';

      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${o.id}</strong> - ${o.userEmail} - ${new Date(o.createdAt).toLocaleString()}</div>
          <div><strong style="color:${statusColor}">${o.status}</strong></div>
        </div>
        <div style="margin-top:8px">
          <div>Địa chỉ: ${o.address}</div>
          <div>Phương thức: ${o.method}</div>
          <div>SP: ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div>
          <div>Tổng: ${o.total.toLocaleString('vi-VN')}đ</div>
          ${o.approvedAt ? `<div>Duyệt lúc: ${new Date(o.approvedAt).toLocaleString()}</div>` : ''}
          ${o.deliveredAt ? `<div>Giao lúc: ${new Date(o.deliveredAt).toLocaleString()}</div>` : ''}
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="primary" data-action="confirm" data-id="${o.id}">Xác nhận</button>
          <button class="primary" data-action="prepare" data-id="${o.id}">Chuẩn bị hàng</button>
          <button class="primary" data-action="deliver" data-id="${o.id}">Đang giao</button>
          <button class="primary" data-action="complete" data-id="${o.id}">Đã giao</button>
          <select data-id="${o.id}" class="statusSel">
            <option ${o.status==='Chờ xác nhận'?'selected':''}>Chờ xác nhận</option>
            <option ${o.status==='Đã xác nhận'?'selected':''}>Đã xác nhận</option>
            <option ${o.status==='Đang chuẩn bị'?'selected':''}>Đang chuẩn bị</option>
            <option ${o.status==='Đang giao'?'selected':''}>Đang giao</option>
            <option ${o.status==='Đã giao'?'selected':''}>Đã giao</option>
            <option ${o.status==='Hoàn thành'?'selected':''}>Hoàn thành</option>
          </select>
        </div>
        ${o.returnRequest ? `
          <div style="margin-top:12px;padding:12px;background:#fef2f2;border-radius:8px">
            <h4>Yêu cầu hoàn hàng</h4>
            <p><strong>Lý do:</strong> ${o.returnRequest.reason}</p>
            <p><strong>Trạng thái:</strong> ${o.returnRequest.status}</p>
            <p><strong>Ngày yêu cầu:</strong> ${new Date(o.returnRequest.requestedAt).toLocaleString()}</p>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="primary" data-action="approve-return" data-id="${o.id}">Chấp nhận</button>
              <button class="secondary" data-action="reject-return" data-id="${o.id}">Từ chối</button>
              <textarea id="returnNote-${o.id}" placeholder="Ghi chú (nếu từ chối)" style="flex:1;padding:8px;border-radius:4px;border:1px solid #e5e7eb"></textarea>
            </div>
          </div>
        ` : ''}
      `;
      wrap.appendChild(div);
    });

    // Xử lý các nút hành động
    document.querySelectorAll('[data-action="confirm"]').forEach(b=>{
      b.onclick = ()=>{
        updateOrderStatus(b.dataset.id, 'Đã xác nhận', true);
      };
    });

    document.querySelectorAll('[data-action="prepare"]').forEach(b=>{
      b.onclick = ()=>{
        updateOrderStatus(b.dataset.id, 'Đang chuẩn bị', false);
      };
    });

    document.querySelectorAll('[data-action="deliver"]').forEach(b=>{
      b.onclick = ()=>{
        updateOrderStatus(b.dataset.id, 'Đang giao', false);
      };
    });

    document.querySelectorAll('[data-action="complete"]').forEach(b=>{
      b.onclick = ()=>{
        updateOrderStatus(b.dataset.id, 'Đã giao', false, true);
      };
    });

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

    document.querySelectorAll('.statusSel').forEach(sel=>{
      sel.onchange = ()=>{
        const id = sel.dataset.id;
        const val = sel.value;
        updateOrderStatus(id, val, val === 'Đã xác nhận', val === 'Đã giao');
      };
    });
  }

  function updateOrderStatus(orderId, status, isApproval = false, isDelivery = false) {
    let orders = JSON.parse(localStorage.getItem('orders')||'[]');
    orders = orders.map(o => {
      if(o.id === orderId) {
        const updated = {...o, status};
        if (isApproval) {
          updated.approvedAt = new Date().toISOString();
        }
        if (isDelivery) {
          updated.deliveredAt = new Date().toISOString();
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
    notes[updated.userEmail].push(`Đơn ${updated.id} cập nhật trạng thái: ${status}`);
    localStorage.setItem('notifications', JSON.stringify(notes));
    
    render();
  }

  function processReturnRequest(orderId, action, adminNote = '') {
    let orders = JSON.parse(localStorage.getItem('orders')||'[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      if (action === 'approved') {
        orders[orderIndex].returnRequest.status = 'Đã chấp nhận';
        orders[orderIndex].status = 'Hoàn thành';
        // Có thể xử lý hoàn tiền ở đây nếu cần
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
      
      render();
    }
  }

  function calculateRevenue(orders) {
    const completedOrders = orders.filter(o => o.status === 'Hoàn thành');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const monthlyRevenue = {};
    
    completedOrders.forEach(order => {
      const month = new Date(order.deliveredAt || order.createdAt).toLocaleString('vi-VN', { year: 'numeric', month: 'long' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.total;
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
      <div style="display:flex;gap:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="font-size:14px;color:#6b7280">Tổng doanh thu</div>
          <div style="font-size:24px;font-weight:bold;color:#16a34a">${stats.total.toLocaleString('vi-VN')}đ</div>
        </div>
        <div style="flex:1;min-width:200px">
          <div style="font-size:14px;color:#6b7280">Đơn hàng hoàn thành</div>
          <div style="font-size:24px;font-weight:bold">${stats.completedCount}</div>
        </div>
      </div>
      ${Object.keys(stats.monthly).length > 0 ? `
        <div style="margin-top:16px">
          <h4>Doanh thu theo tháng</h4>
          ${Object.entries(stats.monthly).map(([month, revenue]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb">
              <span>${month}</span>
              <span style="font-weight:bold">${revenue.toLocaleString('vi-VN')}đ</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  render();
});