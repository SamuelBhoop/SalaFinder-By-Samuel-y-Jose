import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SpacesPage from './pages/SpacesPage'
import CalendarPage from './pages/CalendarPage'
import ReservationFormPage from './pages/ReservationFormPage'
import MyReservationsPage from './pages/MyReservationsPage'
import AdminReservationsPage from './pages/AdminReservationsPage'
import AdminNoShowPage from './pages/AdminNoShowPage'
import AdminSpacesPage from './pages/AdminSpacesPage'
import AdminAuditPage from './pages/AdminAuditPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/spaces" replace />} />
            <Route path="/spaces" element={<SpacesPage />} />
            <Route path="/spaces/:id/reserve" element={<ReservationFormPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route
              path="/admin/reservations"
              element={
                <RoleRoute roles={['Admin', 'Staff']}>
                  <AdminReservationsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/no-show"
              element={
                <RoleRoute roles={['Admin', 'Staff']}>
                  <AdminNoShowPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/spaces"
              element={
                <RoleRoute roles={['Admin']}>
                  <AdminSpacesPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RoleRoute roles={['Admin']}>
                  <AdminAuditPage />
                </RoleRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/spaces" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
