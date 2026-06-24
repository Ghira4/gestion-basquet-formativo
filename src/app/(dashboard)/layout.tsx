import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

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
    <div className="flex h-screen bg-main overflow-hidden">
      <Sidebar usuario={usuario} />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: '240px' }}
        id="main-content"
      >
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
