'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart, Package, Calendar, Wallet, TrendingDown,
  TrendingUp, BarChart3, User, LogOut, ChevronLeft, ChevronRight, Menu, Sun, Moon, BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/ventas',    label: 'Ventas',    icon: ShoppingCart },
  { href: '/stock',     label: 'Stock',     icon: Package },
  { href: '/eventos',   label: 'Eventos',   icon: Calendar },
  { href: '/cajas',     label: 'Cajas',     icon: Wallet },
  { href: '/gastos',    label: 'Gastos',    icon: TrendingDown },
  { href: '/ingresos',  label: 'Ingresos',  icon: TrendingUp },
  { href: '/informes',  label: 'Informes',  icon: BarChart3 },
  { href: '/mi-cuenta', label: 'Mi cuenta', icon: User },
  { href: '/ayuda',     label: 'Ayuda',     icon: BookOpen },
]

interface SidebarProps {
  usuario: { nombre: string; apellido: string; dni: string } | null
  expanded: boolean
  setExpanded: (v: boolean) => void
  isDark: boolean
  toggleTheme: () => void
}

export function SidebarInner({ usuario, expanded, setExpanded, isDark, toggleTheme }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = usuario ? `${usuario.nombre[0]}${usuario.apellido[0]}` : '?'

  return (
    <>
      <aside
        className="flex flex-col h-full sidebar"
        style={{
          width: expanded ? '240px' : '68px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--glass-border)',
          backdropFilter: 'blur(24px)',
          flexShrink: 0,
        }}
      >
        {/* Header logo */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <div className="relative shrink-0" style={{ width: 38, height: 38 }}>
            <Image src="/logo.png" alt="SCC" fill className="object-contain drop-shadow-lg" />
          </div>
          {expanded && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold leading-tight whitespace-nowrap tracking-tight" style={{ color: 'var(--text)' }}>SCC</p>
              <p className="leading-tight whitespace-nowrap" style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 500 }}>
                Basquet Formativo
              </p>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)', marginLeft: expanded ? 'auto' : undefined }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {expanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => window.innerWidth < 1024 && setExpanded(false)}
                className="flex items-center gap-3 rounded-xl transition-all group relative"
                style={{
                  padding: expanded ? '10px 14px' : '10px 0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: active
                    ? 'linear-gradient(135deg, rgba(85,189,251,0.18) 0%, rgba(85,189,251,0.08) 100%)'
                    : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  borderLeft: active ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                  boxShadow: active ? '0 0 12px rgba(85,189,251,0.08)' : 'none',
                }}
                title={!expanded ? label : undefined}
              >
                <Icon size={18} className="shrink-0" style={{ opacity: active ? 1 : 0.7 }} />
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap" style={{ opacity: active ? 1 : 0.85 }}>
                    {label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer: usuario + acciones */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
          {expanded ? (
            /* Expandido: tarjeta con nombre + botones inline */
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(85,189,251,0.06)', border: '1px solid var(--glass-border)' }}
            >
              {/* Fila usuario */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(85,189,251,0.2)', color: 'var(--primary)' }}
                >
                  {initials}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                    DNI {usuario?.dni}
                  </p>
                </div>
              </div>
              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(85,189,251,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  title={isDark ? 'Modo claro' : 'Modo oscuro'}
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                  {isDark ? 'Claro' : 'Oscuro'}
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all"
                  style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={13} />
                  Salir
                </button>
              </div>
            </div>
          ) : (
            /* Colapsado: avatar + botones icono apilados */
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(85,189,251,0.15)', color: 'var(--primary)' }}
              >
                {initials}
              </div>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(85,189,251,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ color: '#f87171' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Modal logout */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <LogOut size={20} style={{ color: '#f87171' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Cerrar sesión</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>¿Estás seguro que querés salir?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-ghost flex-1" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              <button className="btn-danger flex-1" onClick={handleLogout}>Sí, salir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
