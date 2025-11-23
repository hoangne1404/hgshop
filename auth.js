// Firebase objects will be available globally from the HTML files
// This file is now simplified to just provide utility functions

// Simple toast function
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.color = 'white';
    toast.style.fontWeight = '500';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '1000';
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout function
async function logout() {
    try {
        // Use the globally available Firebase auth object
        if (window.firebaseAuth) {
            await window.firebaseAuth.signOut();
            localStorage.removeItem('currentUser');
            showToast('Đã đăng xuất thành công');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            console.error('Firebase Auth not available');
            showToast('Lỗi đăng xuất', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Lỗi đăng xuất', 'error');
    }
}

// Update user role to seller
async function becomeSeller() {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Use the globally available Firebase database object
        if (window.firebaseDatabase) {
            // Get database functions from the globally available database instance
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            await update(ref(window.firebaseDatabase, 'users/' + cur.uid), {
                role: 'seller'
            });
            
            // Update local storage
            cur.role = 'seller';
            localStorage.setItem('currentUser', JSON.stringify(cur));
            
            showToast('Chúc mừng! Bạn đã trở thành người bán hàng.');
            
            // Update UI to reflect new role
            updateUIForSeller();
            
            // Reload page after a short delay
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            console.error('Firebase Database not available');
            showToast('Lỗi khi cập nhật vai trò', 'error');
        }
    } catch (error) {
        console.error('Become seller error:', error);
        showToast('Lỗi khi cập nhật vai trò', 'error');
    }
}

// Update UI for seller role
function updateUIForSeller() {
    // Hide become seller CTA if it exists
    const becomeSellerCTA = document.getElementById('becomeSellerCTA');
    const becomeSellerLink = document.getElementById('becomeSellerLink');
    
    if (becomeSellerCTA) {
        becomeSellerCTA.style.display = 'none';
    }
    
    if (becomeSellerLink) {
        becomeSellerLink.style.display = 'none';
    }
    
    // Show seller-specific elements if they exist
    const sellerElements = document.querySelectorAll('.seller-only');
    sellerElements.forEach(el => {
        el.style.display = 'block';
    });
}

// Update user avatar
async function updateAvatar(file) {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    try {
        // Upload to Cloudinary first
        if (window.uploadImageToCloudinary) {
            const imageUrl = await window.uploadImageToCloudinary(file);
            
            if (imageUrl) {
                // Update Firebase database
                if (window.firebaseDatabase) {
                    const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
                    
                    await update(ref(window.firebaseDatabase, 'users/' + cur.uid), {
                        avatarData: imageUrl
                    });
                    
                    // Update local storage
                    cur.avatarData = imageUrl;
                    localStorage.setItem('currentUser', JSON.stringify(cur));
                    
                    // Update UI
                    const avatarElements = document.querySelectorAll('#avatarIcon, #profileAvatar, #avatarPreview');
                    avatarElements.forEach(el => {
                        if (el) el.src = imageUrl;
                    });
                    
                    showToast('Ảnh đại diện đã được cập nhật!');
                } else {
                    showToast('Lỗi kết nối cơ sở dữ liệu', 'error');
                }
            }
        } else {
            showToast('Chức năng tải ảnh chưa sẵn sàng', 'error');
        }
    } catch (error) {
        console.error('Avatar update error:', error);
        showToast('Lỗi khi cập nhật ảnh đại diện', 'error');
    }
}

// Update user profile information
async function updateProfile(userData) {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    try {
        // Update Firebase database
        if (window.firebaseDatabase) {
            const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Prepare data to update (only include fields that are provided)
            const updateData = {};
            if (userData.name !== undefined) updateData.name = userData.name;
            if (userData.phone !== undefined) updateData.phone = userData.phone;
            if (userData.birthDate !== undefined) updateData.birthDate = userData.birthDate;
            
            await update(ref(window.firebaseDatabase, 'users/' + cur.uid), updateData);
            
            // Update local storage
            Object.assign(cur, updateData);
            localStorage.setItem('currentUser', JSON.stringify(cur));
            
            showToast('Thông tin tài khoản đã được cập nhật!');
        } else {
            showToast('Lỗi kết nối cơ sở dữ liệu', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Lỗi khi cập nhật thông tin tài khoản', 'error');
    }
}

// Update user password
async function updatePassword(currentPassword, newPassword) {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    try {
        // We need to re-authenticate the user before changing password
        if (window.firebaseAuth) {
            const { reauthenticateWithCredential, EmailAuthProvider, updatePassword } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
            
            // Create credential with current email and password
            const credential = EmailAuthProvider.credential(cur.email, currentPassword);
            
            // Re-authenticate user
            const user = window.firebaseAuth.currentUser;
            if (user) {
                await reauthenticateWithCredential(user, credential);
                
                // Update password
                await updatePassword(user, newPassword);
                
                showToast('Mật khẩu đã được cập nhật thành công!');
                return true;
            } else {
                throw new Error('User not found');
            }
        } else {
            showToast('Lỗi kết nối xác thực', 'error');
            return false;
        }
    } catch (error) {
        console.error('Password update error:', error);
        let errorMessage = 'Lỗi khi cập nhật mật khẩu';
        
        // Handle specific error cases
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Mật khẩu hiện tại không đúng';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Mật khẩu mới quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn';
        }
        
        showToast(errorMessage, 'error');
        return false;
    }
}

// Make functions globally available
window.logout = logout;
window.becomeSeller = becomeSeller;
window.updateAvatar = updateAvatar;
window.updateProfile = updateProfile;
window.updateUserPassword = updatePassword;
