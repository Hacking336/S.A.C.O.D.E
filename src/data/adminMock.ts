import type { Priority, ReportStatus } from './mock'

/* ------------------------------------------------------------------
   Campus Care — mock data for the Admin modules.
   Shaped to mirror the eventual Spring Boot / Supabase endpoints:
     GET /api/locations        GET /api/staff
     GET /api/users            GET /api/audit-logs
     GET /api/reports (admin)
------------------------------------------------------------------ */

/* ----------------------------- Locations -------------------------- */

export interface CampusLocation {
  id: string
  building: string
  floor: string
  room: string
  department: string
  equipmentCount: number
}

export const campusLocations: CampusLocation[] = [
  { id: 'LOC-01', building: 'Main Building', floor: '1st Floor', room: 'Computer Lab 1', department: 'IT Department', equipmentCount: 45 },
  { id: 'LOC-02', building: 'Main Building', floor: '2nd Floor', room: 'Computer Lab 2', department: 'IT Department', equipmentCount: 38 },
  { id: 'LOC-03', building: 'Main Building', floor: 'Ground Floor', room: 'Admin Office', department: 'Administration', equipmentCount: 22 },
  { id: 'LOC-04', building: 'Building A', floor: 'Ground Floor', room: "Registrar's Office", department: 'Registrar', equipmentCount: 19 },
  { id: 'LOC-05', building: 'Building B', floor: 'Ground Floor', room: 'AVR Room', department: 'Academic Affairs', equipmentCount: 27 },
  { id: 'LOC-06', building: 'Building B', floor: '2nd Floor', room: 'Room 204', department: 'College of Education', equipmentCount: 14 },
  { id: 'LOC-07', building: 'Building C', floor: '2nd Floor', room: 'Room 305', department: 'College of Nursing', equipmentCount: 21 },
  { id: 'LOC-08', building: 'Building D', floor: '3rd Floor', room: 'Faculty Room', department: 'College of Computer Studies', equipmentCount: 16 },
  { id: 'LOC-09', building: 'Gymnasium', floor: 'Ground Floor', room: 'Sports Office', department: 'Physical Education', equipmentCount: 33 },
  { id: 'LOC-10', building: 'Library Annex', floor: '2nd Floor', room: 'Multimedia Room', department: 'Library Services', equipmentCount: 25 },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `LOC-${String(11 + i).padStart(2, '0')}`,
    building: 'MRI Building',
    floor: '2nd Floor',
    room: `MRI ${201 + i}`,
    department: '—',
    equipmentCount: 0,
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `LOC-${String(23 + i).padStart(2, '0')}`,
    building: 'MRI Building',
    floor: '3rd Floor',
    room: `MRI ${302 + i}`,
    department: '—',
    equipmentCount: 0,
  })),
]

/* ------------------------------ Staff ----------------------------- */

export type StaffSpecialty =
  | 'IT / Computers'
  | 'Electrical'
  | 'Plumbing'
  | 'General Repair'
  | 'Air Conditioning'

export type StaffStatus = 'Available' | 'On Task'

export interface MaintenanceStaff {
  id: string
  name: string
  initials: string
  specialty: StaffSpecialty
  status: StaffStatus
  assigned: string[]
  phone: string
  shift: string
}

export const maintenanceStaff: MaintenanceStaff[] = [
  { id: 'STF-01', name: 'Rey Manalo', initials: 'RM', specialty: 'IT / Computers', status: 'On Task', assigned: [], phone: '+63 917 220 1188', shift: '8:00 AM – 5:00 PM' },
  { id: 'STF-02', name: 'Tessie Bautista', initials: 'TB', specialty: 'Electrical', status: 'Available', assigned: [], phone: '+63 917 220 1192', shift: '8:00 AM – 5:00 PM' },
  { id: 'STF-03', name: 'Nilo Garcia', initials: 'NG', specialty: 'Plumbing', status: 'Available', assigned: [], phone: '+63 917 220 1204', shift: '7:00 AM – 4:00 PM' },
  { id: 'STF-04', name: 'Maricel Dizon', initials: 'MD', specialty: 'General Repair', status: 'On Task', assigned: [], phone: '+63 917 220 1217', shift: '8:00 AM – 5:00 PM' },
  { id: 'STF-05', name: 'Joel Ramos', initials: 'JR', specialty: 'Air Conditioning', status: 'On Task', assigned: [], phone: '+63 917 220 1223', shift: '8:00 AM – 5:00 PM' },
  { id: 'STF-06', name: 'Aileen Torres', initials: 'AT', specialty: 'IT / Computers', status: 'Available', assigned: [], phone: '+63 917 220 1230', shift: '1:00 PM – 9:00 PM' },
]

/* ------------------------------ Users ----------------------------- */

export type UserRole = 'Admin' | 'Maintenance Staff' | 'Instructor'
export type UserStatus = 'Active' | 'Inactive'

export interface DirectoryUser {
  id: string
  name: string
  initials: string
  email: string
  role: UserRole
  department: string
  status: UserStatus
  lastActive: string
}

export const directoryUsers: DirectoryUser[] = [
  { id: 'USR-001', name: 'Admin User', initials: 'AU', email: 'admin@mabini.edu.ph', role: 'Admin', department: 'Administration', status: 'Active', lastActive: 'Just now' },
  { id: 'USR-002', name: 'Juan Dela Cruz', initials: 'JD', email: 'juan.delacruz@mabini.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'Active', lastActive: '10 minutes ago' },
  { id: 'USR-003', name: 'Maria Santos', initials: 'MS', email: 'maria.santos@mabini.edu.ph', role: 'Instructor', department: 'College of Education', status: 'Active', lastActive: '2 hours ago' },
  { id: 'USR-004', name: 'Pedro Reyes', initials: 'PR', email: 'pedro.reyes@mabini.edu.ph', role: 'Instructor', department: 'College of Nursing', status: 'Active', lastActive: 'Yesterday' },
  { id: 'USR-005', name: 'Rey Manalo', initials: 'RM', email: 'rey.manalo@mabini.edu.ph', role: 'Maintenance Staff', department: 'IT Department', status: 'Active', lastActive: '25 minutes ago' },
  { id: 'USR-006', name: 'Tessie Bautista', initials: 'TB', email: 'tessie.bautista@mabini.edu.ph', role: 'Maintenance Staff', department: 'Facilities', status: 'Active', lastActive: '1 hour ago' },
  { id: 'USR-007', name: 'Ana Villanueva', initials: 'AV', email: 'ana.villanueva@mabini.edu.ph', role: 'Instructor', department: 'College of Computer Studies', status: 'Active', lastActive: '3 hours ago' },
  { id: 'USR-008', name: 'Joel Ramos', initials: 'JR', email: 'joel.ramos@mabini.edu.ph', role: 'Maintenance Staff', department: 'Facilities', status: 'Active', lastActive: 'Yesterday' },
  { id: 'USR-009', name: 'Carlo Mendoza', initials: 'CM', email: 'carlo.mendoza@mabini.edu.ph', role: 'Instructor', department: 'College of Business', status: 'Inactive', lastActive: 'Mar 02, 2025' },
  { id: 'USR-010', name: 'Liza Fernandez', initials: 'LF', email: 'liza.fernandez@mabini.edu.ph', role: 'Instructor', department: 'College of Education', status: 'Inactive', lastActive: 'Feb 18, 2025' },
]

/* ---------------------------- Audit logs -------------------------- */

export type AuditActionType =
  | 'Status Change'
  | 'Report Update'
  | 'User Management'
  | 'Equipment'
  | 'Authentication'

export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  actionType: AuditActionType
  action: string
  ip: string
}

export const auditEntries: AuditEntry[] = [
  { id: 'LOG-014', timestamp: 'May 16, 2025 · 10:30 AM', user: 'Admin User', actionType: 'Status Change', action: 'Changed status to In Progress', ip: '192.168.1.14' },
  { id: 'LOG-013', timestamp: 'May 16, 2025 · 10:02 AM', user: 'Admin User', actionType: 'Report Update', action: 'Added maintenance note', ip: '192.168.1.14' },
  { id: 'LOG-012', timestamp: 'May 16, 2025 · 09:15 AM', user: 'Juan Dela Cruz', actionType: 'Report Update', action: 'Submitted new report', ip: '192.168.1.87' },
  { id: 'LOG-011', timestamp: 'May 15, 2025 · 04:12 PM', user: 'Admin User', actionType: 'User Management', action: 'Deactivated account', ip: '192.168.1.14' },
  { id: 'LOG-010', timestamp: 'May 15, 2025 · 02:05 PM', user: 'Maricel Dizon', actionType: 'Status Change', action: 'Changed status to Resolved', ip: '192.168.1.55' },
  { id: 'LOG-009', timestamp: 'May 15, 2025 · 11:48 AM', user: 'Admin User', actionType: 'Equipment', action: 'Added new equipment', ip: '192.168.1.14' },
  { id: 'LOG-008', timestamp: 'May 15, 2025 · 09:20 AM', user: 'Maria Santos', actionType: 'Authentication', action: 'Signed in from a new device', ip: '192.168.1.102' },
  { id: 'LOG-007', timestamp: 'May 14, 2025 · 08:40 AM', user: 'Admin User', actionType: 'Report Update', action: 'Raised priority to Critical', ip: '192.168.1.14' },
  { id: 'LOG-006', timestamp: 'May 14, 2025 · 08:22 AM', user: 'Joel Ramos', actionType: 'Status Change', action: 'Changed status to In Progress', ip: '192.168.1.61' },
  { id: 'LOG-005', timestamp: 'May 13, 2025 · 03:05 PM', user: 'Admin User', actionType: 'User Management', action: 'Created account', ip: '192.168.1.14' },
  { id: 'LOG-004', timestamp: 'May 13, 2025 · 11:20 AM', user: 'System', actionType: 'Equipment', action: 'Asset count recalculated', ip: '127.0.0.1' },
  { id: 'LOG-003', timestamp: 'May 12, 2025 · 01:10 PM', user: 'Admin User', actionType: 'Report Update', action: 'Assigned to staff', ip: '192.168.1.14' },
  { id: 'LOG-002', timestamp: 'May 12, 2025 · 09:02 AM', user: 'Ana Villanueva', actionType: 'Authentication', action: 'Signed in', ip: '192.168.1.120' },
  { id: 'LOG-001', timestamp: 'May 10, 2025 · 03:50 PM', user: 'Admin User', actionType: 'Status Change', action: 'Changed status to Resolved', ip: '192.168.1.14' },
]

/* --------------------------- All reports -------------------------- */

export interface AdminReportRow {
  id: string
  equipment: string
  category: string
  location: string
  reportedBy: string
  priority: Priority
  status: ReportStatus
  date: string
  assignedTo?: string
  /** Photo attached by the reporter, stored as a data URL so triage can read it. */
  photo?: string
}

/* The live queue (assignments, status changes, submitted reports) lives in
   reportStore.ts; `allReports` is only the seed it starts from. */

export const allReports: AdminReportRow[] = []