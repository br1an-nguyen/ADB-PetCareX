import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationProvider';
import LandingPage from './pages/LandingPage';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import DoctorLayout from './layouts/DoctorLayout';
import StaffLayout from './layouts/StaffLayout';
import ManagerLayout from './layouts/ManagerLayout';

// Pages
import ProductSearch from './pages/customer/ProductSearch';
import Booking from './pages/customer/Booking';
import PetHistory from './pages/customer/PetHistory';

import PatientList from './pages/doctor/PatientList';
import MedicalRecord from './pages/doctor/MedicalRecord';

import WalkInBooking from './pages/staff/WalkInBooking';

import RevenueStats from './pages/manager/RevenueStats';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import InvoiceLookup from './pages/shared/InvoiceLookup';

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<ProductSearch />} />
            <Route path="booking" element={<Booking />} />
            <Route path="history" element={<PetHistory />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<PatientList />} />
            <Route path="examine/:id" element={<MedicalRecord />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<WalkInBooking />} />
            <Route path="invoices" element={<InvoiceLookup role="staff" />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<RevenueStats />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="invoices" element={<InvoiceLookup role="manager" />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;