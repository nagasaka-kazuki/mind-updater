import { db } from "@/lib/db"
import { mindsets, methods, success_logs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import type { Mindset, Method, SuccessLog } from "@/db/schema"

// Mindset actions
export async function createMindset(title: string): Promise<void> {
  await db.insert(mindsets).values({
    id: uuidv4(),
    title: title.trim(),
    createdAt: new Date(),
  })
}

export async function deleteMindset(mindsetId: string): Promise<void> {
  await db.delete(mindsets).where(eq(mindsets.id, mindsetId))
}

// Method actions
export async function createMethod(title: string, mindsetId: string): Promise<void> {
  await db.insert(methods).values({
    id: uuidv4(),
    title: title.trim(),
    mindsetId,
    archived: false,
    createdAt: new Date(),
  })
}

export async function archiveMethod(methodId: string): Promise<void> {
  await db.update(methods).set({ archived: true }).where(eq(methods.id, methodId))
}

export async function unarchiveMethod(methodId: string): Promise<void> {
  await db.update(methods).set({ archived: false }).where(eq(methods.id, methodId))
}

export async function deleteMethod(methodId: string): Promise<void> {
  await db.delete(methods).where(eq(methods.id, methodId))
}

// Success log actions
export async function createSuccessLog(methodId: string, memo: string): Promise<void> {
  await db.insert(success_logs).values({
    id: uuidv4(),
    methodId,
    memo: memo.trim(),
    createdAt: new Date(),
  })
}

export async function deleteSuccessLog(logId: string): Promise<void> {
  await db.delete(success_logs).where(eq(success_logs.id, logId))
}

// Helper functions
export function getMindsetTitle(mindsets: Mindset[], mindsetId: string): string {
  return mindsets.find((m) => m.id === mindsetId)?.title || "不明"
}

export function getMethodsForMindset(methods: Method[], mindsetId: string): Method[] {
  return methods.filter((m) => m.mindsetId === mindsetId)
}

export function getSuccessLogsForMethod(logs: SuccessLog[], methodId: string): SuccessLog[] {
  return logs.filter((log) => log.methodId === methodId)
}

export function sortByNewest<T extends { createdAt: Date | string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
