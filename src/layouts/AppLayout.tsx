import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function AppLayout({ variant }: { variant: 'student' | 'admin' }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar variant={variant} />
      <main className="pl-[248px]">
        <div className="mx-auto max-w-[1400px] px-7 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
