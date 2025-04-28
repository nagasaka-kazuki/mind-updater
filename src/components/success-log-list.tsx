"use client"

import { useMemo } from "react"
import type { SuccessLog } from "@/db/schema"
import { sortByNewest } from "@/lib/actions"

interface SuccessLogListProps {
  logs: SuccessLog[]
}

export default function SuccessLogList({ logs }: SuccessLogListProps) {
  const sortedLogs = useMemo(() => sortByNewest(logs), [logs])

  if (sortedLogs.length === 0) {
    return <div className="text-center py-2 text-muted-foreground">成功ログはありません</div>
  }

  return (
    <div className="space-y-2">
      {sortedLogs.map((log) => (
        <div key={log.id} className="p-3 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground mb-1">{new Date(log.createdAt).toLocaleString()}</div>
          <p>{log.memo}</p>
        </div>
      ))}
    </div>
  )
}
