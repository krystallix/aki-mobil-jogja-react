"use client"

import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia("(pointer: coarse)")
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getCoarsePointer() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: coarse)").matches
}

function getServerSnapshot() {
  return false
}

export function useIsNativeShare(): boolean {
  const isCoarsePointer = useSyncExternalStore(
    subscribe,
    getCoarsePointer,
    getServerSnapshot
  )
  if (typeof navigator === "undefined") return false
  return isCoarsePointer && !!navigator.share
}
