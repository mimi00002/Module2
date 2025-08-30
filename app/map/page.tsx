"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  MapPin,
  Monitor,
  Snowflake,
  Wrench,
  Zap,
  Plus,
  Edit,
  Users,
  Wifi,
  Settings,
  User,
  LogOut,
  Menu,
  Building,
  BarChart3,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { storage, type RepairRequest } from "@/lib/storage"
import { Notification } from "@/components/notification"

interface Equipment {
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

// LC207 Equipment Data - 50 computers arranged in left-right layout
const lc207Equipment: Equipment[] = [
  // Left side - Row 1 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    name: `คอมพิวเตอร์ ${String(i + 1).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 1).padStart(2, "0")}`,
    type: "computer" as const,
    status: i === 1 ? ("repair" as const) : ("working" as const),
    position: { x: 15 + i * 5, y: 25 },
    tableNumber: i + 1,
    side: "left" as const,
    row: 1,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
    needsRepair: i === 1,
    repairDescription: i === 1 ? "จอไม่แสดงผล" : undefined,
  })),

  // Left side - Row 2 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 6}`,
    name: `คอมพิวเตอร์ ${String(i + 6).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 6).padStart(2, "0")}`,
    type: "computer" as const,
    status: i === 2 ? ("maintenance" as const) : ("working" as const),
    position: { x: 15 + i * 5, y: 35 },
    tableNumber: i + 6,
    side: "left" as const,
    row: 2,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Left side - Row 3 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 11}`,
    name: `คอมพิวเตอร์ ${String(i + 11).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 11).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5, y: 45 },
    tableNumber: i + 11,
    side: "left" as const,
    row: 3,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Left side - Row 4 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 16}`,
    name: `คอมพิวเตอร์ ${String(i + 16).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 16).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5, y: 55 },
    tableNumber: i + 16,
    side: "left" as const,
    row: 4,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Left side - Row 5 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 21}`,
    name: `คอมพิวเตอร์ ${String(i + 21).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 21).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5, y: 65 },
    tableNumber: i + 21,
    side: "left" as const,
    row: 5,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Right side - Row 1 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 26}`,
    name: `คอมพิวเตอร์ ${String(i + 26).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 26).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 55 + i * 5, y: 25 },
    tableNumber: i + 26,
    side: "right" as const,
    row: 1,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Right side - Row 2 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 31}`,
    name: `คอมพิวเตอร์ ${String(i + 31).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 31).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 55 + i * 5, y: 35 },
    tableNumber: i + 31,
    side: "right" as const,
    row: 2,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Right side - Row 3 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 36}`,
    name: `คอมพิวเตอร์ ${String(i + 36).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 36).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 55 + i * 5, y: 45 },
    tableNumber: i + 36,
    side: "right" as const,
    row: 3,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Right side - Row 4 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 41}`,
    name: `คอมพิวเตอร์ ${String(i + 41).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 41).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 55 + i * 5, y: 55 },
    tableNumber: i + 41,
    side: "right" as const,
    row: 4,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Right side - Row 5 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 46}`,
    name: `คอมพิวเตอร์ ${String(i + 46).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 46).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 55 + i * 5, y: 65 },
    tableNumber: i + 46,
    side: "right" as const,
    row: 5,
    seat: i + 1,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  })),

  // Other equipment
  {
    id: "51",
    name: "โปรเจคเตอร์",
    code: "PJ-LC207-01",
    type: "projector",
    status: "working",
    position: { x: 45, y: 10 },
    tableNumber: 0,
    side: "left",
    row: 0,
    seat: 0,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  },
  {
    id: "53",
    name: "Router",
    code: "RT-LC207-01",
    type: "router",
    status: "working",
    position: { x: 85, y: 50 },
    tableNumber: 0,
    side: "right",
    row: 0,
    seat: 0,
    room: "LC207",
    building: "ตึก LC",
    floor: "ชั้น 2",
  },
]

export default function MapPage() {
  const router = useRouter()
  const [selectedBuilding, setSelectedBuilding] = useState("lc")
  const [selectedFloor, setSelectedFloor] = useState("floor-2")
  const [selectedRoom, setSelectedRoom] = useState("lc207")
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false)
  const [showAddRepairDialog, setShowAddRepairDialog] = useState(false)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "info", message: "" })

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated()) {
      router.push("/")
      return
    }
  }, [router])

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ show: true, type, message })
  }

  const handleLogout = () => {
    auth.logout()
    showNotification("success", "ออกจากระบบสำเร็จ")
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  const goToDashboard = () => {
    if (auth.isAdmin()) {
      router.push("/admin/dashboard")
    } else {
      router.push("/technician/dashboard")
    }
  }

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "computer":
        return <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
      case "ac":
        return <Snowflake className="w-3 h-3 sm:w-4 sm:h-4" />
      case "projector":
        return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
      case "router":
        return <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
      case "electrical":
        return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
      default:
        return <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-green-500 hover:bg-green-600 shadow-green-200"
      case "repair":
        return "bg-red-500 hover:bg-red-600 shadow-red-200"
      case "maintenance":
        return "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200"
      default:
        return "bg-gray-500 hover:bg-gray-600 shadow-gray-200"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-100 text-green-800 border-green-200">ใช้งานได้</Badge>
      case "repair":
        return <Badge className="bg-red-100 text-red-800 border-red-200">ต้องซ่อม</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">บำรุงรักษา</Badge>
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
    }
  }

  const getTablePosition = (equipment: Equipment) => {
    if (equipment.tableNumber === 0) return "อุปกรณ์พิเศษ"
    return `โต๊ะที่ ${equipment.tableNumber} (ฝั่ง${equipment.side === "left" ? "ซ้าย" : "ขวา"} แถว ${equipment.row})`
  }

  const handleCreateRepairRequest = (
    equipment: Equipment,
    description: string,
    priority: "low" | "medium" | "high",
  ) => {
    const newRequest: RepairRequest = {
      id: storage.generateId(),
      equipmentName: equipment.name,
      equipmentCode: equipment.code,
      location: {
        building: equipment.building,
        floor: equipment.floor,
        room: equipment.room,
      },
      description,
      priority,
      reporter: currentUser?.name || "ผู้ดูแลระบบ",
      status: "pending",
      reportDate: new Date().toISOString().split("T")[0],
    }

    storage.addRequest(newRequest)
    showNotification("success", "สร้างรายการแจ้งซ่อมสำเร็จ")
    setShowAddRepairDialog(false)
  }

  // Mobile Controls Component
  const MobileControls = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">อาคาร</label>
        <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lc">ตึก LC</SelectItem>
            <SelectItem value="ud">ตึก UD</SelectItem>
            <SelectItem value="building-a">อาคาร A</SelectItem>
            <SelectItem value="building-b">อาคาร B</SelectItem>
            <SelectItem value="building-c">อาคาร C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">ชั้น</label>
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="floor-1">ชั้น 1</SelectItem>
            <SelectItem value="floor-2">ชั้น 2</SelectItem>
            <SelectItem value="floor-3">ชั้น 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">ห้อง</label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lc204">ห้อง LC204</SelectItem>
            <SelectItem value="lc205">ห้อง LC205</SelectItem>
            <SelectItem value="lc207">ห้อง LC207</SelectItem>
            <SelectItem value="room-a201">ห้อง A201</SelectItem>
            <SelectItem value="room-a202">ห้อง A202</SelectItem>
            <SelectItem value="room-a203">ห้อง A203</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin Actions */}
      {auth.isAdmin() && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">การจัดการ</h4>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => {
                setShowAddRepairDialog(true)
                setShowMobileControls(false)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้างรายการซ่อม
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => showNotification("info", "ฟีเจอร์นี้กำลังพัฒนา")}
            >
              <Edit className="w-4 h-4 mr-2" />
              จัดการครุภัณฑ์
            </Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-3">สัญลักษณ์</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">ใช้งานได้</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">ต้องซ่อม</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">บำรุงรักษา</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={goToDashboard} className="hidden sm:flex">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ Dashboard
              </Button>

              {/* Mobile Menu */}
              <Sheet open={showMobileControls} onOpenChange={setShowMobileControls}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="sm:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-orange-600" />
                      เลือกตำแหน่ง
                    </SheetTitle>
                    <SheetDescription>เลือกอาคาร ชั้น และห้องที่ต้องการดู</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <MobileControls />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">แผนผังครุภัณฑ์</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">ระบุตำแหน่งครุภัณฑ์ในอาคาร</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{currentUser?.name}</span>
                <Badge variant="outline" className="text-xs">
                  {auth.isAdmin() ? "Admin" : "Technician"}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">ออกจากระบบ</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Desktop Controls */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-600" />
                  เลือกตำแหน่ง
                </CardTitle>
                <CardDescription>เลือกอาคาร ชั้น และห้องที่ต้องการดู</CardDescription>
              </CardHeader>
              <CardContent>
                <MobileControls />
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      แผนผังห้อง LC207
                    </CardTitle>
                    <CardDescription className="mt-1">ห้องคอมพิวเตอร์ - คลิกที่จุดครุภัณฑ์เพื่อดูรายละเอียด</CardDescription>
                  </div>

                  {/* Mobile Quick Stats */}
                  <div className="flex gap-2 sm:hidden">
                    <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {lc207Equipment.filter((eq) => eq.status === "working").length}
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {lc207Equipment.filter((eq) => eq.status === "repair").length}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner"
                  style={{ height: "400px", minHeight: "400px" }}
                >
                  {/* Room Layout */}
                  <div className="absolute inset-2 sm:inset-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                    {/* Door */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 sm:w-20 h-2 sm:h-3 bg-gray-300 rounded-t-md">
                      <div className="text-xs text-center text-gray-600 mt-0.5 hidden sm:block">ประตู</div>
                    </div>

                    {/* Room Label */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <h3 className="text-sm sm:text-xl font-bold text-gray-700">ห้อง LC207</h3>
                      <p className="text-xs sm:text-sm text-gray-500">ห้องคอมพิวเตอร์ (50 เครื่อง)</p>
                    </div>

                    {/* Teacher's Desk */}
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-12 sm:w-16 h-6 sm:h-8 bg-amber-200 rounded border border-amber-400">
                      <div className="text-xs text-center text-amber-800 mt-1 hidden sm:block">โต๊ะอาจารย์</div>
                    </div>

                    {/* Whiteboard */}
                    <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-20 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded border border-gray-400">
                      <div className="text-xs text-center text-gray-600 mt-0.5 hidden sm:block">กระดานไวท์บอร์ด</div>
                    </div>

                    {/* Side Labels - Hidden on mobile */}
                    <div className="hidden sm:block absolute top-20 left-8 text-sm font-medium text-blue-600 transform -rotate-90 origin-center">
                      ฝั่งซ้าย
                    </div>
                    <div className="hidden sm:block absolute top-20 right-8 text-sm font-medium text-green-600 transform rotate-90 origin-center">
                      ฝั่งขวา
                    </div>

                    {/* Center Aisle */}
                    <div className="absolute left-1/2 top-16 sm:top-20 bottom-8 sm:bottom-10 w-0.5 sm:w-1 bg-gray-300 transform -translate-x-1/2">
                      <div className="hidden sm:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500 bg-white px-2 py-1 rounded whitespace-nowrap">
                        ทางเดิน
                      </div>
                    </div>

                    {/* Equipment Points */}
                    {lc207Equipment.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={`absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer ${getStatusColor(equipment.status)}`}
                        style={{
                          left: `${equipment.position.x}%`,
                          top: `${equipment.position.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={`${equipment.name} (${equipment.code}) - โต๊ะที่ ${equipment.tableNumber}`}
                        onClick={() => {
                          setSelectedEquipment(equipment)
                          setShowEquipmentDialog(true)
                        }}
                      >
                        {equipment.type === "computer" ? (
                          <span className="text-xs font-bold">
                            {equipment.tableNumber > 0 ? equipment.tableNumber : ""}
                          </span>
                        ) : (
                          getEquipmentIcon(equipment.type)
                        )}
                      </div>
                    ))}

                    {/* Desk Outlines - Simplified for mobile */}
                    <div className="absolute" style={{ left: "10%", top: "20%", width: "30%", height: "50%" }}>
                      <div className="w-full h-full border-2 border-dashed border-blue-300 rounded bg-blue-50 opacity-30">
                        <div className="hidden sm:block text-xs text-center text-blue-600 mt-20">ฝั่งซ้าย (โต๊ะ 1-25)</div>
                      </div>
                    </div>

                    <div className="absolute" style={{ left: "50%", top: "20%", width: "30%", height: "50%" }}>
                      <div className="w-full h-full border-2 border-dashed border-green-300 rounded bg-green-50 opacity-30">
                        <div className="hidden sm:block text-xs text-center text-green-600 mt-20">
                          ฝั่งขวา (โต๊ะ 26-50)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Summary */}
                <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Room Statistics */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      สถิติห้อง LC207
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">ครุภัณฑ์ทั้งหมด:</span>
                        <span className="text-sm font-medium">{lc207Equipment.length} รายการ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">คอมพิวเตอร์:</span>
                        <span className="text-sm font-medium">50 เครื่อง</span>
                      </div>
                      <div className="hidden sm:block">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">ฝั่งซ้าย:</span>
                          <span className="text-sm font-medium">25 เครื่อง (โต๊ะ 1-25)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-700">ฝั่งขวา:</span>
                          <span className="text-sm font-medium">25 เครื่อง (โต๊ะ 26-50)</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">ใช้งานได้:</span>
                        <span className="text-sm font-medium text-green-600">
                          {lc207Equipment.filter((eq) => eq.status === "working").length} รายการ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">ต้องซ่อม:</span>
                        <span className="text-sm font-medium text-red-600">
                          {lc207Equipment.filter((eq) => eq.status === "repair").length} รายการ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions for Admin */}
                  {auth.isAdmin() && (
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        การจัดการด่วน
                      </h4>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
                          onClick={() => setShowAddRepairDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          สร้างรายการแจ้งซ่อม
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
                          onClick={() => showNotification("info", "ฟีเจอร์การจัดการครุภัณฑ์กำลังพัฒนา")}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          จัดการครุภัณฑ์
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
                          onClick={() => showNotification("info", "ฟีเจอร์รายงานกำลังพัฒนา")}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          ดูรายงาน
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Equipment Detail Dialog */}
      <Dialog open={showEquipmentDialog} onOpenChange={setShowEquipmentDialog}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEquipment && getEquipmentIcon(selectedEquipment.type)}
              รายละเอียดครุภัณฑ์
            </DialogTitle>
            <DialogDescription>ข้อมูลและสถานะของครุภัณฑ์</DialogDescription>
          </DialogHeader>

          {selectedEquipment && (
            <EquipmentDetailContent
              equipment={selectedEquipment}
              onCreateRepair={() => {
                setShowEquipmentDialog(false)
                setShowAddRepairDialog(true)
              }}
              isAdmin={auth.isAdmin()}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Repair Request Dialog */}
      <Dialog open={showAddRepairDialog} onOpenChange={setShowAddRepairDialog}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>สร้างรายการแจ้งซ่อม</DialogTitle>
            <DialogDescription>
              {selectedEquipment ? `สร้างรายการแจ้งซ่อมสำหรับ ${selectedEquipment.name}` : "สร้างรายการแจ้งซ่อมใหม่"}
            </DialogDescription>
          </DialogHeader>

          <AddRepairRequestForm
            equipment={selectedEquipment}
            onSubmit={handleCreateRepairRequest}
            onCancel={() => setShowAddRepairDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  )
}

function EquipmentDetailContent({
  equipment,
  onCreateRepair,
  isAdmin,
}: {
  equipment: Equipment
  onCreateRepair: () => void
  isAdmin: boolean
}) {
  const getEquipmentTypeName = (type: string) => {
    switch (type) {
      case "computer":
        return "คอมพิวเตอร์"
      case "ac":
        return "เครื่องปรับอากาศ"
      case "projector":
        return "โปรเจคเตอร์"
      case "router":
        return "Router"
      case "electrical":
        return "ระบบไฟฟ้า"
      default:
        return "ครุภัณฑ์"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-100 text-green-800 border-green-200">ใช้งานได้</Badge>
      case "repair":
        return <Badge className="bg-red-100 text-red-800 border-red-200">ต้องซ่อม</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">บำรุงรักษา</Badge>
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
    }
  }

  const getTablePosition = (equipment: Equipment) => {
    if (equipment.tableNumber === 0) return "อุปกรณ์พิเศษ"
    return `โต๊ะที่ ${equipment.tableNumber} (ฝั่ง${equipment.side === "left" ? "ซ้าย" : "ขวา"} แถว ${equipment.row} ที่นั่ง ${equipment.seat})`
  }

  return (
    <div className="space-y-4">
      {/* Equipment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-600">ชื่อครุภัณฑ์</Label>
          <p className="text-sm font-semibold">{equipment.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600">รหัส</Label>
          <p className="text-sm font-semibold">{equipment.code}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600">ประเภท</Label>
          <p className="text-sm">{getEquipmentTypeName(equipment.type)}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-600">ห้อง</Label>
          <p className="text-sm">{equipment.room}</p>
        </div>
      </div>

      {/* Table Position */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <Label className="text-sm font-medium text-blue-800">ตำแหน่งโต๊ะ</Label>
        <p className="text-sm font-semibold text-blue-700">{getTablePosition(equipment)}</p>
        {equipment.tableNumber > 0 && (
          <div className="mt-2 text-xs text-blue-600 space-y-1">
            <div>• ฝั่ง: {equipment.side === "left" ? "ซ้าย" : "ขวา"}</div>
            <div>• แถวที่: {equipment.row}</div>
            <div>• ที่นั่งที่: {equipment.seat}</div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <Label className="text-sm font-medium text-gray-600 mb-2 block">สถานะปัจจุบัน</Label>
        <div className="flex items-center gap-2">{getStatusBadge(equipment.status)}</div>
      </div>

      {/* Repair Description */}
      {equipment.repairDescription && (
        <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
          <Label className="text-sm font-medium text-red-800">รายละเอียดปัญหา</Label>
          <p className="text-sm text-red-700 mt-1">{equipment.repairDescription}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {isAdmin && (
          <Button
            size="sm"
            onClick={onCreateRepair}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            สร้างรายการซ่อม
          </Button>
        )}
      </div>
    </div>
  )
}

function AddRepairRequestForm({
  equipment,
  onSubmit,
  onCancel,
}: {
  equipment: Equipment | null
  onSubmit: (equipment: Equipment, description: string, priority: "low" | "medium" | "high") => void
  onCancel: () => void
}) {
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  const handleSubmit = () => {
    if (!equipment || !description.trim()) {
      alert("กรุณากรอกรายละเอียดปัญหา")
      return
    }

    onSubmit(equipment, description, priority)
    setDescription("")
    setPriority("medium")
  }

  if (!equipment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">กรุณาเลือกครุภัณฑ์ก่อนสร้างรายการแจ้งซ่อม</p>
        <Button variant="outline" onClick={onCancel} className="mt-4 bg-transparent">
          ปิด
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Equipment Info */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-800 mb-2">ครุภัณฑ์ที่เลือก</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ชื่อ:</span>
            <span className="ml-2 font-medium">{equipment.name}</span>
          </div>
          <div>
            <span className="text-gray-600">รหัส:</span>
            <span className="ml-2 font-medium">{equipment.code}</span>
          </div>
          <div>
            <span className="text-gray-600">ตำแหน่ง:</span>
            <span className="ml-2 font-medium">
              {equipment.building} {equipment.floor} {equipment.room}
            </span>
          </div>
          <div>
            <span className="text-gray-600">โต๊ะที่:</span>
            <span className="ml-2 font-medium">{equipment.tableNumber > 0 ? equipment.tableNumber : "อุปกรณ์พิเศษ"}</span>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div>
        <Label htmlFor="description">รายละเอียดปัญหา *</Label>
        <Textarea
          id="description"
          placeholder="อธิบายปัญหาที่พบ..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="priority">ความสำคัญ</Label>
        <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                สูง - ต้องแก้ไขด่วน
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                ปานกลาง - แก้ไขตามลำดับ
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ต่ำ - ไม่เร่งด่วน
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="order-2 sm:order-1 bg-transparent">
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 order-1 sm:order-2"
        >
          สร้างรายการแจ้งซ่อม
        </Button>
      </div>
    </div>
  )
}
