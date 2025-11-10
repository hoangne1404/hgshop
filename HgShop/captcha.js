// captcha.js - Custom CAPTCHA implementation
(function() {
  // Hàm tạo mã captcha ngẫu nhiên
  function generateCaptcha() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captcha;
  }

  // Lưu trữ captcha hiện tại
  let currentCaptcha = '';

  // Hiển thị captcha
  function displayCaptcha(containerId) {
    currentCaptcha = generateCaptcha();
    const captchaDisplay = document.getElementById(containerId);
    
    if (!captchaDisplay) return;
    
    captchaDisplay.innerHTML = ''; // Xóa nội dung cũ
    
    for (let i = 0; i < currentCaptcha.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.textContent = currentCaptcha[i];
      // Thêm độ xoay ngẫu nhiên cho từng ký tự
      const rotation = Math.floor(Math.random() * 20) - 10; // -10 đến 10 độ
      charSpan.style.display = 'inline-block';
      charSpan.style.transform = `rotate(${rotation}deg)`;
      captchaDisplay.appendChild(charSpan);
    }
    
    return currentCaptcha;
  }

  // Kiểm tra captcha
  function validateCaptcha(inputId, errorId) {
    const userInput = document.getElementById(inputId).value;
    const errorElement = document.getElementById(errorId);
    
    if (userInput.toLowerCase() !== currentCaptcha.toLowerCase()) {
      if (errorElement) errorElement.style.display = 'block';
      return false;
    }
    
    if (errorElement) errorElement.style.display = 'none';
    return true;
  }

  // Đọc captcha bằng giọng nói
  function speakCaptcha() {
    if ('speechSynthesis' in window && currentCaptcha) {
      const utterance = new SpeechSynthesisUtterance(currentCaptcha.split('').join(' '));
      utterance.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt
      utterance.rate = 0.8; // Tốc độ chậm hơn một chút
      speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản.');
    }
  }

  // Khởi tạo captcha cho phần tử
  function initCaptcha(containerId, refreshBtnId, audioBtnId, inputId, errorId) {
    // Hiển thị captcha ban đầu
    displayCaptcha(containerId);
    
    // Sự kiện cho nút làm mới captcha
    const refreshBtn = document.getElementById(refreshBtnId);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => displayCaptcha(containerId));
    }
    
    // Sự kiện cho nút nghe mã captcha
    const audioBtn = document.getElementById(audioBtnId);
    if (audioBtn) {
      audioBtn.addEventListener('click', speakCaptcha);
    }
    
    // Trả về hàm validate để sử dụng bên ngoài
    return () => validateCaptcha(inputId, errorId);
  }

  // Xuất các hàm để sử dụng bên ngoài
  window.Captcha = {
    init: initCaptcha,
    display: displayCaptcha,
    validate: validateCaptcha,
    speak: speakCaptcha,
    getCurrent: () => currentCaptcha
  };
})();