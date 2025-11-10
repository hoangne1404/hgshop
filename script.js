/* script.js - sản phẩm, cart, UI chung, account menu, notifications */

// PRODUCTS với thông tin chi tiết - ĐẦY ĐỦ 43 SẢN PHẨM
const PRODUCTS = [
  // MÀN HÌNH - 4 sản phẩm
  {
    id:1,
    name:'Màn hình Gaming ASUS ROG 27" 144Hz',
    category:'monitor',
    price:8990000,
    image:'monitor_asus_rog.jpg',
    type:'Gaming',
    description:'Màn hình chơi game ASUS ROG 27 inch với tần số quét 144Hz, độ phân giải Full HD, công nghệ Adaptive-Sync cho trải nghiệm game mượt mà.',
    specifications: ['27 inch', '144Hz', '1ms', 'FreeSync', 'Độ phân giải Full HD'],
    supplier: 'ASUS Việt Nam',
    rating: 4.5,
    reviews: []
  },
  {
    id:2,
    name:'Màn hình LG UltraWide 34" Cong',
    category:'monitor',
    price:12500000,
    image:'monitor_lg_ultrawide.jpg',
    type:'Cong',
    description:'Màn hình LG UltraWide 34 inch độ cong 1500R, độ phân giải WQHD, hoàn hảo cho công việc và giải trí.',
    specifications: ['34 inch', 'WQHD (3440x1440)', '1500R Curved', 'sRGB 99%', 'HDR10'],
    supplier: 'LG Electronics',
    rating: 4.7,
    reviews: []
  },
  {
    id:3,
    name:'Màn hình Dell 24" 4K UHD',
    category:'monitor',
    price:6790000,
    image:'monitor_dell_4k.jpg',
    type:'4K',
    description:'Màn hình Dell 24 inch độ phân giải 4K UHD, màu sắc chính xác, phù hợp cho thiết kế đồ họa.',
    specifications: ['24 inch', '4K UHD (3840x2160)', 'IPS Panel', 'Color Accurate', 'USB-C'],
    supplier: 'Dell Technologies',
    rating: 4.3,
    reviews: []
  },
  {
    id:4,
    name:'Màn hình Samsung Odyssey G5 32"',
    category:'monitor',
    price:7490000,
    image:'monitor_samsung_g5.jpg',
    type:'Gaming',
    description:'Màn hình gaming Samsung Odyssey G5 32 inch, độ phân giải QHD, tần số quét 144Hz, thiết kế cong 1000R.',
    specifications: ['32 inch', 'QHD (2560x1440)', '144Hz', '1000R Curved', 'FreeSync Premium'],
    supplier: 'Samsung Electronics',
    rating: 4.6,
    reviews: []
  },

  // LAPTOP - 4 sản phẩm
  {
    id:5,
    name:'Laptop Dell XPS 13 i7 Gen 13',
    category:'laptop',
    price:32900000,
    image:'laptop_dell_xps13.jpg',
    type:'Laptop',
    description:'Laptop Dell XPS 13 siêu mỏng nhẹ, cấu hình mạnh mẽ với Intel Core i7 thế hệ 13, phù hợp cho doanh nhân và sáng tạo nội dung.',
    specifications: ['13.4 inch FHD+', 'Intel Core i7-1355U', '16GB LPDDR5', '512GB SSD', 'Windows 11'],
    supplier: 'Dell Technologies',
    rating: 4.8,
    reviews: []
  },
  {
    id:6,
    name:'Laptop ASUS TUF Gaming A15',
    category:'laptop',
    price:24500000,
    image:'laptop_asus_tuf.jpg',
    type:'Laptop',
    description:'Laptop gaming ASUS TUF A15 với RTX 4060, AMD Ryzen 7, hiệu năng gaming đỉnh cao, thiết kế bền bỉ.',
    specifications: ['15.6 inch FHD 144Hz', 'AMD Ryzen 7 7735HS', 'NVIDIA RTX 4060', '16GB DDR5', '512GB SSD'],
    supplier: 'ASUS Việt Nam',
    rating: 4.6,
    reviews: []
  },
  {
    id:7,
    name:'Laptop Lenovo ThinkPad X1 Carbon',
    category:'laptop',
    price:28900000,
    image:'laptop_lenovo_thinkpad.jpg',
    type:'Laptop',
    description:'Laptop doanh nhân Lenovo ThinkPad X1 Carbon siêu nhẹ, bền bỉ với Intel Core i7, bàn phím êm ái hoàn hảo cho công việc.',
    specifications: ['14 inch WUXGA', 'Intel Core i7-1365U', '16GB LPDDR5', '1TB SSD', 'Windows 11 Pro'],
    supplier: 'Lenovo Vietnam',
    rating: 4.7,
    reviews: []
  },
  {
    id:8,
    name:'Laptop HP Pavilion 15',
    category:'laptop',
    price:17900000,
    image:'laptop_hp_pavilion.jpg',
    type:'Laptop',
    description:'Laptop HP Pavilion 15 đa năng, thiết kế hiện đại, cấu hình cân bằng phù hợp cho học tập và làm việc.',
    specifications: ['15.6 inch FHD', 'Intel Core i5-12450H', '8GB DDR4', '512GB SSD', 'Windows 11'],
    supplier: 'HP Inc.',
    rating: 4.4,
    reviews: []
  },

  // RAM - 4 sản phẩm
  {
    id:9,
    name:'RAM Kingston Fury 16GB DDR4 3200MHz',
    category:'laptop',
    price:1290000,
    image:'ram_kingston_16gb.jpg',
    type:'RAM',
    description:'RAM Kingston Fury Beast 16GB DDR4 3200MHz, hiệu năng cao cho gaming và đa nhiệm, tương thích rộng rãi.',
    specifications: ['16GB DDR4', '3200MHz', 'CL16', 'Heat Spreader', 'Plug and Play'],
    supplier: 'Kingston Technology',
    rating: 4.4,
    reviews: []
  },
  {
    id:10,
    name:'RAM Corsair Vengeance 32GB DDR4 3600MHz',
    category:'laptop',
    price:2490000,
    image:'ram_corsair_32gb.jpg',
    type:'RAM',
    description:'RAM Corsair Vengeance LPX 32GB DDR4 3600MHz, hiệu năng ổn định, tản nhiệt nhôm, lý tưởng cho build PC gaming.',
    specifications: ['32GB DDR4', '3600MHz', 'CL18', 'Nhôm tản nhiệt', 'Intel XMP 2.0'],
    supplier: 'Corsair',
    rating: 4.8,
    reviews: []
  },
  {
    id:11,
    name:'RAM G.Skill Trident Z 16GB DDR5 5600MHz',
    category:'laptop',
    price:2190000,
    image:'ram_gskill_16gb.jpg',
    type:'RAM',
    description:'RAM G.Skill Trident Z 16GB DDR5 5600MHz, hiệu năng đỉnh cao cho hệ thống mới nhất, thiết kế RGB đẹp mắt.',
    specifications: ['16GB DDR5', '5600MHz', 'CL36', 'RGB Lighting', 'DDR5 Technology'],
    supplier: 'G.Skill',
    rating: 4.7,
    reviews: []
  },
  {
    id:12,
    name:'RAM Crucial Ballistix 8GB DDR4 2666MHz',
    category:'laptop',
    price:850000,
    image:'ram_crucial_8gb.jpg',
    type:'RAM',
    description:'RAM Crucial Ballistix 8GB DDR4 2666MHz, chất lượng ổn định, giá cả phải chăng, phù hợp cho nâng cấp cơ bản.',
    specifications: ['8GB DDR4', '2666MHz', 'CL16', 'Aluminum Heat Spreader', 'Micron Chips'],
    supplier: 'Crucial',
    rating: 4.3,
    reviews: []
  },

  // SSD - 4 sản phẩm
  {
    id:13,
    name:'SSD Samsung 980 PRO 1TB NVMe',
    category:'laptop',
    price:3290000,
    image:'ssd_samsung_980pro.jpg',
    type:'SSD',
    description:'SSD Samsung 980 PRO 1TB chuẩn NVMe PCIe 4.0, tốc độ đọc 7000MB/s, hiệu năng đỉnh cao cho gaming và sáng tạo nội dung.',
    specifications: ['1TB NVMe PCIe 4.0', '7000MB/s Read', '5000MB/s Write', 'M.2 2280', '5 năm bảo hành'],
    supplier: 'Samsung Electronics',
    rating: 4.9,
    reviews: []
  },
  {
    id:14,
    name:'SSD WD Black SN850X 2TB NVMe',
    category:'laptop',
    price:5490000,
    image:'ssd_wd_black.jpg',
    type:'SSD',
    description:'SSD Western Digital Black SN850X 2TB NVMe PCIe 4.0, tốc độ cực cao, tối ưu cho game thủ và creator.',
    specifications: ['2TB NVMe PCIe 4.0', '7300MB/s Read', '6600MB/s Write', 'M.2 2280', 'Game Mode 2.0'],
    supplier: 'Western Digital',
    rating: 4.8,
    reviews: []
  },
  {
    id:15,
    name:'SSD Crucial P3 500GB NVMe',
    category:'laptop',
    price:1190000,
    image:'ssd_crucial_p3.jpg',
    type:'SSD',
    description:'SSD Crucial P3 500GB NVMe PCIe 3.0, hiệu năng tốt, giá cả hợp lý, phù hợp cho laptop và PC văn phòng.',
    specifications: ['500GB NVMe PCIe 3.0', '3500MB/s Read', '3000MB/s Write', 'M.2 2280', '3 năm bảo hành'],
    supplier: 'Crucial',
    rating: 4.5,
    reviews: []
  },
  {
    id:16,
    name:'SSD Kingston NV2 1TB NVMe',
    category:'laptop',
    price:1690000,
    image:'ssd_kingston_nv2.jpg',
    type:'SSD',
    description:'SSD Kingston NV2 1TB NVMe PCIe 4.0, cân bằng giữa hiệu năng và giá thành, phù hợp cho đa số người dùng.',
    specifications: ['1TB NVMe PCIe 4.0', '3500MB/s Read', '2800MB/s Write', 'M.2 2280', 'Single-sided'],
    supplier: 'Kingston Technology',
    rating: 4.6,
    reviews: []
  },

  // PIN - 3 sản phẩm
  {
    id:17,
    name:'Pin Laptop Dell 56Wh Chính Hãng',
    category:'laptop',
    price:1890000,
    image:'pin_dell_56wh.jpg',
    type:'Pin',
    description:'Pin chính hãng Dell dung lượng 56Wh, tương thích với nhiều dòng laptop Dell, đảm bảo an toàn và tuổi thọ.',
    specifications: ['56Wh', 'Chính hãng Dell', 'Bảo hành 12 tháng', 'Tương thích đa dòng'],
    supplier: 'Dell Technologies',
    rating: 4.2,
    reviews: []
  },
  {
    id:18,
    name:'Pin Laptop HP 42Wh OEM',
    category:'laptop',
    price:1250000,
    image:'pin_hp_42wh.jpg',
    type:'Pin',
    description:'Pin laptop HP 42Wh chất lượng OEM, tương thích tốt, giá cả phải chăng, thời gian sử dụng ổn định.',
    specifications: ['42Wh', 'Chất lượng OEM', 'Bảo hành 6 tháng', 'Tương thích HP Pavilion'],
    supplier: 'HP Inc.',
    rating: 4.1,
    reviews: []
  },
  {
    id:19,
    name:'Pin Laptop Lenovo 45Wh',
    category:'laptop',
    price:1390000,
    image:'pin_lenovo_45wh.jpg',
    type:'Pin',
    description:'Pin laptop Lenovo 45Wh, chất lượng tốt, tương thích với các dòng ThinkPad và IdeaPad, độ bền cao.',
    specifications: ['45Wh', 'Tương thích Lenovo', 'Bảo hành 12 tháng', 'Cells chất lượng'],
    supplier: 'Lenovo Vietnam',
    rating: 4.3,
    reviews: []
  },

  // SẠC - 3 sản phẩm
  {
    id:20,
    name:'Sạc Laptop Lenovo 65W USB-C',
    category:'laptop',
    price:890000,
    image:'sac_lenovo_65w.jpg',
    type:'Sac',
    description:'Sạc laptop Lenovo 65W chuẩn USB-C, nhỏ gọn, tiện lợi mang theo, sạc nhanh cho laptop và thiết bị USB-C.',
    specifications: ['65W', 'USB-C', 'Chính hãng Lenovo', 'Sạc nhanh', 'Dây dài 1.8m'],
    supplier: 'Lenovo Vietnam',
    rating: 4.1,
    reviews: []
  },
  {
    id:21,
    name:'Sạc Laptop Dell 90W',
    category:'laptop',
    price:1250000,
    image:'sac_dell_90w.jpg',
    type:'Sac',
    description:'Sạc laptop Dell 90W chính hãng, công suất cao, phù hợp cho laptop Dell cấu hình mạnh, sạc nhanh hiệu quả.',
    specifications: ['90W', 'Chính hãng Dell', 'Đầu tròn Dell', 'Bảo hành 12 tháng', 'Dây dài 1.8m'],
    supplier: 'Dell Technologies',
    rating: 4.4,
    reviews: []
  },
  {
    id:22,
    name:'Sạc Đa Năng Baseus 65W USB-C',
    category:'laptop',
    price:750000,
    image:'sac_baseus_65w.jpg',
    type:'Sac',
    description:'Sạc đa năng Baseus 65W USB-C GaN, nhỏ gọn, sạc được laptop, tablet và smartphone, tiện lợi khi di chuyển.',
    specifications: ['65W GaN', '2 cổng USB-C + 1 USB-A', 'Sạc nhanh PD 3.0', 'Nhỏ gọn', 'Đa năng'],
    supplier: 'Baseus',
    rating: 4.7,
    reviews: []
  },

  // ĐẾ TẢN NHIỆT - 3 sản phẩm
  {
    id:23,
    name:'Đế Tản Nhiệt Laptop 6 Quạt RGB',
    category:'laptop',
    price:450000,
    image:'de_tan_nhiet_6quat.jpg',
    type:'TanNhiet',
    description:'Đế tản nhiệt laptop 6 quạt RGB, điều chỉnh độ cao, hiệu quả làm mát tốt, thiết kế đẹp mắt với đèn LED.',
    specifications: ['6 Quạt RGB', 'Điều chỉnh độ cao', 'USB Hub 4 cổng', 'Lưới tản nhiệt kim loại', 'Phù hợp laptop 15-17 inch'],
    supplier: 'Cooler Master',
    rating: 4.3,
    reviews: []
  },
  {
    id:24,
    name:'Đế Tản Nhiệt Havit 3 Quạt',
    category:'laptop',
    price:320000,
    image:'de_tan_nhiet_havit.jpg',
    type:'TanNhiet',
    description:'Đế tản nhiệt Havit 3 quạt, thiết kế đơn giản, hiệu quả làm mát tốt, giá cả phải chăng cho nhu cầu cơ bản.',
    specifications: ['3 Quạt 120mm', 'Điều chỉnh góc nghiêng', 'Chân cao su chống trượt', 'Phù hợp laptop 12-15.6 inch'],
    supplier: 'Havit',
    rating: 4.2,
    reviews: []
  },
  {
    id:25,
    name:'Đế Tản Nhiệt Deepcool 5 Quạt',
    category:'laptop',
    price:520000,
    image:'de_tan_nhiet_deepcool.jpg',
    type:'TanNhiet',
    description:'Đế tản nhiệt Deepcool 5 quạt, thiết kế chắc chắn, hiệu năng làm mát vượt trội, phù hợp cho laptop gaming.',
    specifications: ['5 Quạt 110mm', 'Điều chỉnh độ cao 3 mức', 'Lưới kim loại', 'Đèn LED xanh', 'Phù hợp laptop 17 inch'],
    supplier: 'Deepcool',
    rating: 4.5,
    reviews: []
  },

  // BÀN PHÍM - 3 sản phẩm
  {
    id:26,
    name:'Bàn Phím Cơ Keychron K2 RGB',
    category:'accessories',
    price:2190000,
    image:'ban_phim_keychron_k2.jpg',
    type:'BanPhim',
    description:'Bàn phím cơ Keychron K2 layout 75%, switch Gateron, kết nối Bluetooth/USB-C, đèn RGB, tương thích Mac/Windows.',
    specifications: ['75% Layout', 'Gateron Switch', 'Bluetooth 5.1/USB-C', 'RGB Backlit', 'Tương thích Mac/Windows'],
    supplier: 'Keychron',
    rating: 4.7,
    reviews: []
  },
  {
    id:27,
    name:'Bàn Phím Logitech MX Keys',
    category:'accessories',
    price:2490000,
    image:'ban_phim_logitech_mx.jpg',
    type:'BanPhim',
    description:'Bàn phím không dây Logitech MX Keys, thiết kế ergonomic, cảm giác gõ tốt, kết nối đa thiết bị, pin lâu.',
    specifications: ['Full-size', 'Kết nối Bluetooth/Unifying', 'Backlit thông minh', 'Pin 10 ngày', 'Easy-Switch'],
    supplier: 'Logitech',
    rating: 4.8,
    reviews: []
  },
  {
    id:28,
    name:'Bàn Phím Gaming Razer BlackWidow',
    category:'accessories',
    price:2890000,
    image:'ban_phim_razer.jpg',
    type:'BanPhim',
    description:'Bàn phím gaming Razer BlackWidow V3, switch cơ Razer Green, RGB Chroma, xây dựng kim loại, độ bền cao.',
    specifications: ['Full-size', 'Razer Green Switch', 'RGB Chroma', 'Xây dựng kim loại', 'Phím macro'],
    supplier: 'Razer',
    rating: 4.6,
    reviews: []
  },

  // CHUỘT - 3 sản phẩm
  {
    id:29,
    name:'Chuột Logitech MX Master 3S',
    category:'accessories',
    price:2490000,
    image:'chuot_logitech_mxmaster.jpg',
    type:'Chuot',
    description:'Chuột không dây Logitech MX Master 3S, cảm biến 8000DPI, kết nối Bluetooth/Unifying, pin sạc, thiết kế ergonomic.',
    specifications: ['8000DPI', 'Bluetooth/Unifying', 'Pin sạc 70 ngày', 'Ergonomic', 'MagSpeed Scroll'],
    supplier: 'Logitech',
    rating: 4.8,
    reviews: []
  },
  {
    id:30,
    name:'Chuột Gaming Razer DeathAdder V2',
    category:'accessories',
    price:1690000,
    image:'chuot_razer_deathadder.jpg',
    type:'Chuot',
    description:'Chuột gaming Razer DeathAdder V2, cảm biến 20K DPI, switch quang học, thiết kế ergonomic, RGB Chroma.',
    specifications: ['20,000 DPI', 'Switch quang học', '8 nút lập trình', 'RGB Chroma', 'Speedflex Cable'],
    supplier: 'Razer',
    rating: 4.7,
    reviews: []
  },
  {
    id:31,
    name:'Chuột Không Dây Microsoft Surface',
    category:'accessories',
    price:1190000,
    image:'chuot_microsoft_surface.jpg',
    type:'Chuot',
    description:'Chuột không dây Microsoft Surface, thiết kế tối giản, kết nối Bluetooth, pin AA, phù hợp cho văn phòng.',
    specifications: ['Bluetooth 4.0', 'Thiết kế tối giản', 'Pin AA (12 tháng)', 'Cảm biến BlueTrack', 'Phù hợp Surface'],
    supplier: 'Microsoft',
    rating: 4.3,
    reviews: []
  },

  // TAI NGHE - 3 sản phẩm
  {
    id:32,
    name:'Tai Nghe Sony WH-1000XM5',
    category:'accessories',
    price:8990000,
    image:'tai_nghe_sony_xm5.jpg',
    type:'TaiNghe',
    description:'Tai nghe chụp tai không dây Sony WH-1000XM5, chống ồi chủ động cao cấp, âm thanh chất lượng cao, thoải mái.',
    specifications: ['Chống ồi chủ động', '30 giờ pin', 'Bluetooth 5.2', 'Touch Control', 'Quick Charge'],
    supplier: 'Sony Vietnam',
    rating: 4.9,
    reviews: []
  },
  {
    id:33,
    name:'Tai Nghe Gaming HyperX Cloud II',
    category:'accessories',
    price:2190000,
    image:'tai_nghe_hyperx_cloud.jpg',
    type:'TaiNghe',
    description:'Tai nghe gaming HyperX Cloud II, âm thanh 7.1 ảo, micro khử tiếng ồn, thoải mái đeo lâu, tương thích đa nền tảng.',
    specifications: ['Âm thanh 7.1 ảo', 'Micro khử tiếng ồn', 'Driver 53mm', 'Thoải mái đeo lâu', 'Tương thích PC/PS/Xbox'],
    supplier: 'HyperX',
    rating: 4.6,
    reviews: []
  },
  {
    id:34,
    name:'Tai Nghe Apple AirPods Pro 2',
    category:'accessories',
    price:6990000,
    image:'tai_nghe_airpods_pro.jpg',
    type:'TaiNghe',
    description:'Tai nghe true wireless Apple AirPods Pro 2, chống ồi chủ động, chất âm tuyệt vời, tích hợp Siri, tương thích Apple.',
    specifications: ['Chống ồi chủ động', 'Transparency Mode', 'MagSafe Charging', '6 giờ nghe', 'Tương thích Apple'],
    supplier: 'Apple',
    rating: 4.8,
    reviews: []
  },

  // LOA - 3 sản phẩm
  {
    id:35,
    name:'Loa Bluetooth JBL Charge 5',
    category:'accessories',
    price:3990000,
    image:'loa_jbl_charge5.jpg',
    type:'Loa',
    description:'Loa Bluetooth JBL Charge 5, công suất 40W, chống nước IP67, pin 20 giờ, có thể sạc thiết bị khác.',
    specifications: ['40W RMS', 'IP67 Waterproof', '20 giờ pin', 'PartyBoost', 'Power Bank'],
    supplier: 'JBL Vietnam',
    rating: 4.6,
    reviews: []
  },
  {
    id:36,
    name:'Loa Marshall Stanmore II',
    category:'accessories',
    price:7990000,
    image:'loa_marshall_stanmore.jpg',
    type:'Loa',
    description:'Loa Marshall Stanmore II, thiết kế cổ điển, âm thanh mạnh mẽ, kết nối Bluetooth/AUX, điều khiển vật lý.',
    specifications: ['80W RMS', 'Bluetooth 5.0', '2 driver tweeter', '1 driver woofer', 'Thiết kế cổ điển'],
    supplier: 'Marshall',
    rating: 4.7,
    reviews: []
  },
  {
    id:37,
    name:'Loa Sony SRS-XB33',
    category:'accessories',
    price:3490000,
    image:'loa_sony_xb33.jpg',
    type:'Loa',
    description:'Loa Bluetooth Sony SRS-XB33, âm bass mạnh mẽ, chống nước IP67, đèn LED RGB, pin 24 giờ, Party Connect.',
    specifications: ['EXTRA BASS', 'IP67 Waterproof', '24 giờ pin', 'LED RGB', 'Party Connect'],
    supplier: 'Sony Vietnam',
    rating: 4.5,
    reviews: []
  },

  // WEBCAM - 3 sản phẩm
  {
    id:38,
    name:'Webcam Logitech C920 Pro HD',
    category:'accessories',
    price:1890000,
    image:'webcam_logitech_c920.jpg',
    type:'Webcam',
    description:'Webcam Logitech C920 Pro HD 1080p, micro stereo, tự động lấy nét, phù hợp cho họp online và stream.',
    specifications: ['1080p 30fps', 'Auto Focus', 'Micro stereo', 'Universal Clip', 'Tương thích Skype/Zoom'],
    supplier: 'Logitech',
    rating: 4.5,
    reviews: []
  },
  {
    id:39,
    name:'Webcam Razer Kiyo Pro',
    category:'accessories',
    price:2790000,
    image:'webcam_razer_kiyo.jpg',
    type:'Webcam',
    description:'Webcam Razer Kiyo Pro, cảm biến Sony, độ phân giải 1080p 60fps, adaptive light sensor, chất lượng stream cao.',
    specifications: ['1080p 60fps', 'Sony Starvis Sensor', 'Adaptive Light Sensor', 'HDR', 'Tích hợp màn trập'],
    supplier: 'Razer',
    rating: 4.7,
    reviews: []
  },
  {
    id:40,
    name:'Webcam Microsoft LifeCam HD-3000',
    category:'accessories',
    price:890000,
    image:'webcam_microsoft_lifecam.jpg',
    type:'Webcam',
    description:'Webcam Microsoft LifeCam HD-3000, chất lượng 720p, micro tích hợp, giá cả phải chăng, phù hợp văn phòng.',
    specifications: ['720p HD', 'Micro tích hợp', 'Universal Clip', 'Tự động cân bằng sáng', 'Tương thích Windows'],
    supplier: 'Microsoft',
    rating: 4.2,
    reviews: []
  },

  // GIÁ TREO - 3 sản phẩm
  {
    id:41,
    name:'Giá Treo Màn Hình Đa Năng NB F80',
    category:'accessories',
    price:890000,
    image:'gia_treo_man_hinh.jpg',
    type:'GiaTreo',
    description:'Giá treo màn hình đa năng NB F80, điều chỉnh độ cao, nghiêng, xoay, tối ưu không gian làm việc, chịu lực 8kg.',
    specifications: ['Điều chỉnh linh hoạt', 'Chịu lực 8kg', 'Lắp đặt dễ dàng', 'Phù hợp 17-27 inch', 'Khí nén'],
    supplier: 'North Bayou',
    rating: 4.4,
    reviews: []
  },
  {
    id:42,
    name:'Giá Treo Màn Hình Ergotron LX',
    category:'accessories',
    price:2490000,
    image:'gia_treo_ergotron.jpg',
    type:'GiaTreo',
    description:'Giá treo màn hình Ergotron LX cao cấp, điều chỉnh mượt mà, độ bền cao, chịu lực 11.3kg, bảo hành 10 năm.',
    specifications: ['Smooth Movement', 'Chịu lực 11.3kg', 'Bảo hành 10 năm', 'Phù hợp 13-34 inch', 'Công thái học'],
    supplier: 'Ergotron',
    rating: 4.8,
    reviews: []
  },
  {
    id:43,
    name:'Giá Treo Màn Hình Hãng Vivo',
    category:'accessories',
    price:650000,
    image:'gia_treo_vivo.jpg',
    type:'GiaTreo',
    description:'Giá treo màn hình Vivo, thiết kế đơn giản, giá cả phải chăng, điều chỉnh cơ bản, phù hợp cho văn phòng.',
    specifications: ['Điều chỉnh nghiêng', 'Chịu lực 9kg', 'Lắp VESA 75x75/100x100', 'Phù hợp 17-27 inch', 'Dễ lắp đặt'],
    supplier: 'VIVO',
    rating: 4.3,
    reviews: []
  }
];

// helpers
const el = id => document.getElementById(id);
const fmt = v => v.toLocaleString('vi-VN') + 'đ';

// CART in localStorage
let CART = JSON.parse(localStorage.getItem('cart')) || [];

// Biến để theo dõi trạng thái giỏ hàng
let isCartOpen = false;

// Hàm khởi tạo account menu
function initAccountMenu() {
  const avatarBtn = el('avatarBtn');
  const accountMenu = el('accountMenu');
  if (avatarBtn && accountMenu) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      accountMenu.classList.toggle('hidden');
    });
    // Đóng menu khi click bên ngoài
    document.addEventListener('click', () => {
      accountMenu.classList.add('hidden');
    });
  }
}

// Hàm khởi tạo tìm kiếm
function initSearch() {
  const searchInput = el('searchInput');
  const searchResults = el('searchResults');
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query.length === 0) {
        searchResults.classList.add('hidden');
        return;
      }
      const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(query));
      if (results.length > 0) {
        searchResults.innerHTML = results.map(p => `
          <div class="search-result-item" data-id="${p.id}">
            <img src="images/sanpham/${p.image}" alt="${p.name}" onerror="this.src='images/default-product.png'">
            <div class="search-result-info">
              <div class="search-result-name">${p.name}</div>
              <div class="search-result-price">${fmt(p.price)}</div>
            </div>
          </div>
        `).join('');
        searchResults.classList.remove('hidden');
        // Thêm sự kiện click cho kết quả tìm kiếm
        document.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const productId = item.getAttribute('data-id');
            viewProductDetail(productId);
          });
        });
      } else {
        searchResults.innerHTML = '<div class="search-result-item">Không tìm thấy sản phẩm</div>';
        searchResults.classList.remove('hidden');
      }
    });
    // Ẩn kết quả tìm kiếm khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.add('hidden');
      }
    });
  }
}

// Hàm khởi tạo danh mục
function initCategories() {
  const cats = document.querySelectorAll('.cat');
  cats.forEach(cat => {
    cat.addEventListener('click', () => {
      cats.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      renderProducts(cat.dataset.cat);
    });
  });
}

// Hàm hiển thị sản phẩm
function renderProducts(category = 'all') {
  const grid = el('productGrid');
  if (!grid) return;
  
  let filtered = PRODUCTS;
  if (category !== 'all') {
    filtered = PRODUCTS.filter(p => p.category === category);
  }
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="card">Không có sản phẩm nào trong danh mục này.</div>';
    return;
  }
  
  grid.innerHTML = filtered.map(p => `
    <div class="product card">
      <div class="pict" onclick="viewProductDetail(${p.id})" style="cursor:pointer">
        <img src="images/sanpham/${p.image}" alt="${p.name}" style="width:100%;height:160px;object-fit:contain;border-radius:8px" onerror="this.src='images/default-product.png'">
      </div>
      <div class="title" onclick="viewProductDetail(${p.id})" style="cursor:pointer;margin-top:8px">${p.name}</div>
      <div class="price" style="margin:8px 0">${fmt(p.price)}</div>
      <button class="btn primary" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
    </div>
  `).join('');
}

// Hàm xem chi tiết sản phẩm
function viewProductDetail(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

// Hàm thêm vào giỏ hàng
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    alert('Đã thêm vào giỏ hàng!');
  }
}

// Hàm cập nhật giao diện giỏ hàng
function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = el('cartCount');
  if (cartCount) {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  }
  const cartItems = el('cartItems');
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<div style="padding:20px;text-align:center">Giỏ hàng trống</div>';
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="images/sanpham/${item.image}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" onerror="this.src='images/default-product.png'">
          <div style="flex:1">
            <div style="font-weight:600">${item.name}</div>
            <div>${fmt(item.price)} x ${item.qty}</div>
          </div>
          <button class="secondary" onclick="removeFromCart(${item.id})" style="padding:4px 8px">Xóa</button>
        </div>
      `).join('');
    }
  }
  const cartTotal = el('cartTotal');
  if (cartTotal) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.textContent = fmt(total);
  }
}

// Hàm xóa khỏi giỏ hàng
function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Hàm toggle giỏ hàng
function toggleCart() {
  const cartSidebar = el('cartSidebar');
  const overlay = el('overlay');
  
  if (cartSidebar && overlay) {
    if (isCartOpen) {
      cartSidebar.classList.add('hidden');
      overlay.classList.add('hidden');
      isCartOpen = false;
    } else {
      updateCartUI(); // Cập nhật trước khi hiển thị
      cartSidebar.classList.remove('hidden');
      overlay.classList.remove('hidden');
      isCartOpen = true;
    }
  }
}

// Hàm đóng giỏ hàng
function closeCart() {
  const cartSidebar = el('cartSidebar');
  const overlay = el('overlay');
  
  if (cartSidebar && overlay) {
    cartSidebar.classList.add('hidden');
    overlay.classList.add('hidden');
    isCartOpen = false;
  }
}

// Hàm khởi tạo sự kiện UI
function initUIEvents() {
  // Cart sidebar
  const cartBtn = el('cartBtn');
  const closeCartBtn = el('closeCart');
  const overlay = el('overlay');
  const toCheckout = el('toCheckout');

  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCart();
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCart();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCart();
    });
  }

  // Đóng giỏ hàng khi click bên ngoài
  document.addEventListener('click', (e) => {
    const cartSidebar = el('cartSidebar');
    const cartBtn = el('cartBtn');
    if (cartSidebar && !cartSidebar.contains(e.target) && e.target !== cartBtn && !cartBtn.contains(e.target)) {
      closeCart();
    }
  });

  if (toCheckout) {
    toCheckout.addEventListener('click', () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  // Notifications
  const notifyBtn = el('notifyBtn');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', () => {
      const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (cur) {
        const notes = JSON.parse(localStorage.getItem('notifications') || '{}');
        const userNotes = notes[cur.email] || [];
        if (userNotes.length === 0) {
          alert('Không có thông báo mới!');
        } else {
          alert('Thông báo:\n' + userNotes.join('\n'));
          // Xóa thông báo sau khi đọc
          notes[cur.email] = [];
          localStorage.setItem('notifications', JSON.stringify(notes));
          refreshNotifications();
        }
      } else {
        alert('Vui lòng đăng nhập!');
      }
    });
  }
}

// Hàm làm mới thông báo
function refreshNotifications() {
  const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const notifyBadge = el('notifyBadge');
  if (notifyBadge && cur) {
    const notes = JSON.parse(localStorage.getItem('notifications') || '{}');
    const userNotes = notes[cur.email] || [];
    if (userNotes.length > 0) {
      notifyBadge.textContent = userNotes.length;
      notifyBadge.classList.remove('hidden');
    } else {
      notifyBadge.classList.add('hidden');
    }
  }
}

// Hàm làm mới avatar trong header
function refreshAvatarHeader() {
  const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const avatarIcon = el('avatarIcon');
  if (avatarIcon) {
    if (cur && cur.avatarData) {
      avatarIcon.src = cur.avatarData;
    } else {
      avatarIcon.src = 'images/default-avatar.png';
    }
  }
}

// Hàm khởi tạo trang account
function initAccountPage() {
  const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!cur) {
    alert('Vui lòng đăng nhập!');
    location.href = 'login.html';
    return;
  }

  // Hiển thị thông tin user
  const profileAvatar = el('profileAvatar');
  const userInfo = el('userInfo');
  if (profileAvatar && userInfo) {
    if (cur.avatarData) {
      profileAvatar.src = cur.avatarData;
    }
    userInfo.innerHTML = `
      <div><strong>Họ tên:</strong> ${cur.name}</div>
      <div><strong>Email:</strong> ${cur.email}</div>
      <div><strong>Số điện thoại:</strong> ${cur.phone || 'Chưa cập nhật'}</div>
    `;
  }

  // Xử lý thay đổi avatar
  const avatarInput = el('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const avatarData = event.target.result;
          // Cập nhật avatar cho user hiện tại
          cur.avatarData = avatarData;
          localStorage.setItem('currentUser', JSON.stringify(cur));
          // Cập nhật avatar trong danh sách users
          let users = JSON.parse(localStorage.getItem('users') || '[]');
          users = users.map(u => u.email === cur.email ? { ...u, avatarData } : u);
          localStorage.setItem('users', JSON.stringify(users));
          // Cập nhật giao diện
          profileAvatar.src = avatarData;
          refreshAvatarHeader();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Xử lý nút tải avatar về
  const downloadAvatar = el('downloadAvatar');
  if (downloadAvatar) {
    downloadAvatar.addEventListener('click', () => {
      if (cur.avatarData) {
        const a = document.createElement('a');
        a.href = cur.avatarData;
        a.download = 'avatar.png';
        a.click();
      } else {
        alert('Chưa có avatar để tải về!');
      }
    });
  }

  // Xử lý lưu thông tin profile
  const saveProfile = el('saveProfile');
  if (saveProfile) {
    saveProfile.addEventListener('click', () => {
      const editName = el('edit_name').value.trim();
      const editPhone = el('edit_phone').value.trim();
      const editPassword = el('edit_password').value.trim();

      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.map(u => {
        if (u.email === cur.email) {
          return {
            ...u,
            name: editName || u.name,
            phone: editPhone || u.phone,
            password: editPassword || u.password,
            avatarData: cur.avatarData
          };
        }
        return u;
      });
      localStorage.setItem('users', JSON.stringify(users));

      // Cập nhật currentUser
      const updatedUser = users.find(u => u.email === cur.email);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      alert('Đã cập nhật thông tin!');
      location.reload();
    });
  }

  // Hiển thị đơn hàng
  const myOrders = el('myOrders');
  if (myOrders) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      .filter(o => o.userEmail === cur.email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (orders.length === 0) {
      myOrders.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
    } else {
      myOrders.innerHTML = orders.map(o => `
        <div class="card" style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>${o.id}</strong> - ${new Date(o.createdAt).toLocaleString('vi-VN')}</div>
            <div><strong>${o.status}</strong></div>
          </div>
          <div style="margin-top:8px">
            <div>Địa chỉ: ${o.address}</div>
            <div>Phương thức: ${o.method}</div>
            <div>SP: ${o.items.map(i => i.name + ' x' + i.qty).join(', ')}</div>
            <div>Tổng: ${fmt(o.total)}</div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px">
            ${o.status === 'Đã giao' ? `
              <button class="secondary" onclick="showReviewForm('${o.id}')">Đánh giá</button>
              <button class="secondary" onclick="showReturnForm('${o.id}')">Yêu cầu hoàn hàng</button>
            ` : ''}
            ${o.returnRequest ? `
              <button class="secondary" onclick="showReturnStatus('${o.id}')">Xem trạng thái hoàn hàng</button>
            ` : ''}
          </div>
        </div>
      `).join('');
    }
  }
}

// Gán PRODUCTS vào window để sử dụng toàn cục
window.PRODUCTS = PRODUCTS;

// Gán các hàm toàn cục để sử dụng trong HTML
window.viewProductDetail = viewProductDetail;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.closeCart = closeCart;

// Gọi hàm khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo các chức năng
  initAccountMenu();
  initSearch();
  initCategories();
  initUIEvents();
  updateCartUI();
  refreshNotifications();
  refreshAvatarHeader();
  renderProducts();

  // Account page specific
  if (location.pathname.endsWith('account.html')) {
    initAccountPage();
  }
});
// Gán các hàm toàn cục để sử dụng trong HTML
window.viewProductDetail = viewProductDetail;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.fmt = fmt; // THÊM DÒNG NÀY