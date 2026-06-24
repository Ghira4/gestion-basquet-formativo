import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarWrapper from '@/components/layout/SidebarWrapper'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre, apellido, dni')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-main">
      <SidebarWrapper usuario={usuario} />
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingLeft: 'var(--sidebar-w, 240px)',
          transition: 'padding-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
