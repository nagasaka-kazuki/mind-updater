"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMethod } from "@/lib/actions"
import type { Mindset } from "@/db/schema"

interface NewMethodFormProps {
  mindsets: Mindset[]
  preselectedMindsetId?: string
  onSuccess?: () => void
}

export default function NewMethodForm({ mindsets, preselectedMindsetId = "", onSuccess }: NewMethodFormProps) {
  const [title, setTitle] = useState("")
  const [selectedMindsetId, setSelectedMindsetId] = useState(preselectedMindsetId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedMindsetId) return

    setIsSubmitting(true)
    try {
      await createMethod(title, selectedMindsetId)
      setTitle("")
      if (!preselectedMindsetId) {
        setSelectedMindsetId("")
      }
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create method:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="method-title" className="text-sm font-medium">
          メソッド名
        </label>
        <Input
          id="method-title"
          placeholder="メソッドのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {!preselectedMindsetId && (
        <div className="space-y-2">
          <label htmlFor="mindset-select" className="text-sm font-medium">
            マインドセット
          </label>
          <Select value={selectedMindsetId} onValueChange={setSelectedMindsetId}>
            <SelectTrigger id="mindset-select">
              <SelectValue placeholder="マインドセットを選択" />
            </SelectTrigger>
            <SelectContent>
              {mindsets.map((mindset) => (
                <SelectItem key={mindset.id} value={mindset.id}>
                  {mindset.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !title.trim() || !selectedMindsetId}>
        {isSubmitting ? "追加中..." : "追加"}
      </Button>
    </form>
  )
}
