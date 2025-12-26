# 🐾 PetCareX - Hệ Thống Quản Lý Thú Cưng

## 📋 Mô Tả
Web application quản lý hệ thống chăm sóc thú cưng với database có sẵn trên Aiven MySQL.

## 🏗️ Cấu Trúc Project

```
ADB-PetCareX/
├── src/
│   ├── backend/          # Node.js + Express API Server
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   ├── .env         # Environment variables
│   │   └── server.js    # Main server file
│   │
│   ├── frontend/        # React + Vite
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── services/    # API services
│   │       └── App.jsx
│   │
│   └── connect/         # Database connection scripts
```

## 🚀 Hướng Dẫn Cài Đặt

### 1️⃣ Cài Đặt Backend

```bash
# Di chuyển vào thư mục backend
cd src/backend

# Cài đặt dependencies
npm install

# Khởi chạy server
npm start
# hoặc dùng nodemon cho development
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

### 2️⃣ Cài Đặt Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd src/frontend

# Cài đặt dependencies
npm install

# Khởi chạy development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 📡 API Endpoints

### Chi Nhánh
- `GET /api/chinhanh` - Lấy danh sách chi nhánh
- `GET /api/chinhanh/:id` - Lấy chi tiết chi nhánh

### Thú Cưng
- `GET /api/thucung` - Lấy danh sách thú cưng
- `GET /api/thucung/:id` - Lấy chi tiết thú cưng
- `GET /api/thucung/owner/:ownerId` - Lấy thú cưng theo chủ

### Khách Hàng
- `GET /api/khachhang` - Lấy danh sách khách hàng
- `GET /api/khachhang/:id` - Lấy chi tiết khách hàng

### Hóa Đơn
- `GET /api/hoadon` - Lấy danh sách hóa đơn
- `GET /api/hoadon/:id` - Lấy chi tiết hóa đơn
- `GET /api/hoadon/customer/:customerId` - Lấy hóa đơn theo khách hàng

### Dịch Vụ
- `GET /api/dichvu` - Lấy danh sách dịch vụ
- `GET /api/dichvu/chinhanh/:chinanhId` - Lấy dịch vụ theo chi nhánh

## 🔧 Cấu Hình Database

File `.env` trong thư mục `src/backend/` đã được cấu hình sẵn kết nối đến Aiven MySQL.

⚠️ **Lưu ý**: Đảm bảo file `ca.pem` có trong thư mục `src/connect/`

## 🎨 Features

- ✅ Hiển thị danh sách chi nhánh
- ✅ Quản lý thú cưng
- ✅ Quản lý khách hàng
- ✅ Theo dõi hóa đơn
- ✅ Xem dịch vụ theo chi nhánh
- ✅ Giao diện đẹp mắt với gradient design
- ✅ Responsive design

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MySQL2
- CORS
- dotenv

### Frontend
- React 19
- Vite
- CSS3

## 📝 Lưu Ý

1. Đảm bảo backend đang chạy trước khi khởi động frontend
2. Database đã có sẵn data trên Aiven
3. Cần có kết nối internet để truy cập database Aiven
4. Port mặc định:
   - Backend: 5000
   - Frontend: 5173

## 🤝 Hỗ Trợ

Nếu gặp lỗi kết nối database, kiểm tra:
- File `ca.pem` có tồn tại trong `src/connect/`
- Thông tin kết nối trong file `.env`
- Kết nối internet

---

Made with ❤️ for PetCareX