'use client'

import styles from './page.module.css'

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// 'YYYY-MM' -> 'Aug 2026'
export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`
}

// Inclusive list of 'YYYY-MM' from start to end.
export function monthRange(start: string, end: string): string[] {
  const months: string[] = []
  let [year, month] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

interface TimelineProps {
  months: string[]
  index: number
  onIndexChange: (index: number) => void
  playing: boolean
  onPlayToggle: () => void
  visibleCount: number
}

export default function Timeline({
  months,
  index,
  onIndexChange,
  playing,
  onPlayToggle,
  visibleCount,
}: TimelineProps) {
  if (months.length < 2) return null

  const current = months[index]

  return (
    <div className={styles['timeline']}>
      <button
        type="button"
        className={styles['timeline-play']}
        onClick={onPlayToggle}
        title={playing ? 'Pause' : 'Play the growth of the map over time'}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <rect x="4" y="3" width="3" height="10" fill="white" rx="1" />
            <rect x="9" y="3" width="3" height="10" fill="white" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 3.5l7 4.5-7 4.5V3.5z" fill="white" />
          </svg>
        )}
      </button>

      <input
        type="range"
        className={styles['timeline-slider']}
        min={0}
        max={months.length - 1}
        step={1}
        value={index}
        onChange={e => onIndexChange(Number(e.target.value))}
        aria-label="Show the map as of this month"
      />

      <div className={styles['timeline-readout']}>
        <span className={styles['timeline-month']}>{formatMonth(current)}</span>
        <span className={styles['timeline-count']}>
          {visibleCount} {visibleCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>
    </div>
  )
}
