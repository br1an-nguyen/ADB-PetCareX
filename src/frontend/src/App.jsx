import { useState } from 'react'
import './App.css'
import ChiNhanhList from './components/ChiNhanhList'
import ThuCungList from './components/ThuCungList'
import HoaDonList from './components/HoaDonList'
import KhachHangList from './components/KhachHangList'

function App() {
  const [activeTab, setActiveTab] = useState('khachhang');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🐾 PetCareX</h1>
          <p>Quản lý chăm sóc thú cưng</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'khachhang' ? 'active' : ''}`}
            onClick={() => setActiveTab('khachhang')}
          >
            <span className="icon">👥</span>
            <span>Khách hàng</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'thucung' ? 'active' : ''}`}
            onClick={() => setActiveTab('thucung')}
          >
            <span className="icon">🐕</span>
            <span>Thú cưng</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'chinhanh' ? 'active' : ''}`}
            onClick={() => setActiveTab('chinhanh')}
          >
            <span className="icon">🏢</span>
            <span>Chi nhánh</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'hoadon' ? 'active' : ''}`}
            onClick={() => setActiveTab('hoadon')}
          >
            <span className="icon">📄</span>
            <span>Hóa đơn</span>
          </button>
        </nav>
      </aside>
      
      <main className="main-content">
        <div className="content-wrapper">
          {activeTab === 'khachhang' && <KhachHangList />}
          {activeTab === 'thucung' && <ThuCungList />}
          {activeTab === 'chinhanh' && <ChiNhanhList />}
          {activeTab === 'hoadon' && <HoaDonList />}
        </div>
      </main>
    </div>
  )
}

export default App