"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, pgClient } from "@/lib/db"
import { success_logs } from "@/db/schema"

export default function NewSuccessLogForm({ mindsets }) {
  const [selectedMindset, setSelectedMindset] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [memo, setMemo] = useState("")
  const [methods, setMethods] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (selectedMindset) {
      const methodsQuery = pgClient.live(
        `SELECT * FROM methods WHERE mindset_id = ${selectedMindset} ORDER BY created_at DESC`,
      )

      methodsQuery.subscribe((data) => {
        setMethods(data)
      })
    } else {
      setMethods([])
    }

    // Reset selected method when mindset changes
    setSelectedMethod("")
  }, [selectedMindset])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedMindset || !memo.trim()) return

    setIsSubmitting(true)
    try {
      await db.insert(success_logs).values({
        mindsetId: Number.parseInt(selectedMindset),
        methodId: selectedMethod ? Number.parseInt(selectedMethod) : null,
        memo: memo.trim(),
        createdAt: new Date(),
      })

      // Reset form
      setMemo("")
      setSelectedMethod("")
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
            <div className="space-y-2">
              <label htmlFor="mindset-select" className="text-sm font-medium">
                マインドセット
              </label>
              <Select value={selectedMindset} onValueChange={setSelectedMindset}>
                <SelectTrigger id="mindset-select">
                  <SelectValue placeholder="マインドセットを選択" />
                </SelectTrigger>
                <SelectContent>
                  {mindsets.map((mindset) => (
                    <SelectItem key={mindset.id} value={mindset.id.toString()}>
                      {mindset.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  {methods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <Button type="submit" className="w-full" disabled={isSubmitting || !selectedMindset || !memo.trim()}>
            {isSubmitting ? "記録中..." : "記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
