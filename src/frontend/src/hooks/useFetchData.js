import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Custom Hook để fetch dữ liệu từ API với xử lý loading/error/pagination
 * @param {string} endpoint - API endpoint (ví dụ: 'khachhang', 'thucung')
 * @param {Object} options - Các tùy chọn
 * @param {boolean} options.pagination - Có sử dụng phân trang không
 * @param {number} options.initialLimit - Số lượng item mỗi trang (mặc định 20)
 * @param {boolean} options.autoFetch - Tự động fetch khi mount (mặc định true)
 */
export default function useFetchData(endpoint, options = {}) {
    const {
        pagination = false,
        initialLimit = 20,
        autoFetch = true
    } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: initialLimit,
        total: 0,
        totalPages: 0
    });

    /**
     * Fetch dữ liệu từ API
     */
    const fetchData = useCallback(async (page = 1) => {
        console.log(`🚀 [useFetchData] Bắt đầu fetch: ${endpoint}`);
        
        try {
            setLoading(true);
            setError(null);

            // Build URL với pagination nếu cần
            let url = `${API_BASE_URL}/${endpoint}`;
            if (pagination) {
                url += `?page=${page}&limit=${paginationInfo.limit}`;
            }
            
            console.log(`📡 [useFetchData] Calling API: ${url}`);
            
            const response = await fetch(url);
            
            console.log(`📥 [useFetchData] Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ [useFetchData] Dữ liệu nhận được:', result);

            // Xử lý các format response khác nhau
            if (result && result.success && Array.isArray(result.data)) {
                console.log(`📊 [useFetchData] Số lượng records: ${result.data.length}`);
                setData(result.data);
                
                // Cập nhật pagination info nếu có
                if (result.pagination) {
                    setPaginationInfo(result.pagination);
                }
            } else if (Array.isArray(result)) {
                console.log(`📊 [useFetchData] Số lượng records: ${result.length}`);
                setData(result);
            } else if (result && Array.isArray(result.data)) {
                setData(result.data);
            } else {
                console.warn('⚠️ [useFetchData] Dữ liệu không đúng format:', result);
                throw new Error('Dữ liệu không đúng định dạng');
            }

        } catch (err) {
            console.error('❌ [useFetchData] Lỗi:', err);
            console.error('❌ [useFetchData] Error message:', err.message);
            setError(err.message);
        } finally {
            console.log('🏁 [useFetchData] Kết thúc fetch, tắt loading...');
            setLoading(false);
        }
    }, [endpoint, pagination, paginationInfo.limit]);

    /**
     * Chuyển trang
     */
    const goToPage = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= paginationInfo.totalPages) {
            fetchData(newPage);
        }
    }, [fetchData, paginationInfo.totalPages]);

    /**
     * Refresh dữ liệu
     */
    const refresh = useCallback(() => {
        fetchData(pagination ? paginationInfo.page : 1);
    }, [fetchData, pagination, paginationInfo.page]);

    /**
     * Thêm mới record
     */
    const create = useCallback(async (newData) => {
        console.log(`➕ [useFetchData] Creating new record in ${endpoint}`);
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi thêm mới');
            }

            const result = await response.json();
            console.log('✅ [useFetchData] Created successfully:', result);
            
            // Refresh data sau khi thêm
            await refresh();
            return { success: true, data: result };

        } catch (err) {
            console.error('❌ [useFetchData] Create error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, [endpoint, refresh]);

    /**
     * Cập nhật record
     */
    const update = useCallback(async (id, updateData) => {
        console.log(`✏️ [useFetchData] Updating record ${id} in ${endpoint}`);
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi cập nhật');
            }

            const result = await response.json();
            console.log('✅ [useFetchData] Updated successfully:', result);
            
            // Refresh data sau khi cập nhật
            await refresh();
            return { success: true, data: result };

        } catch (err) {
            console.error('❌ [useFetchData] Update error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, [endpoint, refresh]);

    /**
     * Xóa record
     */
    const remove = useCallback(async (id) => {
        console.log(`🗑️ [useFetchData] Deleting record ${id} from ${endpoint}`);
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi xóa');
            }

            console.log('✅ [useFetchData] Deleted successfully');
            
            // Refresh data sau khi xóa
            await refresh();
            return { success: true };

        } catch (err) {
            console.error('❌ [useFetchData] Delete error:', err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, [endpoint, refresh]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto fetch khi mount
    useEffect(() => {
        if (autoFetch) {
            fetchData(1);
        }
    }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        // State
        data,
        loading,
        error,
        pagination: paginationInfo,
        
        // Actions
        fetchData,
        refresh,
        goToPage,
        create,
        update,
        remove,
        clearError,
        
        // Setters (cho trường hợp cần set manual)
        setData,
        setError
    };
}
