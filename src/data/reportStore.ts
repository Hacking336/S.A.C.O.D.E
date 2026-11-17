import { useSyncExternalStore } from 'react'
import { allReports, type AdminReportRow } from './adminMock'
import type { ReportStatus } from './mock'

/* ------------------------------------------------------------------
   Campus Care — the one report queue.

   The admin console and the maintenance board used to keep separate
   copies: an admin could assign a job, a technician could resolve it,
   and neither page would notice the other. This store is the single
   source of truth, so status, assignee and photo stay in step on both
   sides. (Still in memory: reloading the browser reseeds the mocks.)
------------------------------------------------------------------ */

let reports: AdminReportRow[] = [...allReports]
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => reports

export function useReports(): AdminReportRow[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getReport(id: string): AdminReportRow | undefined {
  return reports.find((report) => report.id === id)
}

/** Push a freshly submitted report into the queue both sides read. */
export function addReport(report: Omit<AdminReportRow, 'id' | 'date'>): AdminReportRow {
  const highest = reports.reduce(
    (max, row) => Math.max(max, Number(row.id.split('-').pop()) || 0),
    0,
  )
  const row: AdminReportRow = {
    ...report,
    id: `REP-2025-${String(highest + 1).padStart(4, '0')}`,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
  reports = [row, ...reports]
  emit()
  return row
}

export function updateReport(id: string, patch: Partial<AdminReportRow>) {
  reports = reports.map((report) => (report.id === id ? { ...report, ...patch } : report))
  emit()
}

/** Used by the maintenance board when a technician starts or finishes a job. */
export function setReportStatus(id: string, status: ReportStatus) {
  updateReport(id, { status })
}
