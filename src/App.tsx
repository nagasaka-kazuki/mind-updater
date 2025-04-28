"use client"

import { useState } from "react"
import { isLoadingAtom, useLiveSyncSetup } from "./hooks/use-live-sync"
import { useAtomValue } from "jotai"
import Header from "@/components/header"
import MethodListPage from "@/components/method-list-page"
import MindsetListPage from "@/components/mindset-list-page"

type Page = "methods" | "mindsets"

export default function Home() {
  useLiveSyncSetup()
  const isLoading = useAtomValue(isLoadingAtom)
  const [currentPage, setCurrentPage] = useState<Page>("methods")

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Header currentPage={currentPage} onChangePage={setCurrentPage} />

      <div className="mt-6">{currentPage === "methods" ? <MethodListPage /> : <MindsetListPage />}</div>
    </div>
  )
}
