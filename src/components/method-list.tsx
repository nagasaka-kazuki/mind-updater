"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { db } from "@/lib/db"
import { success_logs, Method, SuccessLog } from "@/db/schema"
import { v4 } from "uuid"

interface MethodListProps {
  methods: Method[]
  successLogs: SuccessLog[]
  mindsetId: string
  isArchived: boolean
}

export default function MethodList({
  methods,
  successLogs,
  mindsetId,
  isArchived,
}: MethodListProps) {
  const [isAddingLog, setIsAddingLog] = useState<Record<string, boolean>>({})
  const [newLogMemo, setNewLogMemo] = useState<Record<string, string>>({})

  const getSuccessCount = (methodId: string) =>
    successLogs.filter((log) => log.methodId === methodId).length

  const handleAddLog = async (methodId: string) => {
    const memo = newLogMemo[methodId]?.trim()
    if (!memo) return
    try {
      await db.insert(success_logs).values({ id:v4(),mindsetId, methodId, memo, createdAt: new Date() })
      setIsAddingLog((prev) => ({ ...prev, [methodId]: false }))
      setNewLogMemo((prev) => ({ ...prev, [methodId]: "" }))
    } catch (error) {
      console.error("Failed to add success log:", error)
    }
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        メソッドはありません
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {methods.map((method) => (
        <Card key={method.id}>
          <CardHeader className="pb-2">
            <CardTitle>{method.title}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                成功ログ: {getSuccessCount(method.id)}件
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {isAddingLog[method.id] ? (
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="成功体験のメモを入力..."
                  value={newLogMemo[method.id] || ""}
                  onChange={(e) =>
                    setNewLogMemo((prev) => ({ ...prev, [method.id]: e.target.value }))
                  }
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleAddLog(method.id)}>
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setIsAddingLog((prev) => ({ ...prev, [method.id]: false }))
                    }
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              !isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setIsAddingLog((prev) => ({ ...prev, [method.id]: true }))
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  成功ログを追加
                </Button>
              )
            )}
          </CardContent>
          <CardFooter className="pt-0">
            {successLogs.filter((log) => log.methodId === method.id).length > 0 ? (
              <div className="text-sm text-muted-foreground">
                最新の成功: {" "}
                {new Date(
                  Math.max(
                    ...successLogs
                      .filter((log) => log.methodId === method.id)
                      .map((log) => new Date(log.createdAt).getTime())
                  )
                ).toLocaleDateString()}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                まだ成功ログはありません
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
