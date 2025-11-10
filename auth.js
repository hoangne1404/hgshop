/* auth.js - login/register + custom CAPTCHA client check + admin bootstrap */

// create admin if missing
(function initAdmin(){
  let users = JSON.parse(localStorage.getItem('users')||'[]');
  const adminEmail = 'hoangne1404@gmail.com';
  if(!users.find(u=>u.email===adminEmail)){
    users.push({
      name: 'Admin',
      email: adminEmail,
      phone: '0343867095',
      password: '14042004',
      role: 'admin',
      avatarData: null
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
})();

function toast(msg){ alert(msg); }

// LOGIN page logic
if(location.pathname.endsWith('login.html')){
  document.addEventListener('DOMContentLoaded', ()=>{
    // Khởi tạo captcha
    const validateCaptcha = Captcha.init(
      'captchaDisplay', 
      'refreshCaptcha', 
      'audioCaptcha', 
      'captchaInput', 
      'captchaError'
    );
    
    const btn = document.getElementById('loginBtn');
    btn.onclick = ()=>{
      // Custom CAPTCHA client-side check
      if(!validateCaptcha()) {
        return toast('Mã xác thực không đúng!');
      }

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      const u = users.find(x=>x.email===email && x.password===password);
      if(!u) return toast('Sai email hoặc mật khẩu');
      localStorage.setItem('currentUser', JSON.stringify(u));
      if(u.role === 'admin') location.href = 'admin.html';
      else location.href = 'index.html';
    };
  });
}

// REGISTER page logic
if(location.pathname.endsWith('register.html')){
  document.addEventListener('DOMContentLoaded', ()=>{
    // Khởi tạo captcha
    const validateCaptcha = Captcha.init(
      'captchaDisplay', 
      'refreshCaptcha', 
      'audioCaptcha', 
      'captchaInput', 
      'captchaError'
    );
    
    const btn = document.getElementById('registerBtn');
    btn.onclick = ()=>{
      // Custom CAPTCHA client-side check
      if(!validateCaptcha()) {
        return toast('Mã xác thực không đúng!');
      }

      const name = document.getElementById('r_name').value.trim();
      const email = document.getElementById('r_email').value.trim();
      const phone = document.getElementById('r_phone').value.trim();
      const password = document.getElementById('r_password').value.trim();
      if(!name || !email || !password) return toast('Vui lòng điền đầy đủ thông tin');

      let users = JSON.parse(localStorage.getItem('users')||'[]');
      if(users.find(u=>u.email===email)) return toast('Email đã được sử dụng');
      const newUser = { name, email, phone, password, role:'user', avatarData: null };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      toast('Đăng ký thành công');
      location.href = 'index.html';
    };
  });
}

// common: when pages load ensure header avatar and menu works (for pages that include header)
document.addEventListener('DOMContentLoaded', ()=>{
  const cur = JSON.parse(localStorage.getItem('currentUser')||'null');
  const avatarIcon = document.getElementById('avatarIcon');
  if(avatarIcon){
    if(cur && cur.avatarData) avatarIcon.src = cur.avatarData;
    else avatarIcon.src = 'images/default-avatar.png';
    // avatar click handled in script.js but fallback
  }
  // account menu logout button binding
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.onclick = ()=>{
      localStorage.removeItem('currentUser');
      location.href = 'login.html';
    };
  }
});