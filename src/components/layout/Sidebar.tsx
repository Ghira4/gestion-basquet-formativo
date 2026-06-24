'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart, Package, Calendar, Wallet, TrendingDown,
  TrendingUp, BarChart3, User, LogOut, ChevronLeft, ChevronRight, Menu,
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
]

interface SidebarProps {
  usuario: { nombre: string; apellido: string; dni: string } | null
  expanded: boolean
  setExpanded: (v: boolean) => void
}

export function SidebarInner({ usuario, expanded, setExpanded }: SidebarProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full sidebar"
        style={{
          width: expanded ? '240px' : '68px',
          background: 'linear-gradient(180deg, rgba(14,38,60,0.99) 0%, rgba(10,28,46,0.99) 100%)',
          borderRight: '1px solid var(--glass-border)',
          backdropFilter: 'blur(24px)',
          flexShrink: 0,
        }}
      >
        {/* Header logo */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: '1px solid rgba(85,189,251,0.12)' }}
        >
          <div className="relative shrink-0" style={{ width: 38, height: 38 }}>
            <Image src="/logo.png" alt="SCC" fill className="object-contain drop-shadow-lg" />
          </div>
          {expanded && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap tracking-tight">SCC</p>
              <p className="leading-tight whitespace-nowrap" style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 500 }}>
                Basquet Formativo
              </p>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/8"
            style={{ color: 'var(--text-muted)', marginLeft: expanded ? 'auto' : undefined }}
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
                    ? 'linear-gradient(135deg, rgba(85,189,251,0.15) 0%, rgba(85,189,251,0.08) 100%)'
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

        {/* Footer usuario + logout */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(85,189,251,0.1)' }}>
          {expanded && usuario && (
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-3 mb-2"
              style={{ background: 'rgba(85,189,251,0.06)', border: '1px solid rgba(85,189,251,0.12)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: 'rgba(85,189,251,0.2)', color: 'var(--primary)' }}
              >
                {usuario.nombre[0]}{usuario.apellido[0]}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-white leading-tight truncate">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                  DNI {usuario.dni}
                </p>
              </div>
            </div>
          )}

          {!expanded && usuario && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 text-xs font-bold"
              style={{ background: 'rgba(85,189,251,0.15)', color: 'var(--primary)' }}
            >
              {usuario.nombre[0]}{usuario.apellido[0]}
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 w-full rounded-xl transition-all"
            style={{
              padding: expanded ? '9px 12px' : '9px 0',
              justifyContent: expanded ? 'flex-start' : 'center',
              color: '#f87171',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title={!expanded ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {expanded && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
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
                <h3 className="font-semibold text-white">Cerrar sesión</h3>
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

export default function Sidebar({ usuario }: { usuario: { nombre: string; apellido: string; dni: string } | null }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      {/* Mobile overlay */}
      {expanded && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setExpanded(false)} />
      )}

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu size={19} style={{ color: 'var(--primary)' }} />
      </button>

      {/* Fixed sidebar wrapper */}
      <div
        className="fixed left-0 top-0 h-full z-40 sidebar"
        style={{ width: expanded ? '240px' : '68px' }}
      >
        <SidebarInner usuario={usuario} expanded={expanded} setExpanded={setExpanded} />
      </div>
    </>
  )
}
