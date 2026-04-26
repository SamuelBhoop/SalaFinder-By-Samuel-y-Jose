import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SpacesPage from './pages/SpacesPage'
import CalendarPage from './pages/CalendarPage'
import ReservationFormPage from './pages/ReservationFormPage'
import MyReservationsPage from './pages/MyReservationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/spaces" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
