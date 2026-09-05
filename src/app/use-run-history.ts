import type { RunRecord } from '../types/run'
import { ref } from 'vue'
import { isGeoPoint } from '../types/geo'

const STORAGE_KEY = 'run-tracker-history'
const HISTORY_LIMIT = 20

/**
 * Приводит неизвестное значение к записи пробежки.
 * @param value - сырой объект из localStorage
 */
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

/** Загружает историю пробежек из localStorage. */
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

/**
 * Сохраняет историю пробежек в localStorage.
 * @param records - актуальный список записей
 */
function saveHistory(records: RunRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

/** Даёт доступ к сохранённой истории пробежек. */
export function useRunHistory() {
  const history = ref<RunRecord[]>(loadHistory())

  /**
   * Добавляет завершённую пробежку в начало истории.
   * @param record - запись с длительностью, дистанцией и маршрутом
   */
  function addRun(record: RunRecord) {
    history.value = [record, ...history.value].slice(0, HISTORY_LIMIT)
    saveHistory(history.value)
  }

  return {
    history,
    addRun,
  }
}
