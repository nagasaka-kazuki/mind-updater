"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { success_logs, Method, Mindset } from "@/db/schema"
import { useAtomValue } from "jotai"
import { activeMindsetsAtom, allMethodsAtom } from "@/hooks/use-live-sync"
import { v4 } from "uuid"


export default function NewSuccessLogForm() {
  const activeMindsets = useAtomValue(activeMindsetsAtom)
  const allMethods = useAtomValue(allMethodsAtom)

  const [selectedMindset, setSelectedMindset] = useState<string>("")
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [memo, setMemo] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // フィルタされたメソッドリスト
  const methods = useMemo<Method[]>(
    () => allMethods.filter((m) => m.mindsetId === selectedMindset),
    [allMethods, selectedMindset]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMindset || !memo.trim()) return

    setIsSubmitting(true)
    try {
      await db.insert(success_logs).values({
        id:v4(),
        mindsetId: selectedMindset,
        methodId: selectedMethod || undefined,
        memo: memo.trim(),
        createdAt: new Date(),
      })
      // リセット
      setSelectedMindset("")
      setSelectedMethod("")
      setMemo("")
    } catch (error) {
      console.error("Failed to create success log:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">成功体験を記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* マインドセット選択 */}
            <div className="space-y-2">
              <label htmlFor="mindset-select" className="text-sm font-medium">
                マインドセット
              </label>
              <Select
                value={selectedMindset}
                onValueChange={(value) => {
                  setSelectedMindset(value)
                  setSelectedMethod("")
                }}
              >
                <SelectTrigger id="mindset-select">
                  <SelectValue placeholder="マインドセットを選択" />
                </SelectTrigger>
                <SelectContent>
                  {activeMindsets.map((ms: Mindset) => (
                    <SelectItem key={ms.id} value={ms.id}>
                      {ms.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* メソッド選択 */}
            <div className="space-y-2">
              <label htmlFor="method-select" className="text-sm font-medium">
                メソッド (任意)
              </label>
              <Select
                value={selectedMethod}
                onValueChange={setSelectedMethod}
                disabled={!selectedMindset || methods.length === 0}
              >
                <SelectTrigger id="method-select">
                  <SelectValue placeholder="メソッドを選択 (任意)" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((method: Method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* メモ入力 */}
          <div className="space-y-2">
            <label htmlFor="memo" className="text-sm font-medium">
              成功体験メモ
            </label>
            <Textarea
              id="memo"
              placeholder="成功体験の内容を記入してください"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* 送信ボタン */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !selectedMindset || !memo.trim()}
          >
            {isSubmitting ? "記録中..." : "記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}