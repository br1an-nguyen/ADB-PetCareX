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
