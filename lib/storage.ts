// จำลองฐานข้อมูลด้วย localStorage
export interface User {
  id: string
  username: string
  password: string
  type: "admin" | "technician"
  name: string
}

export interface RepairRequest {
  id: string
  equipmentCode: string
  equipmentName: string
  location: {
    building: string
    floor: string
    room: string
  }
  status: "pending" | "assigned" | "in-progress" | "completed"
  description: string
  reporter: string
  assignedTo?: string
  reportDate: string
  priority: "low" | "medium" | "high"
  images?: string[]
  completedDate?: string
  notes?: string
}

export interface Equipment {
  id: string
  name: string
  code: string
  type: "computer" | "ac" | "projector" | "electrical" | "router"
  status: "working" | "repair" | "maintenance"
  position: { x: number; y: number }
  tableNumber: number
  side: "left" | "right"
  row: number
  seat: number
  room: string
  building: string
  floor: string
  needsRepair?: boolean
  repairDescription?: string
}

// Default data
const defaultUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    type: "admin",
    name: "ผู้ดูแลระบบ",
  },
  {
    id: "2",
    username: "tech1",
    password: "tech123",
    type: "technician",
    name: "ช่างสมชาย",
  },
  {
    id: "3",
    username: "tech2",
    password: "tech123",
    type: "technician",
    name: "ช่างสมหญิง",
  },
]

const defaultRequests: RepairRequest[] = [
  {
    id: "R001",
    equipmentCode: "PC-LC207-02",
    equipmentName: "คอมพิวเตอร์ 02",
    location: { building: "ตึก LC", floor: "ชั้น 2", room: "ห้อง LC207" },
    status: "pending",
    description: "จอคอมพิวเตอร์ไม่แสดงผล มีไฟสีน้ำเงินกระพริบ",
    reporter: "อาจารย์สมชาย",
    reportDate: "2024-01-15",
    priority: "high",
  },
  {
    id: "R002",
    equipmentCode: "PJ-LC207-01",
    equipmentName: "โปรเจคเตอร์",
    location: { building: "ตึก LC", floor: "ชั้น 2", room: "ห้อง LC207" },
    status: "assigned",
    description: "โปรเจคเตอร์ไม่สามารถแสดงภาพได้",
    reporter: "อาจารย์สมหญิง",
    assignedTo: "ช่างสมชาย",
    reportDate: "2024-01-14",
    priority: "medium",
  },
  {
    id: "R003",
    equipmentCode: "PC-LC207-08",
    equipmentName: "คอมพิวเตอร์ 08",
    location: { building: "ตึก LC", floor: "ชั้น 2", room: "ห้อง LC207" },
    status: "completed",
    description: "คอมพิวเตอร์เปิดไม่ติด",
    reporter: "นักศึกษาสมศรี",
    assignedTo: "ช่างสมหญิง",
    reportDate: "2024-01-13",
    completedDate: "2024-01-14",
    priority: "low",
  },
]

// Storage functions
export const storage = {
  // Users
  getUsers: (): User[] => {
    if (typeof window === "undefined") return defaultUsers
    const users = localStorage.getItem("users")
    return users ? JSON.parse(users) : defaultUsers
  },

  setUsers: (users: User[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("users", JSON.stringify(users))
    }
  },

  // Current user
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
      } else {
        localStorage.removeItem("currentUser")
      }
    }
  },

  // Repair requests
  getRequests: (): RepairRequest[] => {
    if (typeof window === "undefined") return defaultRequests
    const requests = localStorage.getItem("repairRequests")
    return requests ? JSON.parse(requests) : defaultRequests
  },

  setRequests: (requests: RepairRequest[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("repairRequests", JSON.stringify(requests))
    }
  },

  addRequest: (request: RepairRequest) => {
    const requests = storage.getRequests()
    requests.push(request)
    storage.setRequests(requests)
  },

  updateRequest: (id: string, updates: Partial<RepairRequest>) => {
    const requests = storage.getRequests()
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      storage.setRequests(requests)
    }
  },

  deleteRequest: (id: string) => {
    const requests = storage.getRequests()
    const filtered = requests.filter((r) => r.id !== id)
    storage.setRequests(filtered)
  },

  // Generate ID
  generateId: (prefix = "R"): string => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `${prefix}${timestamp}${random}`
  },
}

// Initialize default data
if (typeof window !== "undefined") {
  if (!localStorage.getItem("users")) {
    storage.setUsers(defaultUsers)
  }
  if (!localStorage.getItem("repairRequests")) {
    storage.setRequests(defaultRequests)
  }
}
