// chatbot.js - Chatbot functionality
console.log('Chatbot.js loaded successfully');

document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendChatbotMsg = document.getElementById('sendChatbotMsg');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', function() {
            chatbotWindow.classList.toggle('hidden');
        });

        closeChatbot.addEventListener('click', function() {
            chatbotWindow.classList.add('hidden');
        });
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function handleUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Simple response logic
        if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Xin chào! Tôi có thể giúp gì cho bạn? Hãy hỏi tôi về sản phẩm laptop, màn hình hoặc linh kiện máy tính.';
        } else if (lowerMessage.includes('giá') || lowerMessage.includes('giảm giá') || lowerMessage.includes('sale')) {
            return 'Chúng tôi có nhiều chương trình khuyến mãi hấp dẫn. Vui lòng kiểm tra trên trang sản phẩm để biết giá mới nhất!';
        } else if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') || lowerMessage.includes('vận chuyển')) {
            return 'Chúng tôi giao hàng toàn quốc. Thời gian giao hàng từ 2-5 ngày tùy khu vực. Miễn phí ship cho đơn hàng từ 5 triệu!';
        } else if (lowerMessage.includes('bảo hành') || lowerMessage.includes('warranty')) {
            return 'Sản phẩm được bảo hành từ 12-24 tháng tùy loại. Chúng tôi có chính sách đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất.';
        } else if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks')) {
            return 'Cảm ơn bạn! Nếu cần thêm thông tin, đừng ngần ngại hỏi tôi nhé!';
        } else {
            return 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Vui lòng liên hệ hotline 0343867095 để được hỗ trợ trực tiếp!';
        }
    }

    if (sendChatbotMsg && chatbotInput) {
        sendChatbotMsg.addEventListener('click', function() {
            const message = chatbotInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatbotInput.value = '';
                
                // Simulate bot thinking
                setTimeout(function() {
                    const response = handleUserMessage(message);
                    addMessage(response);
                }, 1000);
            }
        });

        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatbotMsg.click();
            }
        });
    }
});