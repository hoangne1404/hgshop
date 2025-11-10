// chatbot.js - Chatbot mới với menu lựa chọn
(function() {
  // Lưu trữ chat history theo user
  function getChatStorageKey() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser ? `chatMessages_${currentUser.email}` : 'chatMessages_guest';
  }

  let chatMessages = JSON.parse(localStorage.getItem(getChatStorageKey())) || [];

  function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendChatbotMsg = document.getElementById('sendChatbotMsg');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (chatbotToggle && chatbotWindow) {
      // Toggle chatbot window
      chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
          loadChatMessages();
          chatbotInput.focus();
        }
      });

      // Close chatbot
      closeChatbot.addEventListener('click', function() {
        chatbotWindow.classList.add('hidden');
      });

      // Send message
      sendChatbotMsg.addEventListener('click', sendMessage);
      chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      function loadChatMessages() {
        if (!chatbotMessages) return;
        
        chatbotMessages.innerHTML = '';
        
        // Load recent messages
        const recentMessages = chatMessages.slice(-20);
        if (recentMessages.length === 0) {
          // Show welcome message with options if no messages
          showWelcomeMessage();
        } else {
          recentMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}`;
            messageDiv.innerHTML = `<div class="message-content">${msg.text}</div>`;
            chatbotMessages.appendChild(messageDiv);
          });
        }

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function showWelcomeMessage() {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'message bot';
        welcomeMsg.innerHTML = `
          <div class="message-content">
            <strong>Xin chào! Chào mừng bạn đến với HgShop! 👋</strong><br><br>
            Tôi có thể giúp gì cho bạn? Hãy chọn một trong các lựa chọn dưới đây:
          </div>
          <div class="chatbot-options">
            <button class="chatbot-option-btn" data-action="products">🛍️ Tìm hiểu sản phẩm</button>
            <button class="chatbot-option-btn" data-action="support">💬 Chat với người bán</button>
          </div>
        `;
        chatbotMessages.appendChild(welcomeMsg);

        // Add event listeners to option buttons
        document.querySelectorAll('.chatbot-option-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleOptionClick(action);
          });
        });

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function handleOptionClick(action) {
        if (action === 'products') {
          showProductCategories();
        } else if (action === 'support') {
          connectToSupport();
        }
      }

      function showProductCategories() {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.innerHTML = `
          <div class="message-content">
            <strong>Danh mục sản phẩm 🗂️</strong><br><br>
            Chọn danh mục bạn quan tâm:
          </div>
          <div class="chatbot-categories">
            <button class="chatbot-category-btn" data-category="monitor">🖥️ Màn hình</button>
            <button class="chatbot-category-btn" data-category="laptop">💻 Laptop</button>
            <button class="chatbot-category-btn" data-category="RAM">🧠 RAM</button>
            <button class="chatbot-category-btn" data-category="SSD">💾 SSD</button>
            <button class="chatbot-category-btn" data-category="Pin">🔋 Pin</button>
            <button class="chatbot-category-btn" data-category="Sac">🔌 Sạc</button>
            <button class="chatbot-category-btn" data-category="TanNhiet">❄️ Đế tản nhiệt</button>
            <button class="chatbot-category-btn" data-category="BanPhim">⌨️ Bàn phím</button>
            <button class="chatbot-category-btn" data-category="Chuot">🖱️ Chuột</button>
            <button class="chatbot-category-btn" data-category="TaiNghe">🎧 Tai nghe</button>
            <button class="chatbot-category-btn" data-category="Loa">🔊 Loa</button>
            <button class="chatbot-category-btn" data-category="Webcam">📷 Webcam</button>
            <button class="chatbot-category-btn" data-category="GiaTreo">📐 Giá treo</button>
          </div>
        `;
        chatbotMessages.appendChild(botMessage);

        // Add event listeners to category buttons
        document.querySelectorAll('.chatbot-category-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            showProductsByCategory(category);
          });
        });

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function showProductsByCategory(category) {
        // Map category names to match PRODUCTS data
        const categoryMap = {
          'monitor': 'monitor',
          'laptop': 'laptop',
          'RAM': 'RAM',
          'SSD': 'SSD',
          'Pin': 'Pin',
          'Sac': 'Sac',
          'TanNhiet': 'TanNhiet',
          'BanPhim': 'BanPhim',
          'Chuot': 'Chuot',
          'TaiNghe': 'TaiNghe',
          'Loa': 'Loa',
          'Webcam': 'Webcam',
          'GiaTreo': 'GiaTreo'
        };

        const actualCategory = categoryMap[category];
        let products = [];

        if (actualCategory === 'laptop') {
          // For laptop category, we want both laptop types and components
          products = window.PRODUCTS ? window.PRODUCTS.filter(p => 
            p.category === 'laptop' && p.type === 'Laptop'
          ) : [];
        } else if (actualCategory === 'monitor') {
          products = window.PRODUCTS ? window.PRODUCTS.filter(p => p.category === 'monitor') : [];
        } else {
          products = window.PRODUCTS ? window.PRODUCTS.filter(p => p.type === actualCategory) : [];
        }

        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        
        if (products.length === 0) {
          botMessage.innerHTML = `
            <div class="message-content">
              Hiện không có sản phẩm nào trong danh mục này. Vui lòng chọn danh mục khác.
            </div>
          `;
        } else {
          let productsHTML = `
            <div class="message-content">
              <strong>${getCategoryName(category)} 📦</strong><br><br>
              Dưới đây là các sản phẩm ${getCategoryName(category).toLowerCase()} tại HgShop:
            </div>
          `;

          products.slice(0, 5).forEach(product => {
            productsHTML += `
              <div class="chatbot-product">
                <img src="images/sanpham/${product.image}" alt="${product.name}" onerror="this.src='images/default-product.png'">
                <div class="chatbot-product-info">
                  <div class="chatbot-product-name">${product.name}</div>
                  <div class="chatbot-product-price">${formatPrice(product.price)}</div>
                  <div class="chatbot-product-specs">${product.specifications.slice(0, 2).join(', ')}</div>
                  <button class="chatbot-add-to-cart" data-product="${product.id}">🛒 Thêm vào giỏ</button>
                </div>
              </div>
            `;
          });

          botMessage.innerHTML = productsHTML;

          // Add back button
          const backButton = document.createElement('button');
          backButton.className = 'chatbot-option-btn';
          backButton.style.marginTop = '10px';
          backButton.textContent = '⬅️ Quay lại danh mục';
          backButton.addEventListener('click', showProductCategories);
          botMessage.appendChild(backButton);
        }

        chatbotMessages.appendChild(botMessage);

        // Add event listeners to add to cart buttons
        document.querySelectorAll('.chatbot-add-to-cart').forEach(btn => {
          btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product'));
            addToCartFromChatbot(productId);
          });
        });

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function getCategoryName(category) {
        const categoryNames = {
          'monitor': 'Màn hình',
          'laptop': 'Laptop',
          'RAM': 'RAM',
          'SSD': 'SSD',
          'Pin': 'Pin laptop',
          'Sac': 'Sạc laptop',
          'TanNhiet': 'Đế tản nhiệt',
          'BanPhim': 'Bàn phím',
          'Chuot': 'Chuột',
          'TaiNghe': 'Tai nghe',
          'Loa': 'Loa',
          'Webcam': 'Webcam',
          'GiaTreo': 'Giá treo màn hình'
        };
        return categoryNames[category] || category;
      }

      function addToCartFromChatbot(productId) {
        const product = window.PRODUCTS ? window.PRODUCTS.find(p => p.id === productId) : null;
        if (product) {
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingItem = cart.find(item => item.id === productId);
          
          if (existingItem) {
            existingItem.qty++;
          } else {
            cart.push({...product, qty: 1});
          }
          
          localStorage.setItem('cart', JSON.stringify(cart));
          
          // Update cart count in UI
          const cartCount = document.getElementById('cartCount');
          if (cartCount) {
            const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
            cartCount.textContent = totalQty;
          }
          
          // Show success message in chatbot
          const successMsg = document.createElement('div');
          successMsg.className = 'message bot';
          successMsg.innerHTML = `<div class="message-content">✅ Đã thêm <strong>${product.name}</strong> vào giỏ hàng!</div>`;
          chatbotMessages.appendChild(successMsg);
          chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
      }

      function connectToSupport() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const userEmail = currentUser ? currentUser.email : 'Khách';
        
        // Save support request for admin
        let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || {};
        if (!adminMessages[userEmail]) {
          adminMessages[userEmail] = [];
        }
        adminMessages[userEmail].push({
          type: 'support_request',
          timestamp: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('adminMessages', JSON.stringify(adminMessages));

        // Notify admin
        const notes = JSON.parse(localStorage.getItem('notifications') || '{}');
        const adminEmail = 'hoangne1404@gmail.com';
        notes[adminEmail] = notes[adminEmail] || [];
        notes[adminEmail].push(`Khách hàng ${userEmail} đang yêu cầu hỗ trợ qua chatbot`);
        localStorage.setItem('notifications', JSON.stringify(notes));

        const supportMsg = document.createElement('div');
        supportMsg.className = 'message bot';
        supportMsg.innerHTML = `
          <div class="message-content">
            <strong>Đã kết nối với đội ngũ hỗ trợ! 👨‍💼</strong><br><br>
            Chúng tôi đã ghi nhận yêu cầu của bạn. Đội ngũ hỗ trợ sẽ liên hệ với bạn trong thời gian sớm nhất.<br><br>
            Trong thời gian chờ đợi, bạn có thể:<br>
            • Xem các sản phẩm của chúng tôi<br>
            • Truy cập trang FAQ<br>
            • Gọi hotline: 0343867095<br><br>
            Cảm ơn bạn đã liên hệ với HgShop! ❤️
          </div>
          <div class="chatbot-options">
            <button class="chatbot-option-btn" data-action="products">🛍️ Xem sản phẩm</button>
            <button class="chatbot-option-btn" onclick="window.open('index.html', '_blank')">🏠 Truy cập website</button>
          </div>
        `;
        chatbotMessages.appendChild(supportMsg);

        // Add event listeners to option buttons
        document.querySelectorAll('.chatbot-option-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            if (action === 'products') {
              showProductCategories();
            }
          });
        });

        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function sendMessage() {
        const text = chatbotInput.value.trim();
        if (!text) return;

        // Add user message
        const userMessage = {
          sender: 'user',
          text: text,
          timestamp: new Date().toISOString()
        };
        chatMessages.push(userMessage);
        localStorage.setItem(getChatStorageKey(), JSON.stringify(chatMessages));

        // Display user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user';
        userMessageDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatbotMessages.appendChild(userMessageDiv);

        chatbotInput.value = '';
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Bot response based on user input
        setTimeout(() => {
          let botResponse = generateResponse(text);
          
          const botMessage = {
            sender: 'bot',
            text: botResponse,
            timestamp: new Date().toISOString()
          };
          chatMessages.push(botMessage);
          localStorage.setItem(getChatStorageKey(), JSON.stringify(chatMessages));

          const botMessageDiv = document.createElement('div');
          botMessageDiv.className = 'message bot';
          botMessageDiv.innerHTML = `<div class="message-content">${botResponse}</div>`;
          chatbotMessages.appendChild(botMessageDiv);

          chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 1000);
      }

      function generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
          return 'Xin chào! Tôi có thể giúp gì cho bạn? Hãy sử dụng các nút menu để khám phá sản phẩm hoặc yêu cầu hỗ trợ.';
        }
        
        if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
          return 'Không có gì! Rất vui được hỗ trợ bạn. Nếu cần thêm thông tin, đừng ngần ngại hỏi tôi nhé! 😊';
        }
        
        if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
          return 'Bạn có thể xem giá chi tiết của từng sản phẩm bằng cách chọn mục "Tìm hiểu sản phẩm" và chọn danh mục bạn quan tâm.';
        }
        
        if (lowerMessage.includes('mua') || lowerMessage.includes('mua hàng') || lowerMessage.includes('đặt hàng')) {
          return 'Để mua hàng, bạn có thể thêm sản phẩm vào giỏ hàng thông qua chatbot hoặc truy cập website để xem toàn bộ sản phẩm.';
        }
        
        // Default response
        return 'Tôi hiểu bạn đang nói về: "' + userMessage + '". Để được hỗ trợ tốt hơn, vui lòng sử dụng các tùy chọn menu bên dưới hoặc chat trực tiếp với nhân viên hỗ trợ.';
      }

      function formatPrice(price) {
        return price.toLocaleString('vi-VN') + 'đ';
      }
    }
  }

  // Initialize chatbot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

  // Make functions available globally
  window.Chatbot = {
    init: initChatbot,
    getMessages: () => chatMessages
  };
})();