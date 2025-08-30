"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bell,
  Camera,
  CheckCircle,
  Clock,
  Eye,
  LogOut,
  MapPin,
  Search,
  Upload,
  User,
  Wrench,
  Navigation,
  Menu,
  Package,
  Filter,
  Home,
  Settings,
  BarChart3,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { storage, type RepairRequest } from "@/lib/storage"
import { Notification } from "@/components/notification"

export default function TechnicianDashboard() {
  const router = useRouter()
  const [tasks, setTasks] = useState<RepairRequest[]>([])
  const [selectedTask, setSelectedTask] = useState<RepairRequest | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(undefined) // เปลี่ยนเป็น undefined

  const [notification, setNotification] = useState<{
    show: boolean
    type: "info" | "success" | "error"
    message: string
  }>({
    show: false,
    type: "info",
    message: "",
  })

  useEffect(() => {
    // โหลดข้อมูล user และ tasks เฉพาะฝั่ง client
    const user = auth.getCurrentUser()
    setCurrentUser(user)

    if (!auth.isAuthenticated() || !auth.isTechnician()) {
      router.push("/")
      return
    }

    const allRequests = storage.getRequests()
    const technicianTasks = allRequests.filter(
      (request) => request.assignedTo === user?.name || request.status === "pending",
    )
    setTasks(technicianTasks)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            รอดำเนินการ
          </Badge>
        )
      case "assigned":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            มอบหมายแล้ว
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            กำลังซ่อม
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            เสร็จสิ้น
          </Badge>
        )
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-700 font-medium">สูง</span>
          </div>
        )
      case "medium":
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-yellow-700 font-medium">ปานกลาง</span>
          </div>
        )
      case "low":
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700 font-medium">ต่ำ</span>
          </div>
        )
      default:
        return <span className="text-xs text-gray-500">ไม่ระบุ</span>
    }
  }

  const updateTaskStatus = (taskId: string, newStatus: RepairRequest["status"], notes?: string) => {
    const updates: Partial<RepairRequest> = {
      status: newStatus,
      assignedTo: currentUser?.name,
    }

    if (notes) updates.notes = notes
    if (newStatus === "completed") updates.completedDate = new Date().toISOString().split("T")[0]

    storage.updateRequest(taskId, updates)

    // Refresh tasks
    const allRequests = storage.getRequests()
    const technicianTasks = allRequests.filter(
      (request) => request.assignedTo === currentUser?.name || request.status === "pending",
    )
    setTasks(technicianTasks)

    showNotification("success", "อัปเดตสถานะสำเร็จ")
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${task.location.building} ${task.location.floor} ${task.location.room}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    assigned: tasks.filter((t) => t.status === "assigned").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  // Enhanced Mobile Filters Component
  const MobileFilters = () => (
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
            onClick={() => router.push("/")}
            className="flex-1 bg-white/80 border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Home className="w-4 h-4 mr-2" />
            หน้าหลัก
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">งานทั้งหมด</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">รอดำเนินการ</span>
          </div>
          <p className="text-xl font-bold text-yellow-900">{stats.pending + stats.assigned}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">กำลังซ่อม</span>
          </div>
          <p className="text-xl font-bold text-purple-900">{stats.inProgress}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">เสร็จสิ้น</span>
          </div>
          <p className="text-xl font-bold text-green-900">{stats.completed}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">ค้นหาและกรอง</h3>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">ค้นหา</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ค้นหาครุภัณฑ์ รหัส หรือสถานที่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium mb-2 block">กรองตามสถานะ</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
              <SelectItem value="in-progress">กำลังซ่อม</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">การดำเนินการด่วน</h3>
        </div>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => router.push("/map")}
          >
            <MapPin className="w-4 h-4 mr-2" />
            ดูแผนผังครุภัณฑ์
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => showNotification("info", "ฟีเจอร์รายงานกำลังพัฒนา")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            ดูรายงานการซ่อม
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => showNotification("info", "ฟีเจอร์ปฏิทินกำลังพัฒนา")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            ปฏิทินงานซ่อม
          </Button>
        </div>
      </div>

      {/* Priority Tasks */}
      {tasks.filter((t) => t.priority === "high" && t.status !== "completed").length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">งานด่วน</h3>
          </div>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.priority === "high" && t.status !== "completed")
              .slice(0, 3)
              .map((task) => (
                <div key={task.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">{task.equipmentName}</p>
                  <p className="text-xs text-red-600">
                    {task.location.building} {task.location.room}
                  </p>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setSelectedTask(task)
                        setShowMobileFilters(false)
                      }}
                    >
                      ดูรายละเอียด
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )

  // เพิ่ม loading state
  if (typeof currentUser === "undefined") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Enhanced Mobile Menu */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="sm:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                    <SheetTitle className="flex items-center gap-2 text-orange-900">
                      <Filter className="w-5 h-5 text-orange-600" />
                      เมนูควบคุม
                    </SheetTitle>
                    <SheetDescription className="text-orange-700">ตัวกรอง ค้นหา และการดำเนินการด่วน</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <MobileFilters />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">ช่างซ่อม Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">ระบบจัดการงานซ่อมบำรุง</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">{currentUser?.name}</span>
                <Badge variant="outline" className="text-xs">
                  Technician
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">งานทั้งหมด</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">รายการ</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">รอดำเนินการ</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending + stats.assigned}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">งาน</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">กำลังซ่อม</CardTitle>
              <Wrench className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">งาน</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">เสร็จสิ้น</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">งาน</p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ค้นหาครุภัณฑ์ รหัส หรือสถานที่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/95 backdrop-blur-sm border-gray-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white/95 backdrop-blur-sm border-gray-200">
              <SelectValue placeholder="กรองตามสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
              <SelectItem value="in-progress">กำลังซ่อม</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Task Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-lg transition-all duration-200 border-0 bg-white/95 backdrop-blur-sm group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg line-clamp-1">{task.equipmentName}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                      รหัส: {task.equipmentCode}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {task.location.building} {task.location.floor} {task.location.room}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>แจ้งเมื่อ: {task.reportDate}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{task.description}</p>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-white/95 backdrop-blur-sm border-gray-200"
                        onClick={() => setSelectedTask(task)}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">รายละเอียด</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden mx-auto w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] lg:w-full bg-white rounded-2xl shadow-2xl border-0">
                      <DialogTitle className="sr-only">รายละเอียดงานซ่อม</DialogTitle>
                      {selectedTask && (
                        <TaskDetailModal
                          task={selectedTask}
                          onUpdateStatus={updateTaskStatus}
                          currentUser={currentUser}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {(task.status === "assigned" || task.status === "pending") && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                      onClick={() => updateTaskStatus(task.id, "in-progress")}
                    >
                      <Wrench className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="text-xs sm:text-sm hidden sm:inline">เริ่มซ่อม</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบงานซ่อม</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" ? "ไม่มีงานซ่อมที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีงานซ่อมที่มอบหมายให้คุณ"}
            </p>
          </div>
        )}
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  )
}

function TaskDetailModal({
  task,
  onUpdateStatus,
  currentUser,
}: {
  task: RepairRequest
  onUpdateStatus: (taskId: string, status: RepairRequest["status"], notes?: string) => void
  currentUser: any
}) {
  const [notes, setNotes] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleStatusUpdate = (status: RepairRequest["status"]) => {
    onUpdateStatus(task.id, status, notes)
    setNotes("")
  }

  const openRoomMap = () => {
    window.open(`/technician/room-map/${task.id}`, "_blank")
  }

  return (
    <div className="flex flex-col h-full max-h-[95vh] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">รายละเอียดงานซ่อม #{task.id}</h2>
            <p className="text-sm text-gray-600">ข้อมูลครุภัณฑ์และการซ่อมบำรุง</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Equipment Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            รายละเอียดครุภัณฑ์
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">ชื่อครุภัณฑ์</Label>
              <p className="text-base font-semibold text-gray-900">{task.equipmentName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">รหัสครุภัณฑ์</Label>
              <p className="text-base font-semibold text-gray-900">{task.equipmentCode}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">สถานที่</Label>
              <p className="text-base text-gray-700">
                {task.location.building} {task.location.floor} {task.location.room}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-600">ผู้แจ้ง</Label>
              <p className="text-base text-gray-700">{task.reporter}</p>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">รายละเอียดปัญหา</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-base text-gray-700 leading-relaxed">{task.description}</p>
          </div>
        </div>

        {/* Location Map */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">ตำแหน่งครุภัณฑ์</h3>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-blue-900">
                {task.location.building} {task.location.floor} {task.location.room}
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-4">ดูตำแหน่งที่แน่นอนของครุภัณฑ์ในห้อง</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              onClick={openRoomMap}
            >
              <Navigation className="w-4 h-4 mr-2" />
              ดูแผนผังห้อง
            </Button>
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัปเดตสถานะงาน</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
              onClick={() => handleStatusUpdate("in-progress")}
            >
              <Wrench className="w-4 h-4 mr-2" />
              เริ่มซ่อม
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
              onClick={() => handleStatusUpdate("completed")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              ซ่อมเสร็จแล้ว
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">หมายเหตุ</Label>
            <Textarea
              placeholder="เพิ่มหมายเหตุการซ่อม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">อัปโหลดภาพหลักฐาน</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-base text-gray-600 mb-3">คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวาง</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                asChild
                className="cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-transparent"
              >
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  เลือกไฟล์
                </span>
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-3 text-sm text-green-600 font-medium">เลือกไฟล์แล้ว: {selectedFiles.length} ไฟล์</div>
            )}
          </div>
        </div>

        {/* Previous Notes */}
        {task.notes && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">หมายเหตุก่อนหน้า</h3>
            <p className="text-base text-gray-700 leading-relaxed">{task.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
