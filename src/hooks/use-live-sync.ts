import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import {
  mindsets,
  methods,
  success_logs,
  Mindset as RawMindset,
  Method as RawMethod,
  SuccessLog as RawSuccessLog,
  Mindset,
  Method,
  SuccessLog,
} from '@/db/schema'
import { db, pgClient } from '@/lib/db'


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
          const rows: RawMindset[] = (res as any).rows ?? res
          const ms: Mindset[] = rows.map((m: any) => ({
            id: m.id,
            title: m.title,
            archived: m.archived,
            createdAt: m.created_at,
          }))
          set(activeMindsetsAtom, ms.filter(m => !m.archived))
          set(archivedMindsetsAtom, ms.filter(m => m.archived))
        }
      ),
      pgClient.live.query(
        db.select().from(methods).toSQL().sql,
        [],
        res => {
          const rows: RawMethod[] = (res as any).rows ?? res
          const mts = rows.map((m: any) => ({
            id: m.id,
            mindsetId: m.mindset_id,
            title: m.title,
            createdAt: m.created_at,
          }))
          set(allMethodsAtom, mts)
        }
      ),
      pgClient.live.query(
        db.select().from(success_logs).toSQL().sql,
        [],
        res => {
          const rows: RawSuccessLog[] = (res as any).rows ?? res
          const sls: SuccessLog[] = rows.map((s: any) => ({
            id: s.id,
            mindsetId: s.mindset_id,
            methodId: s.method_id || undefined,
            memo: s.memo || undefined,
            createdAt: s.created_at,
          }))
          set(allSuccessLogsAtom, sls)
        }
      ),
    ])

    // ロード完了フラグ
    set(isLoadingAtom, false)

    // 購読解除関数を保持
    unsubscribers = [
      mindsetLive.unsubscribe,
      methodLive.unsubscribe,
      successLogLive.unsubscribe,
    ]
  }
)

// --- Hook to initialize live-sync ---
export function useLiveSyncSetup() {
  const [, initLiveSync] = useAtom(initLiveSyncAtom)
  useEffect(() => {
    initLiveSync()
    return () => {
      unsubscribers.forEach(unsub => unsub())
      unsubscribers = []
    }
  }, [initLiveSync])
}

/**
 * 使い方:
 *
 * // アプリ全体を Jotai の Provider でラップ (_app.tsx または index.tsx)
 * import { Provider as JotaiProvider } from 'jotai'
 *
 * function App({ Component, pageProps }) {
 *   return (
 *     <JotaiProvider>
 *       <Component {...pageProps} />
 *     </JotaiProvider>
 *   )
 * }
 * export default App
 *
 * // ページまたはコンポーネント内で
 * 'use client'
 * import { useAtomValue } from 'jotai'
 * import { useLiveSyncSetup, isLoadingAtom, allMethodsAtom } from '@/hooks/use-live-sync'
 *
 * export default function SomePage() {
 *   useLiveSyncSetup()
 *   const isLoading = useAtomValue(isLoadingAtom)
 *   const methods = useAtomValue(allMethodsAtom)
 *
 *   if (isLoading) return <div>読み込み中...</div>
 *   return (
 *     <ul>
 *       {methods.map(m => <li key={m.id}>{m.title}</li>)}
 *     </ul>
 *   )
 * }
 */
