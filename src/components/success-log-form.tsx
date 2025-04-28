"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createSuccessLog } from "@/lib/actions"

interface SuccessLogFormProps {
  methodId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function SuccessLogForm({ methodId, isOpen, onOpenChange }: SuccessLogFormProps) {
  const [memo, setMemo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!memo.trim()) return

    setIsSubmitting(true)
    try {
      await createSuccessLog(methodId, memo)
      setMemo("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add success log:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>成功ログを追加</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="成功体験の内容を記入してください"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSubmit} disabled={isSubmitting || !memo.trim()}>
            {isSubmitting ? "記録中..." : "記録する"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
