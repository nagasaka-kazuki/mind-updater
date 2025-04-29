"use client";

import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import {
  mindsets,
  methods,
  success_logs,
  type Mindset as RawMindset,
  type Method as RawMethod,
  type SuccessLog as RawSuccessLog,
  type Mindset,
  type Method,
  type SuccessLog,
} from "@/db/schema";
import { db, pgClient } from "@/lib/db";

export const allMindsetsAtom = atom<Mindset[]>([]);
export const activeMethodsAtom = atom<Method[]>([]);
export const archivedMethodsAtom = atom<Method[]>([]);
export const allSuccessLogsAtom = atom<SuccessLog[]>([]);
export const isLoadingAtom = atom<boolean>(true);

// --- Unsubscribe storage ---
let unsubscribers: Array<() => Promise<void>> = [];

// --- Initialization Atom ---
export const initLiveSyncAtom = atom(null, async (_, set) => {
  // 既存の購読解除
  if (unsubscribers.length > 0) {
    await Promise.all(unsubscribers.map((unsub) => unsub()));
    unsubscribers = [];
  }

  // ライブクエリ購読登録
  const [mindsetLive, methodLive, successLogLive] = await Promise.all([
    pgClient.live.query(db.select().from(mindsets).toSQL().sql, [], (res) => {
      const rows: RawMindset[] = (res as any).rows ?? res;
      const ms: Mindset[] = rows.map((m: any) => ({
        id: m.id,
        title: m.title,
        createdAt: m.created_at,
      }));
      set(allMindsetsAtom, ms);
    }),
    pgClient.live.query(db.select().from(methods).toSQL().sql, [], (res) => {
      const rows: RawMethod[] = (res as any).rows ?? res;
      const mts = rows.map((m: any) => ({
        id: m.id,
        mindsetId: m.mindset_id,
        title: m.title,
        archived: m.archived,
        createdAt: m.created_at,
      }));
      set(
        activeMethodsAtom,
        mts.filter((m) => !m.archived),
      );
      set(
        archivedMethodsAtom,
        mts.filter((m) => m.archived),
      );
    }),
    pgClient.live.query(
      db.select().from(success_logs).toSQL().sql,
      [],
      (res) => {
        const rows: RawSuccessLog[] = (res as any).rows ?? res;
        const sls: SuccessLog[] = rows.map((s: any) => ({
          id: s.id,
          methodId: s.method_id,
          memo: s.memo || undefined,
          createdAt: s.created_at,
        }));
        set(allSuccessLogsAtom, sls);
      },
    ),
  ]);

  // ロード完了フラグ
  set(isLoadingAtom, false);

  // 購読解除関数を保持
  unsubscribers = [
    mindsetLive.unsubscribe,
    methodLive.unsubscribe,
    successLogLive.unsubscribe,
  ];
});

// --- Hook to initialize live-sync ---
export function useLiveSyncSetup() {
  const [, initLiveSync] = useAtom(initLiveSyncAtom);
  useEffect(() => {
    initLiveSync();
    return () => {
      unsubscribers.forEach((unsub) => unsub());
      unsubscribers = [];
    };
  }, [initLiveSync]);
}
