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
}

export default function Sidebar({ usuario }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
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
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <Menu size={20} style={{ color: 'var(--primary)' }} />
      </button>

      {/* Overlay mobile */}
      {expanded && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setExpanded(false)} />
      )}

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col sidebar"
        style={{
          width: expanded ? '240px' : '64px',
          background: 'linear-gradient(180deg, rgba(17,45,69,0.98) 0%, rgba(12,35,55,0.98) 100%)',
          borderRight: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
            <Image src="/logo.png" alt="SCC" fill className="object-contain" />
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white leading-tight whitespace-nowrap">SCC</p>
              <p className="text-xs leading-tight whitespace-nowrap" style={{ color: 'var(--primary)', fontSize: '0.7rem' }}>
                Basquet Formativo
              </p>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto shrink-0 p-1 rounded-lg transition-colors hover:bg-white/5 hidden lg:block"
            style={{ color: 'var(--text-muted)' }}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => window.innerWidth < 1024 && setExpanded(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group"
                style={{
                  background: active ? 'rgba(85,189,251,0.12)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
                }}
                title={!expanded ? label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer: usuario + logout */}
        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
          {expanded && usuario && (
            <div className="glass-sm px-3 py-2.5 mb-2">
              <p className="text-xs font-semibold text-white leading-tight truncate">
                {usuario.nombre} {usuario.apellido}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                DNI {usuario.dni}
              </p>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/10"
            style={{ color: '#f87171' }}
            title={!expanded ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {expanded && <span className="text-sm font-medium">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="glass-card p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)' }}>
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
