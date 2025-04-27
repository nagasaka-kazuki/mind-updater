"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { db } from "@/lib/db"
import { success_logs } from "@/db/schema"

export default function MethodList({ methods, successLogs, mindsetId, isArchived }) {
  const [isAddingLog, setIsAddingLog] = useState({})
  const [newLogMemo, setNewLogMemo] = useState({})

  const getSuccessCountForMethod = (methodId) => {
    return successLogs.filter((log) => log.methodId === methodId).length
  }

  const handleAddLog = async (methodId) => {
    try {
      if (!newLogMemo[methodId] || newLogMemo[methodId].trim() === "") return

      await db.insert(success_logs).values({
        mindsetId,
        methodId,
        memo: newLogMemo[methodId],
        createdAt: new Date(),
      })

      setIsAddingLog((prev) => ({ ...prev, [methodId]: false }))
      setNewLogMemo((prev) => ({ ...prev, [methodId]: "" }))
    } catch (error) {
      console.error("Failed to add success log:", error)
    }
  }

  if (methods.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">メソッドはありません</div>
  }

  return (
    <div className="grid gap-4">
      {methods.map((method) => (
        <Card key={method.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{method.title}</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                成功ログ: {getSuccessCountForMethod(method.id)}件
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
                  onChange={(e) => setNewLogMemo((prev) => ({ ...prev, [method.id]: e.target.value }))}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleAddLog(method.id)}>
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingLog((prev) => ({ ...prev, [method.id]: false }))}
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
                  onClick={() => setIsAddingLog((prev) => ({ ...prev, [method.id]: true }))}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  成功ログを追加
                </Button>
              )
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="w-full">
              {successLogs.filter((log) => log.methodId === method.id).length > 0 ? (
                <div className="text-sm text-muted-foreground">
                  最新の成功:{" "}
                  {new Date(
                    Math.max(
                      ...successLogs
                        .filter((log) => log.methodId === method.id)
                        .map((log) => new Date(log.createdAt).getTime()),
                    ),
                  ).toLocaleDateString()}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">まだ成功ログはありません</div>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
