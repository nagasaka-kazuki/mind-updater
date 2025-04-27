"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import {  mindsets } from "@/db/schema"
import { eq } from "drizzle-orm"
import MindsetList from "@/components/mindset-list"
import NewMindsetForm from "@/components/new-mindset-form"
import NewSuccessLogForm from "@/components/new-success-log-form"
import {  isLoadingAtom, useLiveSyncSetup } from "./hooks/use-live-sync"
import { useAtomValue } from "jotai"

export default function Home() {
  useLiveSyncSetup()
  const isLoading = useAtomValue(isLoadingAtom)

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  const handleArchiveMindset = async (mindsetId: string) => {
    try {
      await db.update(mindsets).set({ archived: true }).where(eq(mindsets.id, mindsetId))
    } catch (error) {
      console.error("Failed to archive mindset:", error)
    }
  }

  const handleUnarchiveMindset = async (mindsetId: string) => {
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
      <NewSuccessLogForm  />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">アクティブ</TabsTrigger>
          <TabsTrigger value="archived">アーカイブ</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
            <MindsetList 
              onArchive={handleArchiveMindset} 
              onUnarchive={handleUnarchiveMindset}
              isArchiveList={false} 
            />
        </TabsContent>

        <TabsContent value="archived">
            <MindsetList 
              onArchive={handleArchiveMindset} 
              onUnarchive={handleUnarchiveMindset}
              isArchiveList={true} 
            />
        </TabsContent>
      </Tabs>
    </div>
  )
}
