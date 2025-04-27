"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Archive, RotateCcw } from "lucide-react"
import { pgClient } from "@/lib/db"
import MethodList from "./method-list"
import NewMethodForm from "./new-method-form"

export default function MindsetList({ mindsets, onArchive, onUnarchive, isArchiveList }) {
  const [expandedMindsets, setExpandedMindsets] = useState({})
  const [methodsData, setMethodsData] = useState({})
  const [successLogsData, setSuccessLogsData] = useState({})

  useEffect(() => {
    // Initialize expanded state for all mindsets
    const initialExpandedState = {}
    mindsets.forEach((mindset) => {
      initialExpandedState[mindset.id] = false
    })
    setExpandedMindsets(initialExpandedState)

    // Set up live queries for each mindset's methods and success logs
    mindsets.forEach((mindset) => {
      const methodsQuery = pgClient.live(
        `SELECT * FROM methods WHERE mindset_id = ${mindset.id} ORDER BY created_at DESC`,
      )

      const logsQuery = pgClient.live(
        `SELECT * FROM success_logs WHERE mindset_id = ${mindset.id} ORDER BY created_at DESC`,
      )

      methodsQuery.subscribe((data) => {
        setMethodsData((prev) => ({
          ...prev,
          [mindset.id]: data,
        }))
      })

      logsQuery.subscribe((data) => {
        setSuccessLogsData((prev) => ({
          ...prev,
          [mindset.id]: data,
        }))
      })
    })
  }, [mindsets])

  const handleToggle = (mindsetId) => {
    setExpandedMindsets((prev) => ({
      ...prev,
      [mindsetId]: !prev[mindsetId],
    }))
  }

  if (mindsets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArchiveList ? "アーカイブされたマインドセットはありません" : "マインドセットがありません"}
      </div>
    )
  }

  return (
    <Accordion type="multiple" className="w-full">
      {mindsets.map((mindset) => (
        <AccordionItem key={mindset.id} value={mindset.id.toString()}>
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
                    onClick={(e) => {
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
                    onClick={(e) => {
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
                  methods={methodsData[mindset.id] || []}
                  successLogs={successLogsData[mindset.id] || []}
                  mindsetId={mindset.id}
                  isArchived={isArchiveList}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">成功ログ</h3>
                <div className="space-y-2">
                  {(successLogsData[mindset.id] || []).length > 0 ? (
                    (successLogsData[mindset.id] || []).map((log) => (
                      <div key={log.id} className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          {log.methodId && (
                            <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {(methodsData[mindset.id] || []).find((m) => m.id === log.methodId)?.title ||
                                "メソッド不明"}
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
