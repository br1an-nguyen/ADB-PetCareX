import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import './App.css'
import LandingPage from './pages/LandingPage'
import StaffDashboard from './pages/staff/StaffDashboard'
import CustomerLookup from './pages/staff/CustomerLookup'
import WalkinBooking from './pages/staff/WalkinBooking'
import InvoiceLookup from './pages/staff/InvoiceLookup'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import RevenueReport from './pages/manager/RevenueReport'
import DoctorPerformance from './pages/manager/DoctorPerformance'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import ExaminationForm from './pages/doctor/ExaminationForm'
import MedicineSearch from './pages/doctor/MedicineSearch'
import PetRecordLookup from './pages/doctor/PetRecordLookup'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ProductSearch from './pages/customer/ProductSearch'
import ExamHistory from './pages/customer/ExamHistory'
import OnlineBooking from './pages/customer/OnlineBooking'
import DoctorSchedule from './pages/customer/DoctorSchedule'

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

                    {/* Customer Routes */}
                    <Route path="/customer" element={<CustomerDashboard />} />
                    <Route path="/customer/products" element={<ProductSearch />} />
                    <Route path="/customer/history" element={<ExamHistory />} />
                    <Route path="/customer/doctors" element={<DoctorSchedule />} />
                    <Route path="/customer/booking" element={<OnlineBooking />} />

                    {/* Doctor Routes */}
                    <Route path="/doctor" element={<DoctorDashboard />} />
                    <Route path="/doctor/examination/:phieuKhamId" element={<ExaminationForm />} />
                    <Route path="/doctor/medicine" element={<MedicineSearch />} />
                    <Route path="/doctor/pet-records" element={<PetRecordLookup />} />

                    {/* Manager Routes */}
                    <Route path="/manager" element={<ManagerDashboard />} />
                    <Route path="/manager/revenue" element={<RevenueReport />} />
                    <Route path="/manager/doctor-performance" element={<DoctorPerformance />} />

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
