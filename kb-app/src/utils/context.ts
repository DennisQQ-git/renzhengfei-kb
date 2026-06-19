import { createContext, useContext } from 'react'
import type { IndexData } from '../types'

interface AppContextValue {
  indexData: IndexData
}

export const AppCtx = createContext<AppContextValue>(null!)

export function useApp() {
  return useContext(AppCtx)
}
