"use client"

import { useMemo } from "react"
import { useAtomValue } from "jotai"
import { activeMethodsAtom, archivedMethodsAtom, allMindsetsAtom, allSuccessLogsAtom } from "@/hooks/use-live-sync"
import { getMethodsForMindset, getSuccessLogsForMethod, sortByNewest } from "@/lib/actions"
import MethodCard from "./method-card"

interface MethodListProps {
  mindsetId?: string
  isArchiveList: boolean
}

export default function MethodList({ mindsetId, isArchiveList }: MethodListProps) {
  const activeMethods = useAtomValue(activeMethodsAtom)
  const archivedMethods = useAtomValue(archivedMethodsAtom)
  const allMindsets = useAtomValue(allMindsetsAtom)
  const allSuccessLogs = useAtomValue(allSuccessLogsAtom)

  // Get methods based on filters
  const methods = useMemo(() => {
    const methodsList = isArchiveList ? archivedMethods : activeMethods
    if (mindsetId) {
      return getMethodsForMindset(methodsList, mindsetId)
    }
    return methodsList
  }, [mindsetId, isArchiveList, activeMethods, archivedMethods])

  // Sort methods by newest first
  const sortedMethods = useMemo(() => sortByNewest(methods), [methods])

  if (sortedMethods.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {isArchiveList ? "アーカイブされたメソッドはありません" : "メソッドはありません"}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {sortedMethods.map((method) => {
        const methodLogs = getSuccessLogsForMethod(allSuccessLogs, method.id)

        return (
          <MethodCard
            key={method.id}
            method={method}
            mindsets={allMindsets}
            successLogs={methodLogs}
            isArchived={isArchiveList}
          />
        )
      })}
    </div>
  )
}
