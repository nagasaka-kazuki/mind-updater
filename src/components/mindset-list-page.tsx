"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MindsetList from "@/components/mindset-list"
import NewMindsetForm from "@/components/new-mindset-form"

export default function MindsetListPage() {
  return (
    <div>
      <NewMindsetForm />

      <Tabs defaultValue="active" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">アクティブ</TabsTrigger>
          <TabsTrigger value="archived">アーカイブ</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <MindsetList isArchiveList={false} />
        </TabsContent>

        <TabsContent value="archived">
          <MindsetList isArchiveList={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
