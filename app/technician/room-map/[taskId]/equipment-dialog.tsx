"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Monitor, Snowflake, Wifi, Wrench, Zap } from "lucide-react"

interface Equipment {
  id: string
  name: string
  code: string
  type: "computer" | "ac" | "projector" | "electrical" |"router"
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

interface EquipmentDialogProps {
  equipment: Equipment | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (equipmentId: string, newStatus: "working" | "repair" | "maintenance") => void
  isTargetEquipment?: boolean
}

export function EquipmentDialog({
  equipment,
  isOpen,
  onClose,
  onStatusUpdate,
  isTargetEquipment = false,
}: EquipmentDialogProps) {
  if (!equipment) return null

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "computer":
        return <Monitor className="w-5 h-5" />
      case "ac":
        return <Snowflake className="w-5 h-5" />
      case "projector":
        return <Zap className="w-5 h-5" />
      case "router":
        return <Wifi className="w-5 h-5" />
      case "electrical":
        return <Zap className="w-5 h-5" />
      default:
        return <Wrench className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-100 text-green-800">ใช้งานได้</Badge>
      case "repair":
        return <Badge className="bg-red-100 text-red-800">ต้องซ่อม</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">บำรุงรักษา</Badge>
      default:
        return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>
    }
  }

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

  const getTablePosition = (equipment: Equipment) => {
    if (equipment.tableNumber === 0) return "อุปกรณ์พิเศษ"
    return `โต๊ะที่ ${equipment.tableNumber} (ฝั่ง${equipment.side === "left" ? "ซ้าย" : "ขวา"} แถว ${equipment.row} ที่นั่ง ${equipment.seat})`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEquipmentIcon(equipment.type)}
            รายละเอียดครุภัณฑ์
            {isTargetEquipment && (
              <Badge variant="destructive" className="ml-2">
                🎯 เป้าหมาย
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>ข้อมูลและสถานะของครุภัณฑ์</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Equipment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">ชื่อครุภัณฑ์</label>
              <p className="text-sm font-semibold">{equipment.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">รหัส</label>
              <p className="text-sm font-semibold">{equipment.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ประเภท</label>
              <p className="text-sm">{getEquipmentTypeName(equipment.type)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ห้อง</label>
              <p className="text-sm">{equipment.room}</p>
            </div>
          </div>

          {/* Table Position */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="text-sm font-medium text-blue-800">ตำแหน่งโต๊ะ</label>
            <p className="text-sm font-semibold text-blue-700">{getTablePosition(equipment)}</p>
            {equipment.tableNumber > 0 && (
              <div className="mt-2 text-xs text-blue-600">
                <div>• ฝั่ง: {equipment.side === "left" ? "ซ้าย" : "ขวา"}</div>
                <div>• แถวที่: {equipment.row}</div>
                <div>• ที่นั่งที่: {equipment.seat}</div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">สถานะปัจจุบัน</label>
            <div className="flex items-center gap-2">{getStatusBadge(equipment.status)}</div>
          </div>

          {/* Repair Description */}
          {equipment.repairDescription && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <label className="text-sm font-medium text-red-800">รายละเอียดปัญหา</label>
              <p className="text-sm text-red-700 mt-1">{equipment.repairDescription}</p>
            </div>
          )}

          {/* Status Update */}
          {isTargetEquipment && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">อัปเดตสถานะ</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(equipment.id, "repair")}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  เริ่มซ่อม
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(equipment.id, "working")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  ซ่อมเสร็จ
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
            {isTargetEquipment && <Button className="bg-orange-600 hover:bg-orange-700">เริ่มงานซ่อม</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
