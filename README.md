# 🐾 PetCareX - Hệ Thống Quản Lý Thú Cưng

> Dự án so sánh hiệu suất truy vấn database với Index và không Index

## 📋 Mô Tả

Web application quản lý hệ thống chăm sóc thú cưng, phục vụ mục đích **so sánh hiệu suất truy vấn** giữa database đã cài Index và chưa cài Index.

- 🔵 **Server Non-Index** (Port 5000): Kết nối database chưa cài index
- 🟢 **Server Index** (Port 5001): Kết nối database đã cài index

## 🏗️ Cấu Trúc Project

```
ADB-PetCareX/
├── sql/                    # Tài liệu SQL, stored procedures, schema
├── src/
│   ├── backend/            # Node.js + Express API Server
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic controllers
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   │
│   ├── frontend/           # React + Vite
│   │   └── src/
│   │       ├── components/    # Reusable components
│   │       ├── context/       # React context (Notification)
│   │       ├── pages/         # Role-based pages
│   │       │   ├── customer/  # Cổng Khách Hàng
│   │       │   ├── staff/     # Cổng Nhân Viên
│   │       │   ├── doctor/    # Cổng Bác Sĩ
│   │       │   └── manager/   # Cổng Quản Lý
│   │       └── App.jsx
│   │
│   └── connect/            # Database setup scripts
│       ├── index.env       # Config cho database có index
│       ├── non-index.env   # Config cho database không có index
│       ├── setup-tables.js
│       ├── setup-procedures.js
│       ├── setup-functions.js
│       ├── setup-triggers.js
│       └── setup-indexes.js
```

## 🚀 Hướng Dẫn Cài Đặt

### 1️⃣ Cài Đặt Backend

```bash
cd src/backend
npm install
```

#### Chạy Server **Non-Index** (Port 5000):
```powershell
$env:ENV_PROFILE = 'non-index'; npm run dev
```

#### Chạy Server **Index** (Port 5001):
```powershell
$env:ENV_PROFILE = 'index'; npm run dev
```

### 2️⃣ Cài Đặt Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

## 👥 Các Cổng Chức Năng

### 🙋 Cổng Khách Hàng (`/customer`)
| Trang | Mô tả |
|-------|-------|
| Dashboard | Tổng quan thú cưng và lịch hẹn |
| Online Booking | Đặt lịch khám online |
| Exam History | Xem lịch sử khám bệnh |
| Doctor Schedule | Xem lịch làm việc bác sĩ |
| Product Search | Tìm kiếm sản phẩm |

### 💼 Cổng Nhân Viên (`/staff`)
| Trang | Mô tả |
|-------|-------|
| Dashboard | Bảng điều khiển |
| Customer Lookup | Tra cứu thông tin khách hàng |
| Walk-in Booking | Tạo phiếu khám trực tiếp |
| Invoice Lookup | Tra cứu hóa đơn |

### 🩺 Cổng Bác Sĩ (`/doctor`)
| Trang | Mô tả |
|-------|-------|
| Dashboard | Hàng đợi bệnh nhân |
| Examination Form | Form nhập kết quả khám |
| Pet Record Lookup | Tra cứu hồ sơ thú cưng |
| Medicine Search | Tìm kiếm thuốc |

### 📊 Cổng Quản Lý (`/manager`)
| Trang | Mô tả |
|-------|-------|
| Dashboard | Thống kê tổng hợp |
| Revenue Report | Báo cáo doanh thu |
| Doctor Performance | Hiệu suất bác sĩ |

## 📡 API Endpoints

### Dữ liệu chung
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/chinhanh` | Danh sách chi nhánh |
| GET | `/api/chinhanh/:id` | Chi tiết chi nhánh |
| GET | `/api/thucung` | Danh sách thú cưng |
| GET | `/api/khachhang` | Danh sách khách hàng |
| GET | `/api/hoadon` | Danh sách hóa đơn |
| GET | `/api/dichvu` | Danh sách dịch vụ |

### Staff API (`/api/staff`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/lookup?query=...` | Tra cứu khách hàng |
| POST | `/walkin-booking` | Tạo phiếu khám trực tiếp |
| POST | `/register-customer` | Đăng ký khách hàng mới |
| GET | `/by-branch/:branchId` | Nhân viên theo chi nhánh |

### Doctor API (`/api/doctor`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/schedule` | Lịch làm việc bác sĩ |
| GET | `/pending-exams` | Danh sách chờ khám |
| GET | `/medical-records/:petId` | Hồ sơ bệnh án thú cưng |
| GET | `/medicine` | Tìm kiếm thuốc |
| GET | `/list` | Danh sách bác sĩ |
| POST | `/exam-result` | Lưu kết quả khám |

### Manager API (`/api/manager`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/thongke-tonghop` | Thống kê tổng hợp |
| GET | `/doanhthu-chinhanh` | Doanh thu theo chi nhánh |
| GET | `/doanhthu-sanpham` | Doanh thu theo sản phẩm |
| GET | `/hieusuatbacsi` | Hiệu suất bác sĩ |
| GET | `/top-dichvu` | Top dịch vụ |
| GET | `/thongke-hoivien` | Thống kê hội viên |
| POST | `/adjust-salary` | Điều chỉnh lương |

### Customer API (`/api/customer`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/list` | Danh sách khách hàng |
| GET | `/products` | Tìm kiếm sản phẩm |
| GET | `/categories` | Danh mục sản phẩm |
| GET | `/services` | Danh sách dịch vụ |
| GET | `/doctor-schedules` | Lịch bác sĩ |
| GET | `/pets/:customerId` | Thú cưng của khách |
| GET | `/exam-history/:petId` | Lịch sử khám |
| POST | `/book-online` | Đặt lịch online |

## 🔧 Cấu Hình Database

### File Environment
```
src/connect/
├── index.env       # Cấu hình database CÓ index
└── non-index.env   # Cấu hình database KHÔNG CÓ index
```

### Cấu trúc file `.env`
```env
DB_HOST=your-host.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
```

## 🎯 So Sánh Hiệu Suất

Dự án hỗ trợ chạy song song 2 server để so sánh:

| | Non-Index | Index |
|--|-----------|-------|
| **Port** | 5000 | 5001 |
| **ENV_PROFILE** | `non-index` | `index` |
| **Env file** | `src/connect/non-index.env` | `src/connect/index.env` |
| **Database** | Không có index | Đã cài index |

### Chạy cả 2 server cùng lúc (PowerShell):

**Terminal 1:**
```powershell
cd src/backend
$env:ENV_PROFILE = 'non-index'; npm run dev
```

**Terminal 2:**
```powershell
cd src/backend
$env:ENV_PROFILE = 'index'; npm run dev
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Aiven Cloud)
- **Packages**: mysql2, cors, dotenv

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS3 (Premium Minimalist Design)
- **Routing**: React Router

## 🎨 Tính Năng UI

- ✅ Thiết kế Premium Minimalist
- ✅ Gradient & Glassmorphism effects
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Confirm modal 
- ✅ Dark mode support
- ✅ Role-based navigation

## 📝 Lưu Ý

1. **Đảm bảo backend đang chạy trước khi khởi động frontend**
2. **Database đã được cấu hình sẵn trên Aiven Cloud**
3. **Cần kết nối internet để truy cập database**
4. **Tuân thủ stored procedures trong thư mục `/sql`** - không tự tạo query mới

## 🤝 Hỗ Trợ

Nếu gặp lỗi kết nối database, kiểm tra:
- Thông tin kết nối trong file `.env` tương ứng
- Kết nối internet ổn định
- Database server đang hoạt động

---

Made with ❤️ for **PetCareX** - Advanced Database Project
