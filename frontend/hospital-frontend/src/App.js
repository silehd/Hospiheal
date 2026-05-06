import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import LabTests from './pages/LabTests';
import AdminRegister from './pages/AdminRegister';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected routes (require authentication) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          
          {/* Catch‑all redirect to dashboard (or login if not authenticated, but ProtectedRoute handles that) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;