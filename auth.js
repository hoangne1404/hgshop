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
    console.log('updateAvatar called with file:', file);
    
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('Current user from localStorage:', cur);
    
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    try {
        // Upload to Cloudinary first
        if (window.uploadImageToCloudinary) {
            console.log('Uploading image to Cloudinary...');
            const imageUrl = await window.uploadImageToCloudinary(file);
            console.log('Image uploaded to Cloudinary, URL:', imageUrl);
            
            if (imageUrl) {
                // Update Firebase database
                if (window.firebaseDatabase) {
                    console.log('Updating Firebase database...');
                    const { ref, update } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
                    
                    await update(ref(window.firebaseDatabase, 'users/' + cur.uid), {
                        avatarData: imageUrl
                    });
                    console.log('Firebase database updated');
                    
                    // Update local storage
                    cur.avatarData = imageUrl;
                    localStorage.setItem('currentUser', JSON.stringify(cur));
                    console.log('Local storage updated');
                    
                    // Update UI
                    const avatarElements = document.querySelectorAll('#avatarIcon, #profileAvatar, #avatarPreview');
                    console.log('Avatar elements to update:', avatarElements.length);
                    avatarElements.forEach(el => {
                        if (el) {
                            el.src = imageUrl;
                            console.log('Updated avatar element:', el);
                        }
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
        showToast('Lỗi khi cập nhật ảnh đại diện: ' + error.message, 'error');
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
    console.log('updatePassword called with currentPassword:', currentPassword, 'newPassword:', newPassword);
    
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('Current user from localStorage:', cur);
    
    if (!cur) {
        showToast('Vui lòng đăng nhập!', 'error');
        return;
    }
    
    try {
        // We need to re-authenticate the user before changing password
        if (window.firebaseAuth) {
            const { reauthenticateWithCredential, EmailAuthProvider, updatePassword: firebaseUpdatePassword } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
            
            // Create credential with current email and password
            const credential = EmailAuthProvider.credential(cur.email, currentPassword);
            console.log('Created credential with email:', cur.email);
            
            // Re-authenticate user
            const user = window.firebaseAuth.currentUser;
            console.log('Current Firebase user:', user);
            
            if (user) {
                console.log('Re-authenticating user...');
                await reauthenticateWithCredential(user, credential);
                console.log('User re-authenticated successfully');
                
                // Update password
                console.log('Updating password...');
                await firebaseUpdatePassword(user, newPassword);
                console.log('Password updated successfully');
                
                // After password update, we need to update localStorage with new auth state
                // Get fresh user data from database
                if (window.firebaseDatabase) {
                    const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
                    const userRef = ref(window.firebaseDatabase, 'users/' + user.uid);
                    const snapshot = await get(userRef);
                    
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        const updatedUser = {
                            uid: user.uid,
                            email: user.email,
                            ...userData
                        };
                        
                        // Save updated user data to localStorage
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        console.log('Updated user data in localStorage');
                        
                        // Show success message and redirect based on role
                        showToast('Mật khẩu đã được cập nhật thành công!');
                        
                        // Redirect based on user role
                        setTimeout(() => {
                            if (updatedUser.role === 'admin') {
                                window.location.href = 'admin.html';
                            } else {
                                window.location.href = 'profile.html';
                            }
                        }, 1500);
                    }
                }
                
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
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Mật khẩu hiện tại không đúng';
        }
        
        showToast(errorMessage, 'error');
        return false;
    }
}

// Initialize login form event listener
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Proceed with login logic here
            try {
                if (window.firebaseAuth) {
                    const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
                    
                    const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
                    const user = userCredential.user;
                    
                    // Get additional user data from database
                    if (window.firebaseDatabase) {
                        const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
                        
                        const userRef = ref(window.firebaseDatabase, 'users/' + user.uid);
                        const snapshot = await get(userRef);
                        
                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            const currentUser = {
                                uid: user.uid,
                                email: user.email,
                                ...userData
                            };
                            
                            // Save to localStorage
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            
                            showToast('Đăng nhập thành công!');
                            
                            // Redirect based on user role
                            setTimeout(() => {
                                if (currentUser.role === 'admin') {
                                    window.location.href = 'admin.html';
                                } else {
                                    window.location.href = 'index.html';
                                }
                            }, 1500);
                        }
                    }
                } else {
                    showToast('Lỗi kết nối xác thực', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
                
                // Handle specific error cases
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Không tìm thấy người dùng với email này.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Mật khẩu không chính xác.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Email không hợp lệ.';
                }
                
                showToast(errorMessage, 'error');
            }
        });
    }
}

// Initialize register form event listener
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('r_name').value.trim();
            const email = document.getElementById('r_email').value.trim();
            const phone = document.getElementById('r_phone').value.trim();
            const password = document.getElementById('r_password').value;
            const confirmPassword = document.getElementById('r_confirm_password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showToast('Mật khẩu xác nhận không khớp.', 'error');
                return;
            }
            
            // Validate password strength (at least 6 characters)
            if (password.length < 6) {
                showToast('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                return;
            }
            
            // Proceed with registration logic here
            try {
                if (window.firebaseAuth && window.firebaseDatabase) {
                    const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js");
                    const { ref, set } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
                    
                    // Create user with email and password
                    const userCredential = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
                    const user = userCredential.user;
                    
                    // Save additional user data to database
                    const userData = {
                        name: name,
                        email: email,
                        phone: phone || '',
                        role: 'user',
                        createdAt: new Date().toISOString()
                    };
                    
                    await set(ref(window.firebaseDatabase, 'users/' + user.uid), userData);
                    
                    // Also save to localStorage for immediate access
                    const currentUser = {
                        uid: user.uid,
                        email: user.email,
                        ...userData
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    showToast('Đăng ký thành công!');
                    
                    // Redirect to home page after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showToast('Lỗi kết nối hệ thống', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
                
                // Handle specific error cases
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Email này đã được sử dụng.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Email không hợp lệ.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.';
                }
                
                showToast(errorMessage, 'error');
            }
        });
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form event listeners
    initLoginForm();
    initRegisterForm();
});

// Make functions globally available
window.logout = logout;
window.becomeSeller = becomeSeller;
window.updateAvatar = updateAvatar;
window.updateProfile = updateProfile;
window.updateUserPassword = updatePassword;
