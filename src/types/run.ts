import type { GeoPoint } from './geo'

export type RunStatus = 'idle' | 'running' | 'paused'

export interface RunRecord {
  id: string
  startedAt: string
  durationMs: number
  distanceMeters: number
  path: GeoPoint[]
}
