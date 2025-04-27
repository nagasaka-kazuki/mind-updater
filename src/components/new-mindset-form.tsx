"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { mindsets } from "@/db/schema"

export default function NewMindsetForm() {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await db.insert(mindsets).values({
        userId: 1, // 仮のユーザーID
        title: title.trim(),
        archived: false,
        createdAt: new Date(),
      })
      setTitle("")
    } catch (error) {
      console.error("Failed to create mindset:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">新しいマインドセットを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              placeholder="マインドセットのタイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "追加中..." : "追加"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
