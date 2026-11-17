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

export const initialWorkOrders: WorkOrder[] = []

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
