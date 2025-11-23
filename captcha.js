// captcha.js - CAPTCHA functionality for login and registration with voice reading
console.log('Captcha.js loaded successfully');

let currentCaptcha = '';

function generateCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    const length = 6;
    
    for (let i = 0; i < length; i++) {
        captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    currentCaptcha = captcha;
    console.log('Generated CAPTCHA:', currentCaptcha); // Debug log
    return captcha;
}

function displayCaptcha() {
    const captchaText = document.getElementById('captchaText');
    if (captchaText) {
        const captcha = generateCaptcha();
        captchaText.textContent = captcha;
    }
}

function refreshCaptcha() {
    displayCaptcha();
    const captchaInput = document.getElementById('captchaInput');
    if (captchaInput) {
        captchaInput.value = '';
    }
}

function speakCaptcha() {
    if ('speechSynthesis' in window) {
        const captchaText = document.getElementById('captchaText');
        if (captchaText && captchaText.textContent) {
            const utterance = new SpeechSynthesisUtterance(captchaText.textContent);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // Slower speech for clarity
            speechSynthesis.speak(utterance);
        }
    } else {
        alert('Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản. Vui lòng thử lại với trình duyệt khác.');
    }
}

function initCaptcha() {
    // Display initial CAPTCHA
    displayCaptcha();
    
    // Add refresh button event listener
    const refreshBtn = document.getElementById('refreshCaptcha');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshCaptcha);
    }
    
    // Add voice button event listener
    const voiceBtn = document.getElementById('voiceCaptcha');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', speakCaptcha);
    }
    
    console.log('CAPTCHA initialized');
}

// Make functions globally available
window.initCaptcha = initCaptcha;
window.refreshCaptcha = refreshCaptcha;
window.generateCaptcha = generateCaptcha;
window.getCurrentCaptcha = () => currentCaptcha; // Expose function to get current CAPTCHA
window.speakCaptcha = speakCaptcha;