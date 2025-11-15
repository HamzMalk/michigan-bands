'use client'

import { useEffect } from 'react'

export default function HeaderTintController() {
  useEffect(() => {
    const header = document.querySelector('[data-app-header]') as HTMLElement | null
    if (!header) return
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      if (y > 8) header.classList.add('scrolled')
      else header.classList.remove('scrolled')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}

