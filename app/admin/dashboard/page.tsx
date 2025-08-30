"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bell,
  Calendar,
  Edit,
  Eye,
  LogOut,
  MapPin,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Users,
  Menu,
  Filter,
  BarChart3,
  Home,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { storage, type RepairRequest } from "@/lib/storage"
import { Notification } from "@/components/notification"

export default function AdminDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<RepairRequest | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "info", message: "" })

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated() || !auth.isAdmin()) {
      router.push("/")
      return
    }

    // Load requests
    setRequests(storage.getRequests())
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
            รอมอบหมาย
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
          <Badge variant="destructive" className="text-xs">
            สูง
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
            ปานกลาง
          </Badge>
        )
      case "low":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
            ต่ำ
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            ไม่ระบุ
          </Badge>
        )
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reporter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress" || r.status === "assigned").length,
    completed: requests.filter((r) => r.status === "completed").length,
  }

  const handleDeleteRequest = (id: string) => {
    if (confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      storage.deleteRequest(id)
      setRequests(storage.getRequests())
      showNotification("success", "ลบรายการสำเร็จ")
    }
  }

  const handleUpdateStatus = (id: string, status: RepairRequest["status"], assignedTo?: string) => {
    const updates: Partial<RepairRequest> = { status }
    if (assignedTo) updates.assignedTo = assignedTo
    if (status === "completed") updates.completedDate = new Date().toISOString().split("T")[0]

    storage.updateRequest(id, updates)
    setRequests(storage.getRequests())
    showNotification("success", "อัปเดตสถานะสำเร็จ")
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
            <p className="text-sm text-gray-600">ผู้ดูแลระบบ</p>
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
            <span className="text-sm font-medium text-blue-800">รายการทั้งหมด</span>
          </div>
          <p className="text-xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">รอมอบหมาย</span>
          </div>
          <p className="text-xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">กำลังดำเนินการ</span>
          </div>
          <p className="text-xl font-bold text-purple-900">{stats.inProgress}</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-green-600" />
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
              placeholder="ค้นหาครุภัณฑ์ รหัส หรือผู้แจ้ง..."
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
              <SelectItem value="pending">รอมอบหมาย</SelectItem>
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
          <h3 className="font-semibold text-gray-900">การจัดการ</h3>
        </div>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setShowAddForm(true)
              setShowMobileFilters(false)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มรายการแจ้งซ่อม
          </Button>
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
            ดูรายงานสถิติ
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => showNotification("info", "ฟีเจอร์การจัดการผู้ใช้กำลังพัฒนา")}
          >
            <Users className="w-4 h-4 mr-2" />
            จัดการผู้ใช้งาน
          </Button>
        </div>
      </div>

      {/* Priority Requests */}
      {requests.filter((r) => r.priority === "high" && r.status !== "completed").length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">รายการด่วน</h3>
          </div>
          <div className="space-y-2">
            {requests
              .filter((r) => r.priority === "high" && r.status !== "completed")
              .slice(0, 3)
              .map((request) => (
                <div key={request.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800">{request.equipmentName}</p>
                  <p className="text-xs text-red-600">
                    {request.location.building} {request.location.room}
                  </p>
                  <p className="text-xs text-red-600">ผู้แจ้ง: {request.reporter}</p>
                  <div className="mt-2 flex gap-1">
                    {getStatusBadge(request.status)}
                    {getPriorityBadge(request.priority)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">กิจกรรมล่าสุด</h3>
        </div>
        <div className="space-y-2">
          {requests
            .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
            .slice(0, 3)
            .map((request) => (
              <div key={request.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">{request.equipmentName}</p>
                <p className="text-xs text-blue-600">แจ้งเมื่อ: {request.reportDate}</p>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
            ))}
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
                    <SheetDescription className="text-orange-700">ตัวกรอง ค้นหา และการจัดการระบบ</SheetDescription>
                  </SheetHeader>
                  <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <MobileFilters />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">ระบบจัดการแจ้งซ่อมครุภัณฑ์</p>
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
                  Admin
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
              <CardTitle className="text-xs sm:text-sm font-medium">รายการทั้งหมด</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">รายการ</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">รอมอบหมาย</CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">รายการ</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">กำลังดำเนินการ</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">รายการ</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">เสร็จสิ้น</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">รายการ</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="hidden sm:flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ค้นหาครุภัณฑ์ รหัส หรือผู้แจ้ง..."
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
                <SelectItem value="pending">รอมอบหมาย</SelectItem>
                <SelectItem value="assigned">มอบหมายแล้ว</SelectItem>
                <SelectItem value="in-progress">กำลังซ่อม</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm">เพิ่มรายการแจ้งซ่อม</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>เพิ่มรายการแจ้งซ่อมใหม่</DialogTitle>
                  <DialogDescription>กรอกข้อมูลครุภัณฑ์และรายละเอียดการซ่อม</DialogDescription>
                </DialogHeader>
                <AddRepairForm
                  onClose={() => setShowAddForm(false)}
                  onSuccess={() => {
                    setRequests(storage.getRequests())
                    showNotification("success", "เพิ่มรายการสำเร็จ")
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={() => router.push("/map")}
              className="bg-white/95 backdrop-blur-sm border-gray-200"
            >
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">ดูแผนผัง</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              รายการแจ้งซ่อมทั้งหมด
            </CardTitle>
            <CardDescription>จัดการและติดตามสถานะการซ่อมบำรุงครุภัณฑ์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">รหัส</TableHead>
                    <TableHead className="text-xs sm:text-sm">ครุภัณฑ์</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs sm:text-sm">สถานที่</TableHead>
                    <TableHead className="hidden md:table-cell text-xs sm:text-sm">ผู้แจ้ง</TableHead>
                    <TableHead className="hidden lg:table-cell text-xs sm:text-sm">วันที่แจ้ง</TableHead>
                    <TableHead className="text-xs sm:text-sm">ความสำคัญ</TableHead>
                    <TableHead className="text-xs sm:text-sm">สถานะ</TableHead>
                    <TableHead className="hidden xl:table-cell text-xs sm:text-sm">ช่างที่รับผิดชอบ</TableHead>
                    <TableHead className="text-xs sm:text-sm">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-xs sm:text-sm">{request.id}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <div className="font-medium line-clamp-1">{request.equipmentName}</div>
                          <div className="text-xs text-gray-500">{request.equipmentCode}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">
                            {request.location.building} {request.location.floor} {request.location.room}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">{request.reporter}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{request.reportDate}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs sm:text-sm">
                        {request.assignedTo || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>รายละเอียดงานซ่อม #{request.id}</DialogTitle>
                              </DialogHeader>
                              <ViewRequestDialog request={request} onUpdateStatus={handleUpdateStatus} />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditingRequest(request)}
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบรายการแจ้งซ่อม</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all" ? "ไม่มีรายการที่ตรงกับเงื่อนไขการค้นหา" : "ยังไม่มีรายการแจ้งซ่อมในระบบ"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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

function AddRepairForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    equipmentName: "",
    equipmentCode: "",
    building: "",
    floor: "",
    room: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    reporter: "",
    assignedTo: "",
  })

  const handleSubmit = () => {
    if (!formData.equipmentName || !formData.equipmentCode || !formData.description || !formData.reporter) {
      alert("กรุณากรอกข้อมูลที่จำเป็น")
      return
    }

    const newRequest: RepairRequest = {
      id: storage.generateId(),
      equipmentName: formData.equipmentName,
      equipmentCode: formData.equipmentCode,
      location: {
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
      },
      description: formData.description,
      priority: formData.priority,
      reporter: formData.reporter,
      assignedTo: formData.assignedTo || undefined,
      status: formData.assignedTo ? "assigned" : "pending",
      reportDate: new Date().toISOString().split("T")[0],
    }

    storage.addRequest(newRequest)
    onSuccess()
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equipmentName">ชื่อครุภัณฑ์ *</Label>
          <Input
            id="equipmentName"
            placeholder="เช่น เครื่องปรับอากาศ"
            value={formData.equipmentName}
            onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="equipmentCode">รหัสครุภัณฑ์ *</Label>
          <Input
            id="equipmentCode"
            placeholder="เช่น EQ-001"
            value={formData.equipmentCode}
            onChange={(e) => setFormData({ ...formData, equipmentCode: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="building">อาคาร</Label>
          <Input
            id="building"
            placeholder="เช่น ตึก LC"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="floor">ชั้น</Label>
          <Input
            id="floor"
            placeholder="เช่น ชั้น 2"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="room">ห้อง</Label>
          <Input
            id="room"
            placeholder="เช่น LC207"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">รายละเอียดปัญหา *</Label>
        <Textarea
          id="description"
          placeholder="อธิบายปัญหาที่พบ..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priority">ความสำคัญ</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">สูง</SelectItem>
              <SelectItem value="medium">ปานกลาง</SelectItem>
              <SelectItem value="low">ต่ำ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="reporter">ผู้แจ้ง *</Label>
          <Input
            id="reporter"
            placeholder="ชื่อผู้แจ้ง"
            value={formData.reporter}
            onChange={(e) => setFormData({ ...formData, reporter: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="assignTo">มอบหมายให้ช่าง</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกช่าง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ไม่มอบหมาย</SelectItem>
              <SelectItem value="ช่างสมชาย">ช่างสมชาย</SelectItem>
              <SelectItem value="ช่างสมหญิง">ช่างสมหญิง</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="order-2 sm:order-1 bg-transparent">
          ยกเลิก
        </Button>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 order-1 sm:order-2"
          onClick={handleSubmit}
        >
          บันทึก
        </Button>
      </div>
    </div>
  )
}

function ViewRequestDialog({
  request,
  onUpdateStatus,
}: {
  request: RepairRequest
  onUpdateStatus: (id: string, status: RepairRequest["status"], assignedTo?: string) => void
}) {
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || "none")

  const handleStatusUpdate = (status: RepairRequest["status"]) => {
    onUpdateStatus(request.id, status, assignedTo === "none" ? undefined : assignedTo)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">ครุภัณฑ์</Label>
          <p className="text-sm font-semibold">{request.equipmentName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">รหัส</Label>
          <p className="text-sm font-semibold">{request.equipmentCode}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">สถานที่</Label>
          <p className="text-sm">
            {request.location.building} {request.location.floor} {request.location.room}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">ผู้แจ้ง</Label>
          <p className="text-sm">{request.reporter}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">รายละเอียดปัญหา</Label>
        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700">{request.description}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">มอบหมายให้ช่าง</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกช่าง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">ไม่มอบหมาย</SelectItem>
            <SelectItem value="ช่างสมชาย">ช่างสมชาย</SelectItem>
            <SelectItem value="ช่างสมหญิง">ช่างสมหญิง</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">อัปเดตสถานะ</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("assigned")}
            disabled={assignedTo === "none"}
            className="bg-transparent"
          >
            มอบหมายงาน
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("in-progress")}
            className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
          >
            กำลังซ่อม
          </Button>
          <Button
            size="sm"
            onClick={() => handleStatusUpdate("completed")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            เสร็จสิ้น
          </Button>
        </div>
      </div>
    </div>
  )
}
