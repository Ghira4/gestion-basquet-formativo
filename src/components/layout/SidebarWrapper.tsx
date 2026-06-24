'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { SidebarInner } from './Sidebar'

interface Props {
  usuario: { nombre: string; apellido: string; dni: string } | null
}

export default function SidebarWrapper({ usuario }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [isDark, setIsDark] = useState(true)

  // Sincroniza el ancho con una CSS var en :root
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', expanded ? '240px' : '68px')
  }, [expanded])

  // Carga preferencia guardada
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const dark = saved !== 'light'
    setIsDark(dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('light', !next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <>
      {/* Mobile overlay */}
      {expanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu size={19} style={{ color: 'var(--primary)' }} />
      </button>

      {/* Fixed sidebar */}
      <div
        className="fixed left-0 top-0 h-full z-40 sidebar"
        style={{ width: expanded ? '240px' : '68px' }}
      >
        <SidebarInner
          usuario={usuario}
          expanded={expanded}
          setExpanded={setExpanded}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      </div>
    </>
  )
}
