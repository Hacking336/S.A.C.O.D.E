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

export const studentStats = [
  { key: 'submitted', label: 'Reports Submitted', value: 12, sub: 'All time', tone: 'blue', icon: 'file' },
  { key: 'pending', label: 'Pending', value: 4, sub: 'Awaiting review', tone: 'orange', icon: 'clock' },
  { key: 'progress', label: 'In Progress', value: 3, sub: 'Being repaired', tone: 'purple', icon: 'wrench' },
  { key: 'resolved', label: 'Resolved', value: 5, sub: 'Completed repairs', tone: 'green', icon: 'check' },
] as const

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

export const reports: Report[] = [
  {
    id: 'REP-2025-0012',
    equipment: 'Computer Monitor',
    category: 'Computer',
    brandModel: 'Acer / V196HQL',
    serialNumber: 'MMT0AA001234',
    room: 'Computer Lab 1',
    building: 'Building A - 2nd Floor',
    location: 'Computer Lab 1',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'PENDING',
    priority: 'High',
    date: 'May 16, 2025',
    time: '09:15 AM',
    description: 'The monitor screen is not working. It has a broken and no display.',
    photos: [
      '/images/photos/monitor-1.jpg',
      '/images/photos/monitor-2.jpg',
      '/images/photos/monitor-3.jpg',
      '/images/photos/monitor-4.jpg',
    ],
  },
  {
    id: 'REP-2025-0011',
    equipment: 'Projector',
    category: 'Projector',
    brandModel: 'Epson / EB-X500',
    serialNumber: 'X500CN2211',
    room: 'AVR Room',
    building: 'Building B - Ground Floor',
    location: 'AVR Room',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'IN PROGRESS',
    priority: 'Medium',
    date: 'May 15, 2025',
    time: '02:30 PM',
    description: 'Projector powers on but the lamp flickers and the image loses colour after a few minutes.',
    photos: ['/images/photos/projector-1.jpg'],
  },
  {
    id: 'REP-2025-0010',
    equipment: 'Printer',
    category: 'Printer',
    brandModel: 'Canon / LBP226dw',
    serialNumber: 'CNLBP001098',
    room: 'Admin Office',
    building: 'Building A - Ground Floor',
    location: 'Admin Office',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'PENDING',
    priority: 'Low',
    date: 'May 15, 2025',
    time: '10:05 AM',
    description: 'Printer keeps jamming on the second tray whenever multiple pages are queued.',
    photos: ['/images/photos/printer-1.jpg'],
  },
  {
    id: 'REP-2025-0009',
    equipment: 'Electric Fan',
    category: 'Electric Fan',
    brandModel: 'Hanabishi / HFF12CR',
    serialNumber: 'HFF12CR0451',
    room: 'Room 304',
    building: 'Building C - 2nd Floor',
    location: 'Room 304',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'RESOLVED',
    priority: 'Medium',
    date: 'May 14, 2025',
    time: '11:45 AM',
    description: 'Fan motor makes a loud grinding noise and the oscillation stopped working.',
    photos: ['/images/photos/fan-1.jpg'],
  },
  {
    id: 'REP-2025-0008',
    equipment: 'Air Conditioner',
    category: 'Air Conditioner',
    brandModel: 'Carrier / CSR-L10',
    serialNumber: 'CSR-L10-8892',
    room: 'Faculty Room',
    building: 'Building D - 3rd Floor',
    location: 'Faculty Room',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'IN PROGRESS',
    priority: 'Critical',
    date: 'May 14, 2025',
    time: '08:20 AM',
    description: 'Unit is leaking water onto the ceiling panels and the compressor will not start.',
    photos: ['/images/photos/ac-1.jpg'],
  },
  {
    id: 'REP-2025-0007',
    equipment: 'Desktop Computer',
    category: 'Computer',
    brandModel: 'Dell / OptiPlex 3080',
    serialNumber: 'DOP3080-7731',
    room: 'Computer Lab 2',
    building: 'Building A - 3rd Floor',
    location: 'Computer Lab 2',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'RESOLVED',
    priority: 'High',
    date: 'May 12, 2025',
    time: '01:10 PM',
    description: 'Unit will not boot past the BIOS splash screen and shows a disk error message.',
    photos: [],
  },
  {
    id: 'REP-2025-0006',
    equipment: 'Microphone',
    category: 'Audio Equipment',
    brandModel: 'Shure / SM48',
    serialNumber: 'SM48-11223',
    room: 'AVR Room',
    building: 'Building B - Ground Floor',
    location: 'AVR Room',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'CANCELLED',
    priority: 'Low',
    date: 'May 11, 2025',
    time: '03:25 PM',
    description: 'Microphone cable was reported broken, later replaced by the AV club.',
    photos: [],
  },
  {
    id: 'REP-2025-0004',
    equipment: 'Laboratory Microscope',
    category: 'Science Equipment',
    brandModel: 'Olympus / CX23',
    serialNumber: 'CX23-44017',
    room: 'Room 305',
    building: 'Building C - 2nd Floor',
    location: 'Room 305',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'PENDING',
    priority: 'High',
    date: 'May 8, 2025',
    time: '01:35 PM',
    description: 'Objective lens is cracked and the focus knob no longer turns smoothly.',
    photos: [],
  },
  {
    id: 'REP-2025-0003',
    equipment: 'Office Chair',
    category: 'Furniture',
    brandModel: 'Eurochair / Executive',
    serialNumber: '—',
    room: 'Faculty Room',
    building: 'Building D - 3rd Floor',
    location: 'Faculty Room',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'IN PROGRESS',
    priority: 'Low',
    date: 'May 7, 2025',
    time: '09:05 AM',
    description: 'Hydraulic lift no longer holds its height and the base wobbles.',
    photos: [],
  },
  {
    id: 'REP-2025-0002',
    equipment: 'Extension Cord',
    category: 'Others',
    brandModel: 'Omni / 4-outlet',
    serialNumber: '—',
    room: 'Room 204',
    building: 'Building B - 2nd Floor',
    location: 'Room 204',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'RESOLVED',
    priority: 'Critical',
    date: 'May 5, 2025',
    time: '03:50 PM',
    description: 'Exposed wiring near the plug; replaced with a new unit during inspection.',
    photos: [],
  },
  {
    id: 'REP-2025-0001',
    equipment: 'Whiteboard',
    category: 'Furniture',
    brandModel: 'Standard / 6 ft',
    serialNumber: '—',
    room: 'AVR Room',
    building: 'Building B - Ground Floor',
    location: 'AVR Room',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'CANCELLED',
    priority: 'Low',
    date: 'May 3, 2025',
    time: '10:20 AM',
    description: 'Report filed twice; duplicate closed by the administrator.',
    photos: [],
  },
  {
    id: 'REP-2025-0005',
    equipment: 'Chalkboard',
    category: 'Furniture',
    brandModel: 'Standard / 4x6 ft',
    serialNumber: '—',
    room: 'Room 204',
    building: 'Building B - 2nd Floor',
    location: 'Room 204',
    reportedBy: 'Juan Dela Cruz',
    role: 'Instructor',
    status: 'RESOLVED',
    priority: 'Low',
    date: 'May 9, 2025',
    time: '09:40 AM',
    description: 'Lower frame of the chalkboard is loose and detaches from the wall.',
    photos: [],
  },
]

export const reportHistory = [
  { id: 1, date: 'May 16, 2025 · 09:15 AM', action: 'Report submitted by Juan Dela Cruz', actor: 'JD' },
  { id: 2, date: 'May 16, 2025 · 10:02 AM', action: 'Under review by Admin User', actor: 'AU' },
  { id: 3, date: 'May 16, 2025 · 10:30 AM', action: 'Status changed to Pending', actor: 'AU' },
]

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

export const buildingOptions = [
  'Building A - Ground Floor',
  'Building A - 2nd Floor',
  'Building A - 3rd Floor',
  'Building B - Ground Floor',
  'Building B - 2nd Floor',
  'Building C - 2nd Floor',
  'Building D - 3rd Floor',
]

export const damageTypeOptions = [
  'Not working / No power',
  'Broken or cracked part',
  'Intermittent / Flickering',
  'Cosmetic damage only',
  'Other',
]

/* ----------------------------- Admin ----------------------------- */

export const adminStats = [
  { label: 'Total Reports', value: 128, tone: 'blue', icon: 'files' },
  { label: 'Pending', value: 32, tone: 'orange', icon: 'clock' },
  { label: 'In Progress', value: 45, tone: 'purple', icon: 'wrench' },
  { label: 'Resolved', value: 51, tone: 'green', icon: 'check' },
  { label: 'Cancelled', value: 5, tone: 'slate', icon: 'x' },
] as const

export const reportsByStatus = [
  { name: 'Pending', value: 30, percent: '23%', color: '#F59E0B' },
  { name: 'In Progress', value: 45, percent: '35%', color: '#8B5CF6' },
  { name: 'Resolved', value: 51, percent: '40%', color: '#22C55E' },
  { name: 'Cancelled', value: 5, percent: '4%', color: '#94A3B8' },
]

export const reportsByPriority = [
  { name: 'Critical', value: 45, color: '#EF4444' },
  { name: 'High', value: 25, color: '#DC2626' },
  { name: 'Medium', value: 35, color: '#F97316' },
  { name: 'Low', value: 20, color: '#22C55E' },
]

export const recentAdminReports = [
  {
    id: 'REP-2025-0012',
    equipment: 'Computer Monitor',
    location: 'Computer Lab 1',
    reportedBy: 'Juan Dela Cruz',
    status: 'PENDING' as ReportStatus,
    priority: 'High' as Priority,
    date: 'May 16, 2025',
  },
  {
    id: 'REP-2025-0011',
    equipment: 'Projector',
    location: 'AVR Room',
    reportedBy: 'Maria Santos',
    status: 'IN PROGRESS' as ReportStatus,
    priority: 'Medium' as Priority,
    date: 'May 15, 2025',
  },
  {
    id: 'REP-2025-0010',
    equipment: 'Printer',
    location: 'Admin Office',
    reportedBy: 'Pedro Reyes',
    status: 'PENDING' as ReportStatus,
    priority: 'Low' as Priority,
    date: 'May 15, 2025',
  },
  {
    id: 'REP-2025-0000',
    equipment: 'Electric Fan',
    location: 'Room 304',
    reportedBy: 'Ana Villanueva',
    status: 'RESOLVED' as ReportStatus,
    priority: 'Medium' as Priority,
    date: 'May 14, 2025',
  },
  {
    id: 'REP-2025-0008',
    equipment: 'Air Conditioner',
    location: 'Faculty Room',
    reportedBy: 'Juan Dela Cruz',
    status: 'IN PROGRESS' as ReportStatus,
    priority: 'Critical' as Priority,
    date: 'May 14, 2025',
  },
]

/* --------------------------- Analytics --------------------------- */

export const analyticsStats = [
  { label: 'Reports Submitted', value: '28', delta: '+12% from last month', up: true },
  { label: 'Repairs Finished', value: '16', delta: '+25% from last month', up: true },
  { label: 'Avg. Resolution', unit: '(Days)', value: '12.5', delta: '-15% from last month', up: true },
  { label: 'Resolution Rate', value: '57%', delta: '+10% from last month', up: true },
]

export const reportsOverTime = [
  { date: 'May 1', submitted: 4, resolved: 2 },
  { date: 'May 8', submitted: 6, resolved: 3 },
  { date: 'May 16', submitted: 8, resolved: 5 },
  { date: 'May 22', submitted: 7, resolved: 6 },
  { date: 'May 29', submitted: 9, resolved: 8 },
]

export const reportsByCategory = [
  { name: 'Computer', value: 15, percent: '11.7%', color: '#2563EB' },
  { name: 'Projector', value: 22, percent: '17.2%', color: '#8B5CF6' },
  { name: 'Printer', value: 18, percent: '14.1%', color: '#F59E0B' },
  { name: 'Electric Fan', value: 15, percent: '11.7%', color: '#22C55E' },
  { name: 'Air Conditioner', value: 13, percent: '10.2%', color: '#EF4444' },
  { name: 'Others', value: 10, percent: '7.8%', color: '#94A3B8' },
]

export const topLocations = [
  { name: 'Computer Lab 1', value: 30 },
  { name: 'AVR Room', value: 22 },
  { name: 'Admin Office', value: 18 },
  { name: 'Room 204', value: 14 },
  { name: 'Faculty Room', value: 12 },
]

export const topEquipment = [
  { name: 'Computer', value: 48 },
  { name: 'Projector', value: 32 },
  { name: 'Printer', value: 18 },
  { name: 'Electric Fan', value: 15 },
  { name: 'Air Conditioner', value: 13 },
]

/* ------------------------ Equipment catalog ---------------------- */

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

export const equipmentList: EquipmentItem[] = [
  { id: 'EQP-1001', name: 'Computer Monitor', category: 'Computer', brand: 'Acer / V196HQL', room: 'Computer Lab 1', building: 'Building A - 2nd Floor', status: 'Needs Repair', lastServiced: 'Feb 12, 2025' },
  { id: 'EQP-1002', name: 'Desktop Computer', category: 'Computer', brand: 'Dell / OptiPlex 3080', room: 'Computer Lab 1', building: 'Building A - 2nd Floor', status: 'Working', lastServiced: 'Apr 03, 2025' },
  { id: 'EQP-1003', name: 'Projector', category: 'Projector', brand: 'Epson / EB-X500', room: 'AVR Room', building: 'Building B - Ground Floor', status: 'Under Maintenance', lastServiced: 'May 06, 2025' },
  { id: 'EQP-1004', name: 'Printer', category: 'Printer', brand: 'Canon / LBP226dw', room: 'Admin Office', building: 'Building A - Ground Floor', status: 'Needs Repair', lastServiced: 'Jan 28, 2025' },
  { id: 'EQP-1005', name: 'Electric Fan', category: 'Electric Fan', brand: 'Hanabishi / HFF12CR', room: 'Room 304', building: 'Building C - 2nd Floor', status: 'Working', lastServiced: 'Mar 19, 2025' },
  { id: 'EQP-1006', name: 'Air Conditioner', category: 'Air Conditioner', brand: 'Carrier / CSR-L10', room: 'Faculty Room', building: 'Building D - 3rd Floor', status: 'Under Maintenance', lastServiced: 'May 11, 2025' },
  { id: 'EQP-1007', name: 'Desktop Computer', category: 'Computer', brand: 'HP / ProDesk 400 G7', room: 'Computer Lab 2', building: 'Building A - 3rd Floor', status: 'Working', lastServiced: 'Apr 22, 2025' },
  { id: 'EQP-1008', name: 'Projector', category: 'Projector', brand: 'BenQ / MS550', room: 'Room 204', building: 'Building B - 2nd Floor', status: 'Working', lastServiced: 'Feb 27, 2025' },
  { id: 'EQP-1009', name: 'Printer', category: 'Printer', brand: 'Epson / L3110', room: "Registrar's Office", building: 'Building A - Ground Floor', status: 'Working', lastServiced: 'Mar 05, 2025' },
  { id: 'EQP-1010', name: 'Microphone', category: 'Audio Equipment', brand: 'Shure / SM48', room: 'AVR Room', building: 'Building B - Ground Floor', status: 'Needs Repair', lastServiced: 'Jan 15, 2025' },
  { id: 'EQP-1011', name: 'Laboratory Microscope', category: 'Science Equipment', brand: 'Olympus / CX23', room: 'Room 305', building: 'Building C - 2nd Floor', status: 'Working', lastServiced: 'Apr 09, 2025' },
  { id: 'EQP-1012', name: 'Office Chair', category: 'Furniture', brand: 'Eurochair / Executive', room: 'Faculty Room', building: 'Building D - 3rd Floor', status: 'Needs Repair', lastServiced: 'Dec 18, 2024' },
  { id: 'EQP-1013', name: 'Electric Fan', category: 'Electric Fan', brand: 'Camel / CF-40X', room: 'Room 204', building: 'Building B - 2nd Floor', status: 'Working', lastServiced: 'Mar 30, 2025' },
  { id: 'EQP-1014', name: 'Smart TV', category: 'Others', brand: 'TCL / 55P635', room: 'Conference Room', building: 'Building D - Ground Floor', status: 'Working', lastServiced: 'Feb 04, 2025' },
  { id: 'EQP-1015', name: 'Air Conditioner', category: 'Air Conditioner', brand: 'Koppel / KCS-20', room: 'Computer Lab 2', building: 'Building A - 3rd Floor', status: 'Under Maintenance', lastServiced: 'May 13, 2025' },
]

/* --------------------------- Notifications ----------------------- */

export type NotificationKind = 'resolved' | 'updated' | 'assigned' | 'comment' | 'reminder'

export interface NotificationItem {
  id: number
  kind: NotificationKind
  title: string
  message: string
  time: string
  read: boolean
}

export const notificationFeed: NotificationItem[] = [
  {
    id: 1,
    kind: 'updated',
    title: 'Report Status Updated',
    message: 'Your report for the Computer Monitor in Computer Lab 1 is now In Progress.',
    time: 'May 16, 2025 · 10:30 AM',
    read: false,
  },
  {
    id: 2,
    kind: 'assigned',
    title: 'Maintenance Assigned',
    message: 'Rey Manalo (IT Staff) was assigned to REP-2025-0011 — Projector, AVR Room.',
    time: 'May 16, 2025 · 09:48 AM',
    read: false,
  },
  {
    id: 3,
    kind: 'comment',
    title: 'New Comment on Your Report',
    message: 'Admin User: “Please upload a photo of the serial number so we can verify the warranty.”',
    time: 'May 15, 2025 · 04:12 PM',
    read: false,
  },
  {
    id: 4,
    kind: 'resolved',
    title: 'Report Resolved',
    message: 'REP-2025-0009 — Electric Fan in Room 304 has been repaired and closed.',
    time: 'May 15, 2025 · 02:05 PM',
    read: true,
  },
  {
    id: 5,
    kind: 'updated',
    title: 'Priority Raised to Critical',
    message: 'Your Air Conditioner report in the Faculty Room was escalated for immediate action.',
    time: 'May 14, 2025 · 08:40 AM',
    read: true,
  },
  {
    id: 6,
    kind: 'reminder',
    title: 'Awaiting Your Confirmation',
    message: 'Confirm that the repair on REP-2025-0005 (Chalkboard, Room 204) is satisfactory.',
    time: 'May 13, 2025 · 11:20 AM',
    read: true,
  },
  {
    id: 7,
    kind: 'resolved',
    title: 'Report Resolved',
    message: 'REP-2025-0002 — Extension Cord in Room 204 was replaced during inspection.',
    time: 'May 10, 2025 · 03:50 PM',
    read: true,
  },
]

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

export const announcementFeed: AnnouncementPost[] = [
  {
    id: 1,
    title: 'Maintenance Schedule for Computer Lab',
    body:
      'Computer Laboratory 1 (Building A, 2nd Floor) will be closed from May 20 to May 22, 2025 for air-conditioning servicing, cable rewiring and a full software re-image of all 42 units. Classes scheduled in the lab will be moved to Room 204. Please save your files to your network drive before May 19.',
    date: 'May 15, 2025',
    author: 'Admin User',
    category: 'Maintenance',
    pinned: true,
  },
  {
    id: 2,
    title: 'New Reporting Guidelines',
    body:
      'Starting this term, every damage report must include at least one clear photo of the affected unit and the serial number plate. Reports without a photo will be returned to the instructor for completion. Describe the fault in the order it happens so the maintenance team can reproduce the issue quickly.',
    date: 'May 10, 2025',
    author: 'Admin User',
    category: 'Guidelines',
  },
  {
    id: 3,
    title: 'Campus Care System Update',
    body:
      'The platform will be offline on Sunday, May 18, 2025 from 1:00 AM to 4:00 AM while the database is migrated to the new server. Reports submitted before the update are safe and will appear unchanged once the system is back online.',
    date: 'May 8, 2025',
    author: 'Admin User',
    category: 'System',
  },
  {
    id: 4,
    title: 'Campus-Wide Electrical Inspection',
    body:
      'Facilities staff will inspect all outlets and extension cords in Buildings B, C and D on May 24, 2025. Please remove personal appliances from classrooms before the inspection. Any unit found with exposed wiring will be tagged and taken out of service immediately.',
    date: 'May 6, 2025',
    author: 'Admin User',
    category: 'Maintenance',
  },
  {
    id: 5,
    title: 'Awarding of the Cleanest Laboratory',
    body:
      'The College of Computer Studies won this quarter’s Cleanest Laboratory award. Thanks to everyone who reported broken units early and kept the labs free of clutter. The award ceremony will be held during the general assembly on May 30, 2025.',
    date: 'May 2, 2025',
    author: 'Admin User',
    category: 'General',
  },
]

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

export const kbArticles: KBArticle[] = [
  {
    id: 1,
    category: 'Reporting Guidelines',
    title: 'How to submit a damage report',
    summary: 'The five details every report needs before the maintenance team can act on it.',
    body: [
      'Open Report Damage from the sidebar, choose the equipment name and category, then fill in the brand, serial number and the exact room where the unit is installed.',
      'Pick the damage type and priority, describe what happens and when, and attach at least one photo. Press Submit — you will receive a report number in the format REP-2025-XXXX that you can track in My Reports.',
    ],
    updated: 'May 15, 2025',
  },
  {
    id: 2,
    category: 'Reporting Guidelines',
    title: 'Choosing the right priority',
    summary: 'Critical, High, Medium or Low — what each level actually means.',
    body: [
      'Critical is for anything unsafe or completely unusable: sparking outlets, leaking air-conditioners, exposed wiring. High covers a unit that blocks a class from proceeding, such as a projector that will not power on.',
      'Medium is a fault with a workaround — a flickering monitor that still displays, or a printer jamming on one tray only. Low is cosmetic damage with no effect on use. Choosing honestly keeps the queue accurate for everyone.',
    ],
    updated: 'May 10, 2025',
  },
  {
    id: 3,
    category: 'Reporting Guidelines',
    title: 'What happens after you submit',
    summary: 'From Pending to Resolved, and who touches your report along the way.',
    body: [
      'Every new report lands in the admin queue, sorted by priority. The administrator reviews it, may ask for a clearer photo, then assigns a maintenance staff member and moves it to In Progress.',
      'You will see each step in the Report History timeline and receive a notification. Once the repair is done the report is marked Resolved; if the issue cannot be reproduced, it is returned to you with a note before being cancelled.',
    ],
    updated: 'May 8, 2025',
  },
  {
    id: 4,
    category: 'Common Equipment Issues',
    title: 'How to fix a flickering monitor',
    summary: 'Check the cable and refresh rate before filing a report.',
    body: [
      'Reseat both ends of the video cable and try a different port on the system unit. If the display flickers only when the cable is moved, the cable is the fault and the monitor itself is fine.',
      'On Windows, set the refresh rate to 60 Hz under Settings → System → Display → Advanced display. A flicker that persists across two cables and two ports is a failing backlight or inverter — report it as High priority with a short video if possible.',
    ],
    updated: 'May 12, 2025',
  },
  {
    id: 5,
    category: 'Common Equipment Issues',
    title: 'Projector shows “No Signal”',
    summary: 'The usual causes, in the order worth checking them.',
    body: [
      'Confirm the correct input source with the Source button on the remote — most rooms switch between HDMI-1 and VGA. Then check that the laptop is actually sending a signal: press Windows + P and choose Duplicate.',
      'If the lamp is on but the image is dark, the unit may be in Eco mode or the lamp is near end of life. Do not open the projector housing; log a report and note the lamp hours shown in the menu.',
    ],
    updated: 'May 5, 2025',
  },
  {
    id: 6,
    category: 'Common Equipment Issues',
    title: 'Air-conditioner is leaking water',
    summary: 'Why it drips and what to do while you wait for the technician.',
    body: [
      'A clogged drain line is the most common cause. Switch the unit off at the breaker, place a bucket under the drip and keep the area clear so nobody slips. Do not tilt the indoor unit.',
      'Report it as Critical: water reaching ceiling panels or outlets is an electrical hazard. Include the room, the unit number on the sticker and a photo of the drip path.',
    ],
    updated: 'May 11, 2025',
  },
  {
    id: 7,
    category: 'IT Support',
    title: 'Reset your Campus Care password',
    summary: 'Self-service steps for instructors and staff accounts.',
    body: [
      'Open Help & Support and submit a ticket with the subject “Password reset”. Include your employee number and the email attached to your account — never send your current password.',
      'IT releases a one-time link valid for 30 minutes. Passwords must be at least eight characters and include a number; the system will not accept a password used in the last three resets.',
    ],
    updated: 'May 14, 2025',
  },
  {
    id: 8,
    category: 'IT Support',
    title: 'Connecting to the campus Wi-Fi',
    summary: 'MABINI-FACULTY network, credentials and common errors.',
    body: [
      'Join MABINI-FACULTY and sign in with your employee number as the username and your portal password. Accept the certificate prompt; the network uses a private CA, so the warning is expected on first connection.',
      'If the device loops back to the sign-in page, forget the network and reconnect, or disable “private Wi-Fi address” for this network on iOS. Laboratory desktops are already configured and need no setup.',
    ],
    updated: 'Apr 29, 2025',
  },
  {
    id: 9,
    category: 'IT Support',
    title: 'Uploading photos that fail',
    summary: 'File size, format and network limits on the report form.',
    body: [
      'The form accepts JPG, PNG and HEIC up to 5 MB per photo, maximum four photos per report. Phone photos straight from the camera are often larger than that — resize or screenshot them first.',
      'Uploads also fail on a weak connection. Move closer to an access point, wait for the spinner to finish before pressing Submit, and retry once. If it still fails, submit the text report and mention that the photo is pending.',
    ],
    updated: 'May 9, 2025',
  },
]

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
