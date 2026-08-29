'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import styles from './Navigation.module.css'

const navItems = [{ href: '/map', label: 'Field map', icon: 'map.svg' }]

const MIN_OVERFLOW = 5

const SCROLL_THRESHOLD_BLUR = 50

export default function Navigation({
  counts,
  compact = false,
}: {
  counts: Partial<Record<string, number>>
  compact?: boolean
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(
    navItems.length - MIN_OVERFLOW
  )
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const navOuterRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const itemWidths = useRef<number[]>([])
  const scrollInfo = useRef({
    lastY: 0,
    mode: 'top' as 'top' | 'scrolling' | 'hidden' | 'revealed',
  })

  const overflowCount = navItems.length - visibleCount
  const visibleItems = navItems.slice(0, visibleCount)
  const overflowItems = navItems.slice(visibleCount)

  const calculateFromCachedWidths = useCallback(() => {
    if (!navRef.current || itemWidths.current.length === 0) return
    const navWidth = navRef.current.offsetWidth
    const overflowButtonWidth = 60
    const gap = 8
    let usedWidth = 0
    let count = 0

    for (let i = 0; i < itemWidths.current.length; i++) {
      const w = itemWidths.current[i] + gap
      if (usedWidth + w + overflowButtonWidth > navWidth) break
      usedWidth += w
      count++
    }

    const maxVisible = navItems.length - MIN_OVERFLOW
    setVisibleCount(Math.min(count, maxVisible))
  }, [])

  // Measure item widths and calculate before the browser paints — no jitter
  useLayoutEffect(() => {
    const widths: number[] = []
    for (const el of itemRefs.current) {
      if (!el) break
      widths.push(el.offsetWidth)
    }
    if (widths.length > 0) {
      itemWidths.current = widths
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: must set count before paint to prevent jitter
      calculateFromCachedWidths()
      // Reveal nav after correct count is set (CSS starts at opacity:0)
      if (navRef.current) navRef.current.style.opacity = '1'
    }
  }, [calculateFromCachedWidths])

  // Recalculate on resize using cached widths — no need to reset visibleCount
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculateFromCachedWidths()
    })
    if (navRef.current) observer.observe(navRef.current)
    return () => observer.disconnect()
  }, [calculateFromCachedWidths])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isDropdownOpen])

  useLayoutEffect(() => {
    const handleScroll = () => {
      const el = navOuterRef.current
      if (!el) return
      const y = window.scrollY
      const { lastY, mode } = scrollInfo.current
      const goingDown = y > lastY
      const goingUp = y < lastY

      if (y <= 0) {
        // At the very top - reset
        el.style.transition = 'none'
        el.style.transform = 'translateY(0)'
        scrollInfo.current.mode = 'top'
      } else if (goingDown) {
        if (mode === 'top' || mode === 'scrolling') {
          // Scrolling down from top - move naturally with the page
          const navHeight = el.offsetHeight
          if (y >= navHeight) {
            el.style.transition = 'none'
            el.style.transform = 'translateY(-100%)'
            scrollInfo.current.mode = 'hidden'
          } else {
            el.style.transition = 'none'
            el.style.transform = `translateY(-${y}px)`
            scrollInfo.current.mode = 'scrolling'
          }
        } else if (mode === 'revealed') {
          // Was revealed by scroll-up, now scrolling down again - animate away
          el.style.transition = 'transform 0.3s ease-in-out'
          el.style.transform = 'translateY(-100%)'
          scrollInfo.current.mode = 'hidden'
        }
        // 'hidden' stays hidden
      } else if (goingUp) {
        if (mode === 'hidden' || mode === 'scrolling') {
          // Scrolling up - reveal with smooth animation
          el.style.transition = 'transform 0.3s ease-in-out'
          el.style.transform = 'translateY(0)'
          scrollInfo.current.mode = 'revealed'
        }
        // Near the top, switch back to natural mode
        if (y <= 5) {
          scrollInfo.current.mode = 'top'
        }
      }

      // Toggle blur class directly on the DOM — no React render delay
      const blurClass = styles['nav-blur']
      if (y > SCROLL_THRESHOLD_BLUR) {
        el.classList.add(blurClass)
      } else {
        el.classList.remove(blurClass)
      }

      scrollInfo.current.lastY = y
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    document.documentElement.classList.remove('is-reload')
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <>
      <div
        ref={navOuterRef}
        className={`${styles.nav} ${styles['nav-fixed']} ${compact ? styles['nav-compact'] : ''}`}
      >
        <div className={styles['nav-container']}>
          <Link
            href="https://www.aisafety.com/map"
            target="_blank"
            rel="noopener noreferrer"
            className="padding-right-24px"
            style={{
              color: 'var(--bright-teal-300)',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '24px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            World Map ↗
          </Link>

          <nav ref={navRef} className={styles['nav-menu']}>
            {visibleItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles['nav-item']}
                ref={el => {
                  itemRefs.current[i] = el
                }}
              >
                <div className={styles['nav-item-icon']}>
                  <Image
                    width={16}
                    height={16}
                    alt={`${item.label} icon`}
                    src={`/images/${item.icon}`}
                  />
                </div>
                <p className="paragraph-small-bold">{item.label}</p>
                {counts[item.href] && (
                  <p className="paragraph-xs color-teal-300">
                    {counts[item.href]}
                  </p>
                )}
              </Link>
            ))}

            <div
              ref={dropdownRef}
              className={styles['nav-item-last']}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <p className="paragraph-small-bold">+{overflowCount}</p>
              {isDropdownOpen && (
                <div className={styles['nav-dropdown']}>
                  {overflowItems.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={styles['nav-dropdown-item']}
                      style={{ marginBottom: '8px' }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className={styles['nav-item-icon']}>
                        <Image
                          width={16}
                          height={16}
                          alt={`${item.label} icon`}
                          src={`/images/${item.icon}`}
                        />
                      </div>
                      <p className="paragraph-small-bold">{item.label}</p>
                      {counts[item.href] && (
                        <p className="paragraph-xs color-teal-300">
                          {counts[item.href]}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button
            className={styles['menu-button']}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`${styles.hamburger} ${isMenuOpen ? styles['hamburger-open'] : ''}`}
            >
              <span className={styles['hamburger-bar']} />
              <span className={styles['hamburger-bar']} />
              <span className={styles['hamburger-bar']} />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`${styles['mobile-menu']} ${isMenuOpen ? styles['mobile-menu-visible'] : ''}`}
      >
        <div className={styles['mobile-menu-header']}>
          <Link
            href="https://www.aisafety.com/map"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            style={{
              color: 'var(--bright-teal-300)',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '24px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            World Map ↗
          </Link>
          <button
            className={styles['menu-button']}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className={`${styles.hamburger} ${styles['hamburger-open']}`}>
              <span className={styles['hamburger-bar']} />
              <span className={styles['hamburger-bar']} />
              <span className={styles['hamburger-bar']} />
            </span>
          </button>
        </div>
        <nav className={styles['mobile-menu-items']}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={styles['nav-item']}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className={styles['nav-item-icon']}>
                <Image
                  width={16}
                  height={16}
                  alt={`${item.label} icon`}
                  src={`/images/${item.icon}`}
                />
              </div>
              <p className="paragraph-default-bold">{item.label}</p>
              {counts[item.href] && (
                <p className="paragraph-small color-teal-300">
                  {counts[item.href]}
                </p>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
