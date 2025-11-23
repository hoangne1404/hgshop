// Firebase Debug Script
// Add this to your HTML pages to help diagnose Firebase issues

console.log('=== Firebase Debug Info ===');

// Check if Firebase is loaded
if (typeof firebase !== 'undefined') {
    console.log('Firebase SDK loaded');
} else {
    console.log('Firebase SDK NOT loaded');
}

// Check if Firebase app is initialized
if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
    console.log('Firebase app initialized:', firebase.apps.length, 'app(s)');
    console.log('First app:', firebase.apps[0]);
} else {
    console.log('Firebase app NOT initialized');
}

// Check for global Firebase objects
console.log('window.firebaseAuth:', !!window.firebaseAuth);
console.log('window.firebaseDatabase:', !!window.firebaseDatabase);

// Test database connection
setTimeout(async () => {
    if (window.firebaseDatabase) {
        try {
            // Dynamically import database functions
            const { ref, get } = await import("https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js");
            
            // Try to read a test path
            const testRef = ref(window.firebaseDatabase, '.info/connected');
            const snapshot = await get(testRef);
            console.log('Database connection test:', snapshot.val() ? 'Connected' : 'Not connected');
        } catch (error) {
            console.error('Database connection test failed:', error);
        }
    } else {
        console.log('Database not available for testing');
    }
}, 1000);

// Monitor auth state
if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'User signed in' : 'No user signed in');
        if (user) {
            console.log('Current user:', user.email, user.uid);
        }
    });
}