const API_URL = 'http://localhost:5000/api';

// Chi nhánh
export const chiNhanhAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/chinhanh`);
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/chinhanh/${id}`);
        return response.json();
    }
};

// Thú cưng
export const thuCungAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/thucung`);
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/thucung/${id}`);
        return response.json();
    },
    getByOwner: async (ownerId) => {
        const response = await fetch(`${API_URL}/thucung/owner/${ownerId}`);
        return response.json();
    },
    create: async (data) => {
        const response = await fetch(`${API_URL}/thucung`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

// Giống (Breeds)
export const giongAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/giong`);
        return response.json();
    }
};

// Khách hàng
export const khachHangAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/khachhang`);
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/khachhang/${id}`);
        return response.json();
    },
    getByPhone: async (phone, page = 1) => {
        const response = await fetch(`${API_URL}/khachhang/phone/${phone}?page=${page}&limit=20`);
        return response.json();
    },
    create: async (data) => {
        const response = await fetch(`${API_URL}/khachhang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

// Hóa đơn
export const hoaDonAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/hoadon`);
        return response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/hoadon/${id}`);
        return response.json();
    },
    getByCustomer: async (customerId) => {
        const response = await fetch(`${API_URL}/hoadon/customer/${customerId}`);
        return response.json();
    },
    search: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/hoadon/search?${query}`);
        return response.json();
    }
};

// Dịch vụ
export const dichVuAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/dichvu`);
        return response.json();
    },
    getByChiNhanh: async (chinanhId) => {
        const response = await fetch(`${API_URL}/dichvu/chinhanh/${chinanhId}`);
        return response.json();
    }
};

// --- NEW APIS ---

// Sản phẩm
export const productAPI = {
    getAll: async (search = '') => {
        const query = search ? `?search=${search}` : '';
        const response = await fetch(`${API_URL}/products${query}`);
        return response.json();
    },
    purchase: async (data) => {
        const response = await fetch(`${API_URL}/products/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

// Đặt lịch & Khám bệnh
export const appointmentAPI = {
    create: async (data) => {
        const response = await fetch(`${API_URL}/appointments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    createWalkIn: async (data) => {
        const response = await fetch(`${API_URL}/appointments/walk-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    getPending: async () => {
        const response = await fetch(`${API_URL}/appointments/pending`);
        return response.json();
    },
    updateResult: async (data) => {
        const response = await fetch(`${API_URL}/appointments/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    getPetHistory: async (petId) => {
        const response = await fetch(`${API_URL}/appointments/history/${petId}`);
        return response.json();
    }
};

// Thống kê
export const statsAPI = {
    getRevenue: async () => {
        const response = await fetch(`${API_URL}/stats/revenue`);
        return response.json();
    },
    getGeneral: async () => {
        const response = await fetch(`${API_URL}/stats/general`);
        return response.json();
    },
    getBranches: async () => {
        const response = await fetch(`${API_URL}/stats/branches`);
        return response.json();
    },
    getDoctors: async () => {
        const response = await fetch(`${API_URL}/stats/doctors`);
        return response.json();
    },
    getProducts: async () => {
        const response = await fetch(`${API_URL}/stats/products`);
        return response.json();
    }
};
