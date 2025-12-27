import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import './App.css'
import LandingPage from './pages/LandingPage'
import StaffDashboard from './pages/staff/StaffDashboard'
import CustomerLookup from './pages/staff/CustomerLookup'
import WalkinBooking from './pages/staff/WalkinBooking'
import InvoiceLookup from './pages/staff/InvoiceLookup'

function App() {
    return (
        <RoleProvider>
            <BrowserRouter>
                <Routes>
                    {/* Landing Page - Role Selection */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Staff Routes */}
                    <Route path="/staff" element={<StaffDashboard />} />
                    <Route path="/staff/customer-lookup" element={<CustomerLookup />} />
                    <Route path="/staff/walkin-booking" element={<WalkinBooking />} />
                    <Route path="/staff/invoice-lookup" element={<InvoiceLookup />} />

                    {/* Customer Routes (placeholder) */}
                    <Route path="/customer" element={<PlaceholderPage title="Khách hàng" />} />

                    {/* Doctor Routes (placeholder) */}
                    <Route path="/doctor" element={<PlaceholderPage title="Bác sĩ" />} />

                    {/* Manager Routes (placeholder) */}
                    <Route path="/manager" element={<PlaceholderPage title="Quản lý" />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </RoleProvider>
    )
}

// Placeholder component for routes not yet implemented
function PlaceholderPage({ title }) {
    return (
        <div className="placeholder-page">
            <div className="placeholder-content">
                <h1>🚧 Portal {title}</h1>
                <p>Trang này đang được phát triển...</p>
                <a href="/" className="btn btn-primary">← Quay về trang chủ</a>
            </div>
        </div>
    );
}

export default App
