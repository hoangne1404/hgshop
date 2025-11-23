// init-products.js - Initialize product data in Firebase

// Use the same Firebase configuration as in firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAEZ0c9W7hhytfZ2iGb2UjBIZ9Ol9v_qsc",
    authDomain: "test-8c734.firebaseapp.com",
    databaseURL: "https://test-8c734-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "test-8c734",
    storageBucket: "test-8c734.firebasestorage.app",
    messagingSenderId: "1054558285539",
    appId: "1:1054558285539:web:8db1dbbd2ea3f7cc7f1fd6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Sample products data
const sampleProducts = [
    {
        id: 1,
        name: "Màn hình Dell 24 inch",
        description: "Màn hình Dell UltraSharp U2422H với độ phân giải Full HD, tấm nền IPS, hỗ trợ xoay nghiêng.",
        price: 2500000,
        quantity: 50,
        category: "monitor",
        image: "monitor1.jpg",
        seller: "HgShop",
        rating: 4.5,
        reviews: [],
        specifications: [
            "Kích thước: 24 inch",
            "Độ phân giải: 1920 x 1080 (Full HD)",
            "Tấm nền: IPS",
            "Tần số quét: 60Hz",
            "Cổng kết nối: HDMI, DisplayPort"
        ],
        supplier: "Dell Vietnam",
        type: "Màn hình máy tính",
        sales: 120  // Add sales data
    },
    {
        id: 2,
        name: "Laptop ASUS Gaming",
        description: "Laptop ASUS ROG Strix G15 với CPU Intel Core i7, GPU RTX 3060, RAM 16GB, SSD 512GB.",
        price: 15000000,
        quantity: 20,
        category: "laptop",
        image: "laptop1.jpg",
        seller: "HgShop",
        rating: 4.8,
        reviews: [],
        specifications: [
            "CPU: Intel Core i7-11800H",
            "GPU: NVIDIA GeForce RTX 3060 6GB",
            "RAM: 16GB DDR4",
            "Ổ cứng: 512GB SSD",
            "Màn hình: 15.6 inch FHD 144Hz"
        ],
        supplier: "ASUS Vietnam",
        type: "Laptop gaming",
        sales: 85  // Add sales data
    },
    {
        id: 3,
        name: "Bàn phím cơ Corsair",
        description: "Bàn phím cơ Corsair K70 RGB MK.2 với switch Cherry MX Red, đèn RGB, chống nước.",
        price: 1200000,
        quantity: 100,
        category: "accessories",
        image: "keyboard1.jpg",
        seller: "HgShop",
        rating: 4.7,
        reviews: [],
        specifications: [
            "Loại switch: Cherry MX Red",
            "Đèn nền: RGB",
            "Số phím: 87 phím (TKL)",
            "Chống nước: Có",
            "Kết nối: USB-C"
        ],
        supplier: "Corsair",
        type: "Bàn phím cơ",
        sales: 210  // Add sales data
    },
    {
        id: 4,
        name: "Chuột Logitech MX Master",
        description: "Chuột không dây Logitech MX Master 3S với cảm biến Darkfield, thiết kế ergonomic.",
        price: 800000,
        quantity: 75,
        category: "accessories",
        image: "mouse1.jpg",
        seller: "HgShop",
        rating: 4.6,
        reviews: [],
        specifications: [
            "Loại kết nối: Bluetooth, USB receiver",
            "Số nút: 7 nút",
            "Độ phân giải: 4000 DPI",
            "Tuổi thọ pin: 70 ngày",
            "Thiết kế: Ergonomic"
        ],
        supplier: "Logitech",
        type: "Chuột không dây",
        sales: 150  // Add sales data
    },
    {
        id: 5,
        name: "Màn hình Samsung 27 inch 4K",
        description: "Màn hình Samsung Odyssey G7 với độ phân giải 4K, tần số quét 144Hz, hỗ trợ HDR.",
        price: 4500000,
        quantity: 30,
        category: "monitor",
        image: "monitor2.jpg",
        seller: "HgShop",
        rating: 4.9,
        reviews: [],
        specifications: [
            "Kích thước: 27 inch",
            "Độ phân giải: 3840 x 2160 (4K UHD)",
            "Tấm nền: VA",
            "Tần số quét: 144Hz",
            "Cổng kết nối: HDMI, DisplayPort, USB-C"
        ],
        supplier: "Samsung Vietnam",
        type: "Màn hình gaming",
        sales: 95  // Add sales data
    },
    {
        id: 6,
        name: "Laptop Lenovo ThinkPad",
        description: "Laptop Lenovo ThinkPad X1 Carbon với CPU Intel Core i5, thiết kế mỏng nhẹ, bền bỉ.",
        price: 12000000,
        quantity: 25,
        category: "laptop",
        image: "laptop2.jpg",
        seller: "HgShop",
        rating: 4.4,
        reviews: [],
        specifications: [
            "CPU: Intel Core i5-1135G7",
            "RAM: 8GB LPDDR4x",
            "Ổ cứng: 256GB SSD",
            "Màn hình: 14 inch FHD",
            "Trọng lượng: 1.13 kg"
        ],
        supplier: "Lenovo Vietnam",
        type: "Laptop doanh nhân",
        sales: 75  // Add sales data
    },
    {
        id: 7,
        name: "Tai nghe gaming HyperX",
        description: "Tai nghe HyperX Cloud II với âm thanh 7.1 ảo, microphone khử nhiễu, thiết kế thoải mái.",
        price: 1500000,
        quantity: 60,
        category: "accessories",
        image: "headphone1.jpg",
        seller: "HgShop",
        rating: 4.5,
        reviews: [],
        specifications: [
            "Loại driver: 53mm",
            "Tần số phản hồi: 15Hz - 25kHz",
            "Microphone: Khử nhiễu",
            "Kết nối: 3.5mm jack",
            "Đèn LED: Có"
        ],
        supplier: "HyperX",
        type: "Tai nghe gaming",
        sales: 180  // Add sales data
    },
    {
        id: 8,
        name: "Ổ cứng SSD 1TB",
        description: "Ổ cứng SSD Samsung 980 PRO 1TB với tốc độ đọc lên đến 7000MB/s, chuẩn PCIe 4.0.",
        price: 2000000,
        quantity: 80,
        category: "accessories",
        image: "ssd1.jpg",
        seller: "HgShop",
        rating: 4.8,
        reviews: [],
        specifications: [
            "Dung lượng: 1TB",
            "Chuẩn kết nối: PCIe 4.0 NVMe M.2",
            "Tốc độ đọc: 7000 MB/s",
            "Tốc độ ghi: 5100 MB/s",
            "Độ bền: 600 TBW"
        ],
        supplier: "Samsung Vietnam",
        type: "Ổ cứng SSD",
        sales: 140  // Add sales data
    }
];

// Function to initialize products in Firebase
async function initProducts() {
    try {
        console.log("Initializing products in Firebase...");
        
        // Clear existing products
        await database.ref('products').remove();
        
        // Add sample products
        for (const product of sampleProducts) {
            await database.ref('products/' + product.id).set(product);
            console.log(`Added product: ${product.name}`);
        }
        
        console.log("All products initialized successfully!");
    } catch (error) {
        console.error("Error initializing products:", error);
    }
}

// Function to create admin user if not exists
async function createAdminUser() {
    try {
        console.log("Checking/creating admin user...");
        
        // Check if admin user already exists
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val();
        
        let adminExists = false;
        if (users) {
            for (const userId in users) {
                if (users[userId].email === 'hoangne1404@gmail.com' && users[userId].role === 'admin') {
                    adminExists = true;
                    break;
                }
            }
        }
        
        if (!adminExists) {
            // In a real application, we would create the user with Firebase Authentication
            // But since we're just initializing data, we'll just add the user to the database
            console.log("Admin user not found, but we cannot create it without Firebase Auth setup");
            console.log("Please create the admin user manually with email: hoangne1404@gmail.com and password: 14042004");
            console.log("Then manually set the role to 'admin' in the database");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error checking/creating admin user:", error);
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!cur || cur.role !== 'admin') {
        alert('Cần quyền admin để khởi tạo dữ liệu sản phẩm');
        return;
    }
    
    if (confirm('Bạn có muốn khởi tạo dữ liệu sản phẩm mẫu?')) {
        initProducts();
    }
});