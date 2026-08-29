'use client'

import { useEffect, useRef, useState } from 'react'
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

// How long the expanded control stays open on mobile without any interaction.
const IDLE_COLLAPSE_MS = 5000

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
  // On mobile the full control eats a third of the map, so it collapses to a
  // chip showing just the month. Desktop ignores this and is always expanded
  // (see the display rules in page.module.css).
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Touching the map (panning, zooming, tapping a pin) puts the chip back.
  useEffect(() => {
    if (!expanded) return

    const handlePointerDown = (e: PointerEvent) => {
      const container = containerRef.current
      if (container && !container.contains(e.target as Node)) {
        setExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [expanded])

  // Collapse again once it has been sitting idle. While playing, `index` keeps
  // changing, which restarts the timer — so playback is never interrupted.
  useEffect(() => {
    if (!expanded) return
    const timer = setTimeout(() => setExpanded(false), IDLE_COLLAPSE_MS)
    return () => clearTimeout(timer)
  }, [expanded, index])

  if (months.length < 2) return null

  const current = months[index]

  return (
    <div
      ref={containerRef}
      className={`${styles['timeline']} ${expanded ? styles['timeline-expanded'] : ''}`}
    >
      <button
        type="button"
        className={styles['timeline-chip']}
        onClick={() => setExpanded(true)}
        aria-expanded={expanded}
        title="Show the map over time"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 4.75V8l2.25 1.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {formatMonth(current)}
      </button>

      <div className={styles['timeline-controls']}>
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
          <span className={styles['timeline-month']}>
            {formatMonth(current)}
          </span>
          <span className={styles['timeline-count']}>
            {visibleCount} {visibleCount === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>
    </div>
  )
}
