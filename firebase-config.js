// firebase-config.js - Firebase configuration
// Note: These keys are meant to be public in client-side applications
// Security is handled through Firebase Security Rules, not by hiding these keys

const firebaseConfig = {
    apiKey: "AIzaSyAEZ0c9W7hhytfZ2iGb2UjBIZ9Ol9v_qsc",
    authDomain: "test-8c734.firebaseapp.com",
    databaseURL: "https://test-8c734-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "test-8c734",
    storageBucket: "test-8c734.firebasestorage.app",
    messagingSenderId: "1054558285539",
    appId: "1:1054558285539:web:8db1dbbd2ea3f7cc7f1fd6"
};

// Make Firebase config globally available
window.firebaseConfig = firebaseConfig;