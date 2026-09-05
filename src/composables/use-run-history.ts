import type { RunRecord } from './use-run-timer'
import { ref } from 'vue'
import { isGeoPoint } from './use-route-tracker'

const STORAGE_KEY = 'run-tracker-history'
const HISTORY_LIMIT = 20

function normalizeRecord(value: unknown): RunRecord | null {
  if (!value || typeof value !== 'object')
    return null

  const raw = value as Partial<RunRecord>
  if (typeof raw.id !== 'string' || typeof raw.durationMs !== 'number')
    return null

  return {
    id: raw.id,
    startedAt: typeof raw.startedAt === 'string' ? raw.startedAt : new Date().toISOString(),
    durationMs: raw.durationMs,
    distanceMeters: typeof raw.distanceMeters === 'number' ? raw.distanceMeters : 0,
    path: Array.isArray(raw.path) ? raw.path.filter(isGeoPoint) : [],
  }
}

function loadHistory(): RunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed))
      return []
    return parsed.map(normalizeRecord).filter((record): record is RunRecord => record !== null)
  }
  catch {
    return []
  }
}

function saveHistory(records: RunRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function useRunHistory() {
  const history = ref<RunRecord[]>(loadHistory())

  function addRun(record: RunRecord) {
    history.value = [record, ...history.value].slice(0, HISTORY_LIMIT)
    saveHistory(history.value)
  }

  return {
    history,
    addRun,
  }
}
