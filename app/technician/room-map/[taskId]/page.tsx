"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  ArrowLeft,
  MapPin,
  Monitor,
  Snowflake,
  Wrench,
  Zap,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Menu,
  Building,
  BarChart3,
  Target,
  Home,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { EquipmentDialog } from "./equipment-dialog"
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
  needsRepair?: boolean
  repairDescription?: string
}

// LC207 Equipment Data - ปรับตำแหน่งฝั่งขวาให้อยู่ตรงกลางกรอบ
const lc207Equipment: Equipment[] = [
  // Left side - Row 1 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 1}`,
    name: `คอมพิวเตอร์ ${String(i + 1).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 1).padStart(2, "0")}`,
    type: "computer" as const,
    status: i === 1 ? ("repair" as const) : ("working" as const),
    position: { x: 15 + i * 5.5, y: 30 },
    tableNumber: i + 1,
    side: "left" as const,
    row: 1,
    seat: i + 1,
    room: "LC207",
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
    position: { x: 15 + i * 5.5, y: 40 },
    tableNumber: i + 6,
    side: "left" as const,
    row: 2,
    seat: i + 1,
    room: "LC207",
  })),

  // Left side - Row 3 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 11}`,
    name: `คอมพิวเตอร์ ${String(i + 11).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 11).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5.5, y: 50 },
    tableNumber: i + 11,
    side: "left" as const,
    row: 3,
    seat: i + 1,
    room: "LC207",
  })),

  // Left side - Row 4 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 16}`,
    name: `คอมพิวเตอร์ ${String(i + 16).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 16).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5.5, y: 60 },
    tableNumber: i + 16,
    side: "left" as const,
    row: 4,
    seat: i + 1,
    room: "LC207",
  })),

  // Left side - Row 5 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 21}`,
    name: `คอมพิวเตอร์ ${String(i + 21).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 21).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 15 + i * 5.5, y: 70 },
    tableNumber: i + 21,
    side: "left" as const,
    row: 5,
    seat: i + 1,
    room: "LC207",
  })),

  // Right side - Row 1 (5 computers) - ปรับให้อยู่ตรงกลางกรอบขวา
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 26}`,
    name: `คอมพิวเตอร์ ${String(i + 26).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 26).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 65 + i * 5.5, y: 30 }, // ปรับจาก 60 เป็น 62 ให้อยู่ตรงกลางกรอบมากขึ้น
    tableNumber: i + 26,
    side: "right" as const,
    row: 1,
    seat: i + 1,
    room: "LC207",
  })),

  // Right side - Row 2 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 31}`,
    name: `คอมพิวเตอร์ ${String(i + 31).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 31).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 65 + i * 5.5, y: 40 },
    tableNumber: i + 31,
    side: "right" as const,
    row: 2,
    seat: i + 1,
    room: "LC207",
  })),

  // Right side - Row 3 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 36}`,
    name: `คอมพิวเตอร์ ${String(i + 36).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 36).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 65 + i * 5.5, y: 50 },
    tableNumber: i + 36,
    side: "right" as const,
    row: 3,
    seat: i + 1,
    room: "LC207",
  })),

  // Right side - Row 4 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 41}`,
    name: `คอมพิวเตอร์ ${String(i + 41).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 41).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 65 + i * 5.5, y: 60 },
    tableNumber: i + 41,
    side: "right" as const,
    row: 4,
    seat: i + 1,
    room: "LC207",
  })),

  // Right side - Row 5 (5 computers)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `${i + 46}`,
    name: `คอมพิวเตอร์ ${String(i + 46).padStart(2, "0")}`,
    code: `PC-LC207-${String(i + 46).padStart(2, "0")}`,
    type: "computer" as const,
    status: "working" as const,
    position: { x: 65 + i * 5.5, y: 70 },
    tableNumber: i + 46,
    side: "right" as const,
    row: 5,
    seat: i + 1,
    room: "LC207",
  })),

  // Other equipment
  {
    id: "51",
    name: "โปรเจคเตอร์",
    code: "PJ-LC207-01",
    type: "projector",
    status: "working",
    position: { x: 50, y: 18 },
    tableNumber: 0,
    side: "left",
    row: 0,
    seat: 0,
    room: "LC207",
  },

]

export default function RoomMapPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = React.use(params)
  const taskId = resolvedParams.taskId

  const router = useRouter()
  const [selectedBuilding, setSelectedBuilding] = useState("lc")
  const [selectedFloor, setSelectedFloor] = useState("floor-2")
  const [selectedRoom, setSelectedRoom] = useState("lc207")
  const [targetEquipment, setTargetEquipment] = useState<Equipment | null>(null)
  const [task, setTask] = useState<RepairRequest | null>(null)
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "info", message: "" })

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated() || !auth.isTechnician()) {
      router.push("/")
      return
    }

    // Load task data
    const requests = storage.getRequests()
    const foundTask = requests.find((r) => r.id === taskId)

    if (foundTask) {
      setTask(foundTask)
      // Find the equipment that needs repair
      const equipment = lc207Equipment.find((eq) => eq.code === foundTask.equipmentCode)
      if (equipment) {
        setTargetEquipment(equipment)
      }
    } else {
      showNotification("error", "ไม่พบข้อมูลงานซ่อม")
      setTimeout(() => router.push("/technician/dashboard"), 2000)
    }
  }, [taskId, router])

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

  const getStatusColor = (equipment: Equipment) => {
    if (equipment.code === task?.equipmentCode) {
      return "bg-red-500 hover:bg-red-600 ring-4 ring-red-200 animate-pulse shadow-lg shadow-red-200"
    }
    switch (equipment.status) {
      case "working":
        return "bg-green-500 hover:bg-green-600 shadow-md shadow-green-200"
      case "repair":
        return "bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
      case "maintenance":
        return "bg-yellow-500 hover:bg-yellow-600 shadow-md shadow-yellow-200"
      default:
        return "bg-gray-500 hover:bg-gray-600 shadow-md shadow-gray-200"
    }
  }

  const updateEquipmentStatus = (equipmentId: string, newStatus: "working" | "repair" | "maintenance") => {
    if (task && equipmentId === targetEquipment?.id) {
      // Update task status
      const taskStatus = newStatus === "working" ? "completed" : "in-progress"
      storage.updateRequest(task.id, {
        status: taskStatus,
        assignedTo: currentUser?.name,
        completedDate: newStatus === "working" ? new Date().toISOString().split("T")[0] : undefined,
      })

      showNotification("success", `อัปเดตสถานะ${newStatus === "working" ? "เสร็จสิ้น" : "กำลังซ่อม"}สำเร็จ`)
    }
    setShowEquipmentDialog(false)
  }

  const getTablePosition = (equipment: Equipment) => {
    if (equipment.tableNumber === 0) return "อุปกรณ์พิเศษ"
    return `โต๊ะที่ ${equipment.tableNumber} (ฝั่ง${equipment.side === "left" ? "ซ้าย" : "ขวา"} แถว ${equipment.row})`
  }

  // Enhanced Mobile Controls Component
  const MobileControls = () => (
    <div className="space-y-6">
      {/* User Info Section */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{currentUser?.name}</p>
            <p className="text-sm text-gray-600">ช่างซ่อมบำรุง</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/technician/dashboard")}
            className="flex-1 bg-white/80 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="bg-white/80 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Location Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">เลือกตำแหน่ง</h3>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">อาคาร</label>
          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lc">ตึก LC</SelectItem>
              <SelectItem value="ud">ตึก UD</SelectItem>
              <SelectItem value="building-a">อาคาร A</SelectItem>
              <SelectItem value="building-b">อาคาร B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">ชั้น</label>
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="floor-1">ชั้น 1</SelectItem>
              <SelectItem value="floor-2">ชั้น 2</SelectItem>
              <SelectItem value="floor-3">ชั้น 3</SelectItem>
              <SelectItem value="floor-4">ชั้น 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-gray-700">ห้อง</label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lc204">ห้อง LC204</SelectItem>
              <SelectItem value="lc205">ห้อง LC205</SelectItem>
              <SelectItem value="lc207">ห้อง LC207</SelectItem>
              <SelectItem value="lc208">ห้อง LC208</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Info Section */}
      {task && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">งานซ่อมปัจจุบัน</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-700 font-medium">รหัส:</span>
              <span className="ml-2 text-blue-900">#{task.id}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">ครุภัณฑ์:</span>
              <span className="ml-2 text-blue-900">{task.equipmentName}</span>
            </div>
            {targetEquipment && (
              <div>
                <span className="text-blue-700 font-medium">ตำแหน่ง:</span>
                <span className="ml-2 text-blue-900 font-semibold">🎯 โต๊ะที่ {targetEquipment.tableNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">สัญลักษณ์</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="w-4 h-4 bg-red-500 rounded-full ring-2 ring-red-200 animate-pulse"></div>
            <span className="text-sm font-medium text-red-700">ต้องซ่อม</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">ใช้งานได้</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-700">บำรุงรักษา</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">ไม่ทราบสถานะ</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          การดำเนินการด่วน
        </h3>
        {targetEquipment && (
          <Button
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            onClick={() => {
              setSelectedEquipment(targetEquipment)
              setShowEquipmentDialog(true)
              setShowMobileControls(false)
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            เริ่มงานซ่อม {targetEquipment.name}
          </Button>
        )}
      </div>
    </div>
  )

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/technician/dashboard")}
                className="hidden sm:flex hover:bg-orange-50 text-orange-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ Dashboard
              </Button>

              {/* Enhanced Mobile Menu */}
              <Sheet open={showMobileControls} onOpenChange={setShowMobileControls}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="sm:hidden hover:bg-orange-50 text-orange-700 relative">
                    <Menu className="w-5 h-5" />
                    {task && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                    <SheetTitle className="flex items-center gap-2 text-orange-900">
                      <Navigation className="w-5 h-5 text-orange-600" />
                      เมนูควบคุม
                    </SheetTitle>
                    <SheetDescription className="text-orange-700">ควบคุมและจัดการแผนผังห้อง</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <MobileControls />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">แผนผังห้อง - งานซ่อม #{task.id}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">ตำแหน่งครุภัณฑ์ที่ต้องซ่อม</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                <Target className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">ต้องซ่อม</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Task Info & Controls */}
          <div className="lg:col-span-1">
            {/* Task Information */}
            <Card className="mb-4 sm:mb-6 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  ข้อมูลงานซ่อม
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">ครุภัณฑ์</label>
                  <p className="text-sm font-semibold">{task.equipmentName}</p>
                  <p className="text-xs text-gray-500">{task.equipmentCode}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">สถานที่</label>
                  <p className="text-sm">
                    {task.location.building} {task.location.floor} {task.location.room}
                  </p>
                </div>
                {targetEquipment && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">ตำแหน่งโต๊ะ</label>
                    <p className="text-sm font-semibold text-red-600">🎯 {getTablePosition(targetEquipment)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">ปัญหา</label>
                  <p className="text-sm text-gray-700 line-clamp-2">{task.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ผู้แจ้ง</label>
                  <p className="text-sm">{task.reporter}</p>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Location Controls */}
            <Card className="hidden lg:block shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-orange-600" />
                  เลือกตำแหน่ง
                </CardTitle>
                <CardDescription>เลือกอาคาร ชั้น และห้องที่ต้องการดู</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">อาคาร</label>
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lc">ตึก LC</SelectItem>
                      <SelectItem value="ud">ตึก UD</SelectItem>
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
                    </SelectContent>
                  </Select>
                </div>

                {/* Desktop Legend */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">สัญลักษณ์</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full ring-2 ring-red-200 animate-pulse"></div>
                      <span className="text-sm font-medium text-red-700">ครุภัณฑ์ที่ต้องซ่อม</span>
                    </div>
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
              </CardContent>
            </Card>
          </div>

          {/* Room Map */}
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
                  {targetEquipment && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        เป้าหมาย: {targetEquipment.name}
                      </p>
                      <p className="text-xs text-gray-500">โต๊ะที่ {targetEquipment.tableNumber}</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div
                  className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner"
                  style={{ height: "500px", minHeight: "500px" }}
                >
                  {/* Room Layout */}
                  <div className="absolute inset-3 sm:inset-4 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                    {/* Door */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 sm:w-24 h-3 sm:h-4 bg-gray-300 rounded-t-md">
                      <div className="text-xs text-center text-gray-600 mt-0.5 hidden sm:block">ประตู</div>
                    </div>

                    {/* Room Label */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <h3 className="text-sm sm:text-xl font-bold text-gray-700">ห้อง LC207</h3>
                      <p className="text-xs sm:text-sm text-gray-500">ห้องคอมพิวเตอร์ (50 เครื่อง)</p>
                    </div>

                    {/* Teacher's Desk */}
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-16 sm:w-20 h-8 sm:h-10 bg-amber-200 rounded border border-amber-400 shadow-sm">
                      <div className="text-xs text-center text-amber-800 mt-1 sm:mt-2 hidden sm:block">โต๊ะอาจารย์</div>
                    </div>

                    {/* Whiteboard */}
                    <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-40 h-4 sm:h-6 bg-gray-200 rounded border border-gray-400 shadow-sm">
                      <div className="text-xs text-center text-gray-600 mt-1 hidden sm:block">กระดานไวท์บอร์ด</div>
                    </div>

                    {/* Side Labels - Hidden on mobile */}
                    <div className="hidden sm:block absolute top-24 left-6 text-sm font-medium text-blue-600 transform -rotate-90 origin-center">
                      ฝั่งซ้าย
                    </div>
                    <div className="hidden sm:block absolute top-24 right-6 text-sm font-medium text-green-600 transform rotate-90 origin-center">
                      ฝั่งขวา
                    </div>

                    {/* Center Aisle */}
                    <div className="absolute left-1/2 top-20 sm:top-24 bottom-12 sm:bottom-16 w-1 sm:w-2 bg-gray-300 transform -translate-x-1/2 rounded-full">
                      <div className="hidden sm:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                        ทางเดิน
                      </div>
                    </div>

                    {/* Equipment Points */}
                    {lc207Equipment.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={`absolute w-6 h-6 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${getStatusColor(equipment)} border-2 border-white`}
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
                          <span className="text-xs sm:text-sm font-bold">
                            {equipment.tableNumber > 0 ? equipment.tableNumber : ""}
                          </span>
                        ) : (
                          getEquipmentIcon(equipment.type)
                        )}
                        {equipment.code === task?.equipmentCode && (
                          <div className="absolute -top-6 sm:-top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-1 sm:px-2 py-1 rounded-full text-xs whitespace-nowrap shadow-lg animate-bounce">
                            🎯 ต้องซ่อม
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Desk Outlines - ปรับให้สอดคล้องกับตำแหน่งครุภัณฑ์ */}

                    
                    <div className="absolute" style={{ left: "10%", top: "25%", width: "32%", height: "50%" }}>
                      <div className="w-full h-full border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 opacity-40 shadow-inner">
                        <div className="hidden sm:block text-xs text-center text-blue-600 mt-20 font-medium">
                          
                        </div>
                      </div>
                    </div>
                    
                 
                    <div className="absolute" style={{ left: "60%", top: "25%", width: "32%", height: "50%" }}>
                      <div className="w-full h-full border-2 border-dashed border-green-300 rounded-lg bg-green-50 opacity-40 shadow-inner">
                        <div className="hidden sm:block text-xs text-center text-green-600 mt-20 font-medium">
                         
                        </div>
                      </div>
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-5">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`h-${i}`}
                          className="absolute w-full h-px bg-gray-400"
                          style={{ top: `${(i + 1) * 12}%` }}
                        />
                      ))}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={`v-${i}`}
                          className="absolute h-full w-px bg-gray-400"
                          style={{ left: `${(i + 1) * 12}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Equipment Summary */}
                <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Target Equipment Info */}
                  {targetEquipment && (
                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        ครุภัณฑ์ที่ต้องซ่อม
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-red-700">ชื่อ:</span>
                          <span className="text-sm font-medium">{targetEquipment.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-700">รหัส:</span>
                          <span className="text-sm font-medium">{targetEquipment.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-700">ตำแหน่ง:</span>
                          <span className="text-sm font-medium">{getTablePosition(targetEquipment)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <Button
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 shadow-md"
                          onClick={() => {
                            setSelectedEquipment(targetEquipment)
                            setShowEquipmentDialog(true)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          เริ่มงานซ่อม
                        </Button>
                      </div>
                    </div>
                  )}

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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Equipment Dialog */}
      <EquipmentDialog
        equipment={selectedEquipment}
        isOpen={showEquipmentDialog}
        onClose={() => setShowEquipmentDialog(false)}
        onStatusUpdate={updateEquipmentStatus}
        isTargetEquipment={selectedEquipment?.code === task?.equipmentCode}
      />

      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  )
}
