import { useSyncExternalStore } from 'react'
import type { AdminReportRow } from './adminMock'
import type { ReportStatus } from './mock'
import { setReportStatus } from './reportStore'

/* ------------------------------------------------------------------
   Campus Care — mock data for the Maintenance Staff module.
   One technician signs in (Rey Manalo) and sees the work orders that
   are assigned to him. Status changes are kept in a tiny module store
   so the dashboard and the task list always agree.
------------------------------------------------------------------ */

export const maintenanceUser = {
  name: 'Rey Manalo',
  role: 'Maintenance Technician',
  initials: 'RM',
  email: 'rey.manalo@mabini.edu.ph',
  phone: '+63 917 220 1188',
  specialty: 'IT / Computers',
  shift: '8:00 AM – 5:00 PM',
}

/** How the AI triage step routed this job, shown on the technician cards. */
export interface TriageNote {
  engine: 'model' | 'builtin'
  skill: string
  issue: string
  /** 0–100 */
  confidence: number
}

export interface WorkOrder extends AdminReportRow {
  room: string
  building: string
  /** When the admin wants the repair finished. */
  due: string
  /** Technician-facing note shown on the job card. */
  note: string
  triage?: TriageNote
}

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'REP-2025-0016',
    equipment: 'Air Conditioner',
    category: 'Air Conditioner',
    room: 'MRI 305',
    building: 'MRI Building - 3rd Floor',
    location: 'MRI 305 · MRI Building - 3rd Floor',
    reportedBy: 'Pedro Reyes',
    priority: 'Critical',
    status: 'PENDING',
    date: 'May 16, 2025',
    due: 'Today · 11:00 AM',
    note: 'Unit drips water onto the front seats. The class has been moved to MRI 304 until the drain is cleared.',
    assignedTo: 'Rey Manalo',
  },
  {
    id: 'REP-2025-0012',
    equipment: 'Computer Monitor',
    category: 'Computer',
    room: 'Computer Lab 1',
    building: 'Main Building - 1st Floor',
    location: 'Computer Lab 1 · Main Building - 1st Floor',
    reportedBy: 'Juan Dela Cruz',
    priority: 'High',
    status: 'PENDING',
    date: 'May 16, 2025',
    due: 'Today · 2:30 PM',
    note: 'Monitor powers on but the display stays black. Try a spare VGA cable first, then swap the unit.',
    assignedTo: 'Rey Manalo',
  },
  {
    id: 'REP-2025-0011',
    equipment: 'Projector',
    category: 'Projector',
    room: 'AVR Room',
    building: 'Building B - Ground Floor',
    location: 'AVR Room · Building B - Ground Floor',
    reportedBy: 'Maria Santos',
    priority: 'Medium',
    status: 'IN PROGRESS',
    date: 'May 15, 2025',
    due: 'Today · 4:00 PM',
    note: 'Lamp flickers after ten minutes of use. Replacement lamp already pulled from the stock room.',
    assignedTo: 'Rey Manalo',
  },
  {
    id: 'REP-2025-0015',
    equipment: 'Electric Fan',
    category: 'Electric Fan',
    room: 'MRI 204',
    building: 'MRI Building - 2nd Floor',
    location: 'MRI 204 · MRI Building - 2nd Floor',
    reportedBy: 'Ana Villanueva',
    priority: 'Low',
    status: 'PENDING',
    date: 'May 15, 2025',
    due: 'Tomorrow',
    note: 'Fan runs but the oscillation is stuck. Check the gear inside the neck before replacing the whole unit.',
    assignedTo: 'Rey Manalo',
  },
  {
    id: 'REP-2025-0007',
    equipment: 'Desktop Computer',
    category: 'Computer',
    room: 'Computer Lab 2',
    building: 'Main Building - 2nd Floor',
    location: 'Computer Lab 2 · Main Building - 2nd Floor',
    reportedBy: 'Maria Santos',
    priority: 'High',
    status: 'RESOLVED',
    date: 'May 12, 2025',
    due: 'Completed May 14',
    note: 'Replaced the power supply and cleaned the fans. Unit has been running for two days without a shutdown.',
    assignedTo: 'Rey Manalo',
  },
]

/* --------------------------- Little store ------------------------- */

let workOrders: WorkOrder[] = initialWorkOrders
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => workOrders

export function useWorkOrders(): WorkOrder[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Jobs that belong to the signed-in technician. */
export function useMyWorkOrders(): WorkOrder[] {
  return useWorkOrders().filter((order) => order.assignedTo === maintenanceUser.name)
}

/** Sidebar badge — the signed-in technician's unfinished jobs. */
export function useOpenWorkOrderCount(): number {
  return useMyWorkOrders().filter(
    (order) => order.status === 'PENDING' || order.status === 'IN PROGRESS',
  ).length
}

/** Used by the admin AI triage step once a report has been routed. */
export function addWorkOrder(order: WorkOrder) {
  workOrders = [order, ...workOrders.filter((existing) => existing.id !== order.id)]
  listeners.forEach((listener) => listener())
}

export function setWorkOrderStatus(id: string, status: ReportStatus) {
  workOrders = workOrders.map((order) => (order.id === id ? { ...order, status } : order))
  // Same job, same status: the admin console reads this queue too.
  setReportStatus(id, status)
  listeners.forEach((listener) => listener())
}
