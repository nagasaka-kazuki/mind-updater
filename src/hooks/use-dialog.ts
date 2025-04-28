"use client"

import { useState, useCallback } from "react"

export function useDialog(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  }
}

export function useDialogGroup() {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})

  const isOpen = useCallback((id: string) => !!openDialogs[id], [openDialogs])

  const open = useCallback((id: string) => {
    setOpenDialogs((prev) => ({ ...prev, [id]: true }))
  }, [])

  const close = useCallback((id: string) => {
    setOpenDialogs((prev) => ({ ...prev, [id]: false }))
  }, [])

  const toggle = useCallback((id: string) => {
    setOpenDialogs((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return {
    openDialogs,
    setOpenDialogs,
    isOpen,
    open,
    close,
    toggle,
  }
}
