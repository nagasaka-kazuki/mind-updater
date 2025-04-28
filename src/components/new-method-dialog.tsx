"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NewMethodForm from "./new-method-form"
import type { Mindset } from "@/db/schema"

interface NewMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mindsets: Mindset[]
  preselectedMindsetId?: string
}

export default function NewMethodDialog({ open, onOpenChange, mindsets, preselectedMindsetId }: NewMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新しいメソッドを追加</DialogTitle>
        </DialogHeader>
        <NewMethodForm
          mindsets={mindsets}
          preselectedMindsetId={preselectedMindsetId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
