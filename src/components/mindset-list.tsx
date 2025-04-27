"use client"

import React, { useState, useMemo } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Archive, RotateCcw } from "lucide-react"
import MethodList from "./method-list"
import NewMethodForm from "./new-method-form"
import { useAtomValue } from "jotai"
import {
  activeMindsetsAtom,
  archivedMindsetsAtom,
  allMethodsAtom,
  allSuccessLogsAtom,
} from "@/hooks/use-live-sync"
import { Method, SuccessLog } from "@/db/schema"

interface MindsetListProps {
  onArchive: (mindsetId: string) => void
  onUnarchive: (mindsetId: string) => void
  isArchiveList: boolean
}

export default function MindsetList({ onArchive, onUnarchive, isArchiveList }: MindsetListProps) {
  const [expandedMindsets, setExpandedMindsets] = useState<Record<string, boolean>>({})

  const mindsets = useAtomValue(
    isArchiveList ? archivedMindsetsAtom : activeMindsetsAtom
  )
  const allMethods = useAtomValue(allMethodsAtom)
  const allSuccessLogs = useAtomValue(allSuccessLogsAtom)

  const methodsData = useMemo(() => {
    return allMethods.reduce<Record<string, Method[]>>((acc, method) => {
      const { mindsetId } = method
      if (!acc[mindsetId]) acc[mindsetId] = []
      acc[mindsetId].push(method)
      return acc
    }, {})
  }, [allMethods])

  const successLogsData = useMemo(() => {
    return allSuccessLogs.reduce<Record<string, SuccessLog[]>>((acc, log) => {
      const { mindsetId } = log
      if (!acc[mindsetId]) acc[mindsetId] = []
      acc[mindsetId].push(log)
      return acc
    }, {})
  }, [allSuccessLogs])

  const handleToggle = (mindsetId: string) => {
    setExpandedMindsets(prev => ({
      ...prev,
      [mindsetId]: !prev[mindsetId],
    }))
  }

  if (!mindsets.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArchiveList
          ? "アーカイブされたマインドセットはありません"
          : "マインドセットがありません"}
      </div>
    )
  }

  return (
    <Accordion type="multiple" className="w-full">
      {mindsets.map(mindset => (
        <AccordionItem key={mindset.id} value={mindset.id}>
          <AccordionTrigger
            onClick={() => handleToggle(mindset.id)}
            className="flex justify-between px-4 py-2 hover:bg-muted/50 rounded-md"
          >
            <div className="flex items-center justify-between w-full">
              <span>{mindset.title}</span>
              <div className="flex items-center space-x-2">
                {isArchiveList ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      onUnarchive(mindset.id)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">復元</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      onArchive(mindset.id)
                    }}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">アーカイブ</span>
                  </Button>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-4">
              {!isArchiveList && <NewMethodForm mindsetId={mindset.id} />}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">メソッド</h3>
                <MethodList
                  methods={methodsData[mindset.id] ?? []}
                  successLogs={successLogsData[mindset.id] ?? []}
                  mindsetId={mindset.id}
                  isArchived={isArchiveList}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">成功ログ</h3>
                <div className="space-y-2">
                  {successLogsData[mindset.id]?.length ? (
                    successLogsData[mindset.id].map(log => (
                      <div key={log.id} className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                          {log.methodId && (
                            <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {methodsData[mindset.id]?.find(m => m.id === log.methodId)?.title ?? "メソッド不明"}
                            </span>
                          )}
                        </div>
                        <p className="mt-1">{log.memo}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">成功ログはありません</div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
