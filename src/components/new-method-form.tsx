"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import { methods } from "@/db/schema"

export default function NewMethodForm({ mindsetId }) {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await db.insert(methods).values({
        mindsetId,
        title: title.trim(),
        createdAt: new Date(),
      })
      setTitle("")
      setIsFormVisible(false)
    } catch (error) {
      console.error("Failed to create method:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      {isFormVisible ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            placeholder="メソッドのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
          <div className="flex space-x-2">
            <Button type="submit" size="sm" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "追加中..." : "追加"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setIsFormVisible(false)}>
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsFormVisible(true)}>
          新しいメソッドを追加
        </Button>
      )}
    </div>
  )
}
