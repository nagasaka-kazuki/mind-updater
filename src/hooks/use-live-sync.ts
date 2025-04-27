import { atom, useAtom} from 'jotai'

import {
  mindsets,
  methods,
  success_logs,
  Mindset,
  Method,
  SuccessLog,
} from '@/db/schema'
import { db, pgClient } from '@/lib/db'
import { useEffect } from 'react'

// --- Jotai Atoms ---
export const activeMindsetsAtom = atom<Mindset[]>([])
export const archivedMindsetsAtom = atom<Mindset[]>([])
export const allMethodsAtom = atom<Method[]>([])
export const allSuccessLogsAtom = atom<SuccessLog[]>([])
export const isLoadingAtom = atom<boolean>(true)

// --- Unsubscribe storage ---
let unsubscribers: Array<() => Promise<void>> = []

// --- Initialization Atom ---
export const initLiveSyncAtom = atom(
  null,
  async (_, set) => {
    // 既存の購読解除
    if (unsubscribers.length > 0) {
      await Promise.all(unsubscribers.map(unsub => unsub()))
      unsubscribers = []
    }

    // ライブクエリ購読登録
    const [mindsetLive, methodLive, successLogLive] = await Promise.all([
      pgClient.live.query(
        db.select().from(mindsets).toSQL().sql,
        [],
        res => {
          const ms: Mindset[] = (res as any).rows ?? res
          set(activeMindsetsAtom, ms.filter(m => !m.archived))
          set(archivedMindsetsAtom, ms.filter(m => m.archived))
        }
      ),
      pgClient.live.query(
        db.select().from(methods).toSQL().sql,
        [],
        res => {
          const mts: Method[] = (res as any).rows ?? res
          set(allMethodsAtom, mts)
        }
      ),
      pgClient.live.query(
        db.select().from(success_logs).toSQL().sql,
        [],
        res => {
          const sls: SuccessLog[] = (res as any).rows ?? res
          set(allSuccessLogsAtom, sls)
        }
      ),
    ])

    // ロード完了フラグ
    set(isLoadingAtom, false)

    // 購読解除関数を保持
    unsubscribers = [mindsetLive.unsubscribe, methodLive.unsubscribe, successLogLive.unsubscribe]
  }
)

export function useLiveSyncSetup(){
    const [, initLiveSync] = useAtom(initLiveSyncAtom)

  useEffect(() => {
    // マウント時に一度だけライブ購読を開始
    initLiveSync()
    // アンマウント時に自動解除ロジックが入っているので何もしなくて OK
  }, [initLiveSync])
}