"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, Settings, Wrench, Loader2 } from "lucide-react"
import { auth } from "@/lib/auth"
import { Notification } from "@/components/notification"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    type: "success" | "error" | "info"
    message: string
  }>({ show: false, type: "info", message: "" })

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ show: true, type, message })
  }

  const handleLogin = async () => {
    if (!userType || !username || !password) {
      showNotification("error", "กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsLoading(true)

    try {
      // จำลองการ login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = auth.login(username, password)

      if (user) {
        if (user.type !== userType) {
          showNotification("error", "ประเภทผู้ใช้งานไม่ถูกต้อง")
          setIsLoading(false)
          return
        }

        showNotification("success", `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${user.name}`)

        // Redirect based on user type
        setTimeout(() => {
          if (user.type === "admin") {
            router.push("/admin/dashboard")
          } else if (user.type === "technician") {
            router.push("/technician/dashboard")
          }
        }, 1500)
      } else {
        showNotification("error", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      }
    } catch (error) {
      showNotification("error", "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">ระบบแจ้งซ่อมครุภัณฑ์</CardTitle>
            <CardDescription className="text-gray-600">Equipment Repair Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userType" className="text-sm font-medium text-gray-700">
                ประเภทผู้ใช้งาน
              </Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500">
                  <SelectValue placeholder="เลือกประเภทผู้ใช้งาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">ผู้ดูแลระบบ</div>
                        <div className="text-xs text-gray-500">Admin</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="technician">
                    <div className="flex items-center gap-3 py-1">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">ช่างซ่อม</div>
                        <div className="text-xs text-gray-500">Technician</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                รหัสผ่าน
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 pr-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleLogin}
              disabled={!userType || !username || !password || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mt-6">
                <p className="font-medium mb-3 text-gray-700">ข้อมูลทดสอบ:</p>
                <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600">Admin:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">admin / admin123</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-600">Technician:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">tech1 / tech123</span>
                  </div>
                </div>
              </div>
            </div>
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
