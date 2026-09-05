/**
 * Дополняет число ведущим нулём до двух знаков.
 * @param n - целое число для форматирования
 */
function padTwoDigits(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * Форматирует длительность в `mm:ss` или `hh:mm:ss`.
 * @param ms - длительность в миллисекундах
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0)
    return `${padTwoDigits(hours)}:${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`

  return `${padTwoDigits(minutes)}:${padTwoDigits(seconds)}`
}

/**
 * Форматирует дистанцию в метрах или километрах.
 * @param meters - расстояние в метрах
 * @param locale - локаль для `Intl.NumberFormat`
 */
export function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'short',
      maximumFractionDigits: 0,
    }).format(Math.round(meters))
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    unitDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(meters / 1000)
}

/**
 * Форматирует дату и время пробежки.
 * @param iso - дата в формате ISO 8601
 * @param locale - локаль для `Intl.DateTimeFormat`
 */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
