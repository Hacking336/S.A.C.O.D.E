import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import ReportDamage from './pages/ReportDamage'
import MyReports from './pages/MyReports'
import ReportDetails from './pages/ReportDetails'
import AdminDashboard from './pages/AdminDashboard'
import Analytics from './pages/Analytics'
import Equipment from './pages/Equipment'
import Notifications from './pages/Notifications'
import Announcements from './pages/Announcements'
import KnowledgeBase from './pages/KnowledgeBase'
import Profile from './pages/Profile'
import HelpSupport from './pages/HelpSupport'
import AdminReports from './pages/admin/AdminReports'
import AdminLocations from './pages/admin/AdminLocations'
import AdminStaff from './pages/admin/AdminStaff'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* --------------------------- Student --------------------------- */}
      <Route element={<AppLayout variant="student" />}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/report-damage" element={<ReportDamage />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<HelpSupport />} />
      </Route>

      {/* ---------------------------- Admin ---------------------------- */}
      <Route element={<AppLayout variant="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/equipment" element={<Equipment variant="admin" />} />
        <Route path="/admin/locations" element={<AdminLocations />} />
        <Route path="/admin/maintenance" element={<AdminStaff />} />
        {/* legacy sidebar path kept as an alias */}
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/logs" element={<AdminAuditLogs />} />
        {/* legacy sidebar path kept as an alias */}
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
            <div>
              <p className="text-5xl font-extrabold text-slate-300">404</p>
              <p className="mt-3 text-sm text-slate-500">This page could not be found.</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
