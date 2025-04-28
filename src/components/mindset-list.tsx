"use client"

import { useMemo, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAtomValue } from "jotai"
import { allMindsetsAtom, activeMethodsAtom, archivedMethodsAtom } from "@/hooks/use-live-sync"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NewMethodForm from "./new-method-form"
import { deleteMindset } from "@/lib/actions"
import { useDialog, useDialogGroup } from "@/hooks/use-dialog"
import MethodList from "./method-list"

interface MindsetListProps {
  isArchiveList: boolean
}

export default function MindsetList({ isArchiveList }: MindsetListProps) {
  const allMindsets = useAtomValue(allMindsetsAtom)
  const activeMethods = useAtomValue(activeMethodsAtom)
  const archivedMethods = useAtomValue(archivedMethodsAtom)

  const { openDialogs, setOpenDialogs } = useDialogGroup()
  const { isOpen: isDeleteDialogOpen, open: openDeleteDialog, setIsOpen: setDeleteDialogOpen } = useDialog()
  const [mindsetToDelete, setMindsetToDelete] = useState<string>("")

  // Get methods for each mindset
  const methodsByMindset = useMemo(() => {
    const methods = isArchiveList ? archivedMethods : activeMethods
    return methods.reduce<Record<string, typeof methods>>((acc, method) => {
      if (!acc[method.mindsetId]) {
        acc[method.mindsetId] = []
      }
      acc[method.mindsetId].push(method)
      return acc
    }, {})
  }, [isArchiveList, activeMethods, archivedMethods])

  // Filter mindsets that have methods in the current view (active/archived)
  const filteredMindsets = useMemo(() => {
    return allMindsets.filter((mindset) => {
      const hasMethods = Boolean(methodsByMindset[mindset.id]?.length)
      return isArchiveList ? hasMethods : true // Show all mindsets in active view
    })
  }, [allMindsets, methodsByMindset, isArchiveList])

  const handleDeleteMindset = async (mindsetId: string) => {
    if (window.confirm("このマインドセットを削除しますか？関連するすべてのメソッドと成功ログも削除されます。")) {
      try {
        await deleteMindset(mindsetId)
      } catch (error) {
        console.error("Failed to delete mindset:", error)
      }
    }
  }

  const openNewMethodDialog = (mindsetId: string) => {
    setOpenDialogs((prev) => ({ ...prev, [mindsetId]: true }))
  }

  const confirmDeleteMindset = (mindsetId: string) => {
    setMindsetToDelete(mindsetId)
    openDeleteDialog()
  }

  if (!filteredMindsets.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArchiveList ? "アーカイブされたメソッドはありません" : "マインドセットがありません"}
      </div>
    )
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {filteredMindsets.map((mindset) => (
          <AccordionItem key={mindset.id} value={mindset.id} className="border rounded-lg p-2">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline py-2">
                <span className="text-lg font-medium">{mindset.title}</span>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-4">
                <Button variant="outline" size="sm" onClick={() => openNewMethodDialog(mindset.id)}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  新しいメソッド
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteMindset(mindset.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <AccordionContent>
              <div className="pt-4">
                <MethodList mindsetId={mindset.id} isArchiveList={isArchiveList} />
              </div>
            </AccordionContent>

            <Dialog
              open={openDialogs[mindset.id]}
              onOpenChange={(open) => setOpenDialogs((prev) => ({ ...prev, [mindset.id]: open }))}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しいメソッドを追加</DialogTitle>
                </DialogHeader>
                <NewMethodForm
                  mindsets={allMindsets}
                  preselectedMindsetId={mindset.id}
                  onSuccess={() => setOpenDialogs((prev) => ({ ...prev, [mindset.id]: false }))}
                />
              </DialogContent>
            </Dialog>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
