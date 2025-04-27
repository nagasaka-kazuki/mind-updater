"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, pgClient } from "@/lib/db"
import { mindsets } from "@/db/schema"
import { eq } from "drizzle-orm"
import MindsetList from "@/components/mindset-list"
import NewMindsetForm from "@/components/new-mindset-form"
import NewSuccessLogForm from "@/components/new-success-log-form"

export default function Home() {
  const [activeMindsets, setActiveMindsets] = useState([])
  const [archivedMindsets, setArchivedMindsets] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Live query for active mindsets
        const activeMindsetQuery = pgClient.live(
          `SELECT * FROM mindsets WHERE archived = false ORDER BY created_at DESC`,
        )

        // Live query for archived mindsets
        const archivedMindsetQuery = pgClient.live(
          `SELECT * FROM mindsets WHERE archived = true ORDER BY created_at DESC`,
        )

        activeMindsetQuery.subscribe((data) => {
          setActiveMindsets(data)
        })

        archivedMindsetQuery.subscribe((data) => {
          setArchivedMindsets(data)
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load mindsets:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleArchiveMindset = async (mindsetId) => {
    try {
      await db.update(mindsets).set({ archived: true }).where(eq(mindsets.id, mindsetId))
    } catch (error) {
      console.error("Failed to archive mindset:", error)
    }
  }

  const handleUnarchiveMindset = async (mindsetId) => {
    try {
      await db.update(mindsets).set({ archived: false }).where(eq(mindsets.id, mindsetId))
    } catch (error) {
      console.error("Failed to unarchive mindset:", error)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-center">マインドセット管理</h1>

      <NewMindsetForm />
      <NewSuccessLogForm mindsets={activeMindsets} />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">アクティブ</TabsTrigger>
          <TabsTrigger value="archived">アーカイブ</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : (
            <MindsetList mindsets={activeMindsets} onArchive={handleArchiveMindset} isArchiveList={false} />
          )}
        </TabsContent>

        <TabsContent value="archived">
          {isLoading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : (
            <MindsetList mindsets={archivedMindsets} onUnarchive={handleUnarchiveMindset} isArchiveList={true} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
