import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileWarning,
  ClipboardList,
  Monitor,
  Bell,
  Megaphone,
  BookOpen,
  User,
  LifeBuoy,
  LogOut,
  FileText,
  MapPin,
  Wrench,
  Users,
  BarChart3,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { BrandMark } from './Seal'
import { notificationFeed } from '../data/mock'

const UNREAD_COUNT = notificationFeed.filter((item) => !item.read).length

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Report Damage', to: '/report-damage', icon: FileWarning },
  { label: 'My Reports', to: '/my-reports', icon: ClipboardList },
  { label: 'Equipment', to: '/equipment', icon: Monitor },
  { label: 'Notifications', to: '/notifications', icon: Bell, badge: UNREAD_COUNT },
  { label: 'Announcements', to: '/announcements', icon: Megaphone },
  { label: 'Knowledge Base', to: '/knowledge-base', icon: BookOpen },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Help & Support', to: '/help', icon: LifeBuoy },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Reports', to: '/admin/reports', icon: FileText },
  { label: 'Equipment', to: '/admin/equipment', icon: Monitor },
  { label: 'Locations', to: '/admin/locations', icon: MapPin },
  { label: 'Maintenance Staff', to: '/admin/maintenance', icon: Wrench },
  { label: 'Users & Roles', to: '/admin/users', icon: Users },
  { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
  { label: 'Reports & Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit Logs', to: '/admin/logs', icon: ScrollText },
]

export function Sidebar({ variant }: { variant: 'student' | 'admin' }) {
  const navigate = useNavigate()
  const items = variant === 'student' ? STUDENT_NAV : ADMIN_NAV
  // /admin itself must stay active only on the admin dashboard route
  const end = (to: string) => to === '/admin'

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col bg-navy text-white shadow-[0_0_40px_rgba(11,17,38,0.35)]">
      <div className="px-5 pb-5 pt-6">
        <BrandMark />
      </div>

      <div className="mx-5 mb-3 h-px bg-white/10" />

      <nav className="thin-scroll flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={end(item.to)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white shadow-[0_6px_16px_rgba(37,99,235,0.35)]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
          Logout
        </button>
      </div>

      <div className="mx-5 h-px bg-white/10" />
      <p className="px-5 py-4 text-center text-[10.5px] leading-relaxed text-blue-200/60">
        Excellence in Service, Education, and Character
      </p>
    </aside>
  )
}
