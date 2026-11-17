/* ------------------------------------------------------------------
   Campus Care mock data
   Mirrors the values printed on the UI mockups 1:1 so the screens
   render identically before the Spring Boot API is wired up.
------------------------------------------------------------------ */

export type ReportStatus = 'PENDING' | 'IN PROGRESS' | 'RESOLVED' | 'CANCELLED'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

export interface Report {
  id: string
  equipment: string
  category: string
  brandModel: string
  serialNumber: string
  room: string
  building: string
  /** Room · Building composite used by the list cards */
  location: string
  reportedBy: string
  role: string
  status: ReportStatus
  priority: Priority
  date: string
  time: string
  description: string
  photos: string[]
}

export interface Announcement {
  id: number
  title: string
  description: string
  date: string
  tone: 'blue' | 'red'
}

export const currentUser = {
  name: 'Juan Dela Cruz',
  role: 'Instructor',
  initials: 'JD',
  email: 'juan.delacruz@mabini.edu.ph',
}

export const adminUser = {
  name: 'Admin User',
  role: 'System Administrator',
  initials: 'AU',
  email: 'admin@mabini.edu.ph',
}

/* -------------------------- Instructor --------------------------- */

export const reports: Report[] = []

export const reportHistory = [
  { id: 1, date: 'May 16, 2025 · 09:15 AM', action: 'Report submitted by Juan Dela Cruz', actor: 'JD' },
  { id: 2, date: 'May 16, 2025 · 10:02 AM', action: 'Under review by Admin User', actor: 'AU' },
  { id: 3, date: 'May 16, 2025 · 10:30 AM', action: 'Status changed to Pending', actor: 'AU' },
]

export const instructorStats = [] as const

export const announcements: Announcement[] = [
  {
    id: 1,
    title: 'Maintenance Schedule',
    description: 'The computer laboratory will undergo maintenance on May 20, 2025.',
    date: 'May 15, 2025',
    tone: 'blue',
  },
  {
    id: 2,
    title: 'New Reporting Guidelines',
    description: 'Please follow the new guidelines when submitting a defect report.',
    date: 'May 10, 2025',
    tone: 'red',
  },
  {
    id: 3,
    title: 'System Update',
    description: 'Campus Care will have a system update on May 18, 2025 (Sunday).',
    date: 'May 8, 2025',
    tone: 'blue',
  },
]

export const quickActions = [
  { title: 'Report a Defect', description: 'Submit a new damage report', to: '/report-damage', icon: 'plus' },
  { title: 'My Reports', description: 'View your submitted reports', to: '/my-reports', icon: 'list' },
  { title: 'Equipment List', description: 'Browse all campus equipment', to: '/equipment', icon: 'monitor' },
  { title: 'Knowledge Base', description: 'View common issues and solutions', to: '/knowledge-base', icon: 'book' },
]

/* ----------------------------- Admin ----------------------------- */

export const adminStats: Array<{ label: string; value: string; tone: 'blue' | 'orange' | 'purple' | 'green' | 'slate'; icon: string }> = [] as const

export const reportsByStatus = []

export const reportsByPriority = []

export const reportsOverTime = []

export const reportsByCategory = []

export const recentAdminReports: Array<{ id: string; equipment: string; location: string; reportedBy: string; status: ReportStatus; priority: Priority; date: string }> = []

/* --------------------------- Analytics --------------------------- */

export const analyticsStats = []

export const topEquipment = []

export const topLocations = []

/* -------------------------- Notifications ----------------------- */

export type NotificationKind = 'resolved' | 'updated' | 'assigned' | 'comment' | 'reminder'

export interface NotificationItem {
  id: number
  kind: NotificationKind
  title: string
  message: string
  time: string
  read: boolean
}

export const notificationFeed: NotificationItem[] = []

/* --------------------------- Announcements ----------------------- */

export type AnnouncementCategory = 'Maintenance' | 'Guidelines' | 'System' | 'General'

export interface AnnouncementPost {
  id: number
  title: string
  body: string
  date: string
  author: string
  category: AnnouncementCategory
  pinned?: boolean
}

export const announcementFeed: AnnouncementPost[] = []

/* -------------------------- Knowledge base ----------------------- */

export type KBCategory = 'Reporting Guidelines' | 'Common Equipment Issues' | 'IT Support'

export interface KBArticle {
  id: number
  category: KBCategory
  title: string
  summary: string
  body: string[]
  updated: string
}

export const kbArticles: KBArticle[] = []

/* ----------------------------- Profile --------------------------- */

export const instructorProfile = {
  fullName: 'Juan Dela Cruz',
  role: 'Instructor',
  initials: 'JD',
  email: 'juan.delacruz@mabini.edu.ph',
  employeeId: 'EMP-2019-042',
  department: 'College of Computer Studies',
  position: 'Instructor I',
  phone: '+63 917 555 0142',
  memberSince: 'June 2019',
}

export const adminProfile = {
  fullName: 'Admin User',
  role: 'System Administrator',
  initials: 'AU',
  email: 'admin@mabini.edu.ph',
  employeeId: 'ADM-2021-001',
  department: 'Management Information Systems',
  position: 'System Administrator',
  phone: '+63 917 555 0199',
  memberSince: 'August 2021',
}

/* -------------------------- Equipment catalog ---------------------- */

export type EquipmentStatus = 'Working' | 'Needs Repair' | 'Under Maintenance'

export interface EquipmentItem {
  id: string
  name: string
  category: string
  brand: string
  room: string
  building: string
  status: EquipmentStatus
  lastServiced: string
}

export const equipmentList: EquipmentItem[] = []

/* -------------------------- Rooms -------------------------- */

export const buildingOptions = [
  'Building A - Ground Floor',
  'Building A - 2nd Floor',
  'Building A - 3rd Floor',
  'Building B - Ground Floor',
  'Building B - 2nd Floor',
  'Building C - 2nd Floor',
  'Building D - 3rd Floor',
  'MRI Building - 2nd Floor',
  'MRI Building - 3rd Floor',
]

/** Rooms offered once a building / floor is chosen in the report form. */
export const roomOptions: Record<string, string[]> = {
  'MRI Building - 2nd Floor': [
    'MRI 201',
    'MRI 202',
    'MRI 203',
    'MRI 204',
    'MRI 205',
    'MRI 206',
    'MRI 207',
    'MRI 208',
    'MRI 209',
    'MRI 210',
    'MRI 211',
    'MRI 212',
  ],
  'MRI Building - 3rd Floor': [
    'MRI 302',
    'MRI 303',
    'MRI 304',
    'MRI 305',
    'MRI 306',
    'MRI 307',
    'MRI 308',
    'MRI 309',
    'MRI 310',
    'MRI 311',
    'MRI 312',
  ],
}

export const damageTypeOptions = [
  'Not working / No power',
  'Broken or cracked part',
  'Intermittent / Flickering',
  'Cosmetic damage only',
  'Other',
]

/* -------------------------- Category options ---------------------- */

export const categoryOptions = [
  'Computer',
  'Projector',
  'Printer',
  'Electric Fan',
  'Air Conditioner',
  'Audio Equipment',
  'Furniture',
  'Others',
]

/* -------------------------- Equipment options ---------------------- */

export const equipmentOptions = [
  'Computer Monitor',
  'Desktop Computer',
  'Projector',
  'Printer',
  'Electric Fan',
  'Air Conditioner',
  'Microphone',
  'Chalkboard',
]

/* -------------------------- Building options ---------------------- */

export const buildingOptionsFull = [
  'Building A - Ground Floor',
  'Building A - 2nd Floor',
  'Building A - 3rd Floor',
  'Building B - Ground Floor',
  'Building B - 2nd Floor',
  'Building C - 2nd Floor',
  'Building D - 3rd Floor',
  'MRI Building - 2nd Floor',
  'MRI Building - 3rd Floor',
]