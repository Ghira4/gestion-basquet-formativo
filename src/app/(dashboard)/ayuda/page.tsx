'use client'

import { useState } from 'react'
import {
  ShoppingCart, Package, Calendar, Wallet, TrendingDown, TrendingUp,
  BarChart3, User, Download, BookOpen, ChevronDown, ChevronUp,
} from 'lucide-react'

const SECCIONES = [
  {
    id: 'general',
    icon: BookOpen,
    titulo: 'Introducción general',
    contenido: [
      {
        subtitulo: '¿Qué es este sistema?',
        texto: 'El sistema de Gestión Basquet Formativo es una aplicación web diseñada para el cuerpo técnico y administrativo del Sport Club Cañadense. Permite gestionar las ventas del buffet, el stock de productos, los eventos deportivos, las cajas de dinero, los gastos, los ingresos y generar informes detallados.',
      },
      {
        subtitulo: 'Acceso al sistema',
        texto: 'Para acceder, ingresá tu DNI y contraseña en la pantalla de inicio. Si es tu primera vez, creá una cuenta con tus datos personales. Todos los usuarios registrados tienen acceso completo a todos los módulos del sistema.',
      },
      {
        subtitulo: 'Navegación',
        texto: 'Usá el menú lateral (sidebar) para moverte entre módulos. Podés contraerlo tocando la flecha para ganar espacio en pantalla. En la parte inferior del sidebar encontrás tu nombre, el botón para cambiar entre modo oscuro/claro y el botón para cerrar sesión.',
      },
    ],
  },
  {
    id: 'ventas',
    icon: ShoppingCart,
    titulo: 'Ventas (Buffet / POS)',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Ventas es el punto de venta (POS) del buffet. Desde acá podés registrar cada venta que se realiza durante un evento de forma rápida y sencilla.',
      },
      {
        subtitulo: 'Cómo registrar una venta',
        texto: '1. Seleccioná un evento activo desde el selector en la parte superior.\n2. Tocá los productos que el cliente quiere comprar — aparecerán en el carrito de la derecha.\n3. Podés aumentar o disminuir la cantidad con los botones + y −.\n4. Cuando el carrito esté completo, tocá "Cobrar".\n5. En el modal de pago, ingresá cuánto paga en efectivo y cuánto por transferencia. Usá los botones "Todo efectivo" o "Todo transferencia" para llenar el monto automáticamente.\n6. Confirmá la venta.',
      },
      {
        subtitulo: 'Historial de ventas',
        texto: 'En la parte inferior de la pantalla de ventas podés ver el historial del día con todas las ventas registradas, sus montos y si fueron canceladas.',
      },
      {
        subtitulo: 'Cancelar una venta',
        texto: 'Si necesitás anular una venta, tocá el ícono de cancelar (X rojo) en el historial. La venta se marcará como cancelada y no afectará los totales.',
      },
    ],
  },
  {
    id: 'stock',
    icon: Package,
    titulo: 'Stock',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Stock muestra todos los productos disponibles para vender en el buffet, organizados por categoría. Desde acá podés crear, editar y activar/desactivar productos.',
      },
      {
        subtitulo: 'Crear un producto',
        texto: '1. Tocá "Nuevo producto".\n2. Completá el nombre, categoría, precio de venta, costo de compra y stock inicial.\n3. El sistema calcula automáticamente el porcentaje de ganancia.\n4. Confirmá para guardar el producto.',
      },
      {
        subtitulo: 'Editar un producto',
        texto: 'Tocá el ícono de lápiz en la fila del producto que querés modificar. Podés cambiar el precio, el stock u otros datos y guardar los cambios.',
      },
      {
        subtitulo: 'Alerta de stock bajo',
        texto: 'Cuando un producto tiene 3 unidades o menos, aparece con una etiqueta amarilla de advertencia para que sepas que necesita reposición.',
      },
      {
        subtitulo: 'Activar / desactivar',
        texto: 'Podés desactivar un producto temporalmente (por ejemplo si se agotó) sin eliminarlo. Los productos inactivos no aparecen en la pantalla de ventas pero quedan registrados en el sistema.',
      },
    ],
  },
  {
    id: 'eventos',
    icon: Calendar,
    titulo: 'Eventos',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'Los eventos representan los partidos o torneos donde se usa el buffet. Cada venta se asocia a un evento para poder hacer un seguimiento financiero por fecha o partido.',
      },
      {
        subtitulo: 'Crear un evento',
        texto: 'Tocá "Nuevo evento", ingresá el nombre (ej: "Fecha 16 Masculino") y confirmá. El evento queda en estado "En curso" y listo para recibir ventas.',
      },
      {
        subtitulo: 'Cerrar un evento',
        texto: 'Una vez que el partido o torneo termina, cerrá el evento tocando "Cerrar evento". Un evento cerrado no admite nuevas ventas asociadas. Los eventos cerrados quedan en el historial.',
      },
      {
        subtitulo: 'Múltiples eventos simultáneos',
        texto: 'El sistema permite tener varios eventos abiertos al mismo tiempo. Al registrar una venta, seleccionás a cuál evento corresponde.',
      },
    ],
  },
  {
    id: 'cajas',
    icon: Wallet,
    titulo: 'Cajas',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Cajas muestra el saldo actual de las tres cajas del club y permite mover dinero entre ellas.',
      },
      {
        subtitulo: 'Las tres cajas',
        texto: '• Efectivo: el dinero físico en mano del buffet.\n• Transferencia: el dinero recibido por transferencias bancarias.\n• Club: la caja general del club (dinero que se entrega al club).',
      },
      {
        subtitulo: 'Cómo se calculan los saldos',
        texto: 'Los saldos se calculan automáticamente sumando todas las ventas e ingresos y restando todos los gastos y movimientos. No necesitás ingresar el saldo manualmente.',
      },
      {
        subtitulo: 'Mover fondos entre cajas',
        texto: '1. Tocá "Mover fondos".\n2. Seleccioná la caja de origen y la de destino.\n3. Ingresá el monto. Usá el botón "Mover todo" para trasladar el saldo completo de la caja de origen.\n4. Podés agregar una descripción opcional y confirmar.',
      },
    ],
  },
  {
    id: 'gastos',
    icon: TrendingDown,
    titulo: 'Gastos',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Gastos registra todos los egresos de dinero del club. Tiene dos pestañas: el costo del buffet (automático) y otros gastos (manual).',
      },
      {
        subtitulo: 'Pestaña Buffet (mercadería)',
        texto: 'Esta pestaña se llena automáticamente con el costo de los productos vendidos. Muestra por producto cuánto se gastó en mercadería, cuánto se recaudó y cuál fue la ganancia. Podés filtrar por evento.',
      },
      {
        subtitulo: 'Pestaña Otros gastos',
        texto: 'Acá registrás gastos manuales como sueldos, árbitros, compras especiales, etc.\n1. Tocá "Registrar gasto".\n2. Elegí la categoría (Mercadería, Sueldo, Árbitros, Otro).\n3. Ingresá la descripción, monto, de qué caja sale y la fecha.\n4. Podés asociarlo a un evento o dejarlo sin evento.',
      },
    ],
  },
  {
    id: 'ingresos',
    icon: TrendingUp,
    titulo: 'Ingresos',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Ingresos registra todo el dinero que entra al club. Tiene dos pestañas: las ventas del buffet (automáticas) y otros ingresos (manual).',
      },
      {
        subtitulo: 'Pestaña Buffet',
        texto: 'Muestra automáticamente todas las ventas del buffet con el detalle de cada transacción: qué se vendió, cuánto se cobró en efectivo y cuánto por transferencia. Podés filtrar por evento.',
      },
      {
        subtitulo: 'Pestaña Otros ingresos',
        texto: 'Para registrar ingresos que no son del buffet, como publicidades, entradas a eventos, donaciones, etc.\n1. Tocá "Registrar ingreso".\n2. Elegí la categoría y completá los datos.\n3. Indicá en qué caja entra el dinero.',
      },
    ],
  },
  {
    id: 'informes',
    icon: BarChart3,
    titulo: 'Informes',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'El módulo de Informes genera análisis y resúmenes financieros del club. Podés ver los datos por evento específico, por rango de fechas o el resumen general.',
      },
      {
        subtitulo: 'Modos de informe',
        texto: '• Por evento: seleccionás un evento y ves todos sus números.\n• Por período: filtrás por rango de fechas.\n• General: todos los datos históricos del sistema.',
      },
      {
        subtitulo: 'Indicadores principales',
        texto: 'Resultado neto, ventas brutas del buffet, otros ingresos, gastos totales, cantidad de ventas realizadas e ítems vendidos.',
      },
      {
        subtitulo: 'Gráficos',
        texto: '• Torta: ventas del buffet por categoría de producto.\n• Torta: gastos por categoría.\n• Barras: comparación de ingresos vs gastos.\n• Línea: ventas por hora del día.\n• Top 10 productos más vendidos.',
      },
      {
        subtitulo: 'Exportar datos',
        texto: 'Usá el botón "Excel" para descargar el informe en formato planilla (4 hojas: resumen, ventas, gastos, ingresos). Usá el botón "PDF" para descargar un informe en formato documento listo para imprimir.',
      },
    ],
  },
  {
    id: 'micuenta',
    icon: User,
    titulo: 'Mi cuenta',
    contenido: [
      {
        subtitulo: '¿Para qué sirve?',
        texto: 'Desde este módulo podés editar tu nombre y apellido. El DNI y la fecha de nacimiento son datos de solo lectura que no se pueden modificar.',
      },
      {
        subtitulo: 'Cambiar datos',
        texto: 'Modificá el campo que querés actualizar y tocá "Guardar cambios". Los cambios se reflejan inmediatamente en el sidebar.',
      },
    ],
  },
]

function Seccion({ s }: { s: typeof SECCIONES[0] }) {
  const [abierto, setAbierto] = useState(false)
  const Icon = s.icon

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center gap-4 p-5 text-left transition-all"
        style={{ color: 'var(--text)' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(85,189,251,0.04)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(85,189,251,0.12)', color: 'var(--primary)' }}>
          <Icon size={18} />
        </div>
        <span className="flex-1 font-semibold text-base" style={{ color: 'var(--text)' }}>{s.titulo}</span>
        {abierto ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {abierto && (
        <div className="px-5 pb-5 flex flex-col gap-5" style={{ borderTop: '1px solid var(--glass-border)' }}>
          {s.contenido.map((item, i) => (
            <div key={i} className="pt-4">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
                {item.subtitulo}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AyudaPage() {
  const [generando, setGenerando] = useState(false)

  async function descargarPDF() {
    setGenerando(true)
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentW = pageW - margin * 2
    let y = 20

    function checkPage(needed = 10) {
      if (y + needed > 270) { doc.addPage(); y = 20 }
    }

    // Portada
    doc.setFillColor(12, 35, 55)
    doc.rect(0, 0, pageW, 297, 'F')
    doc.setTextColor(85, 189, 251)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Manual de Usuario', pageW / 2, 80, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(200, 220, 240)
    doc.text('Sistema de Gestión Basquet Formativo', pageW / 2, 95, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(120, 160, 200)
    doc.text('Sport Club Cañadense', pageW / 2, 108, { align: 'center' })
    doc.setFontSize(9)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageW / 2, 270, { align: 'center' })

    doc.addPage()
    doc.setFillColor(12, 35, 55)
    doc.rect(0, 0, pageW, 297, 'F')
    y = 20

    for (const seccion of SECCIONES) {
      checkPage(20)

      // Título de sección
      doc.setFillColor(85, 189, 251)
      doc.rect(margin, y, 4, 8, 'F')
      doc.setTextColor(85, 189, 251)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(seccion.titulo, margin + 8, y + 6)
      y += 14

      for (const item of seccion.contenido) {
        checkPage(16)

        doc.setTextColor(150, 200, 240)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(item.subtitulo, margin, y)
        y += 6

        doc.setTextColor(180, 210, 235)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const lines = doc.splitTextToSize(item.texto, contentW)
        for (const line of lines) {
          checkPage(5)
          doc.text(line, margin, y)
          y += 5
        }
        y += 4
      }

      y += 6
    }

    // Footer en cada página
    const totalPages = (doc.internal as any).getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setTextColor(80, 120, 160)
      doc.setFontSize(8)
      doc.text(`SCC Basquet Formativo — Pág. ${p} de ${totalPages}`, pageW / 2, 290, { align: 'center' })
    }

    doc.save('Manual_SCC_Basquet_Formativo.pdf')
    setGenerando(false)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Ayuda</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manual de uso del sistema de gestión
          </p>
        </div>
        <button
          onClick={descargarPDF}
          disabled={generando}
          className="btn-primary"
        >
          {generando
            ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <Download size={16} />
          }
          {generando ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Intro rápida */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-start gap-4"
        style={{ background: 'rgba(85,189,251,0.08)', border: '1px solid var(--glass-border)' }}
      >
        <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(85,189,251,0.15)', color: 'var(--primary)' }}>
          <BookOpen size={20} />
        </div>
        <div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Cómo usar esta guía</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Tocá cualquier sección para expandirla y leer su contenido. También podés descargar el manual completo en PDF usando el botón de arriba.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {SECCIONES.map(s => <Seccion key={s.id} s={s} />)}
      </div>
    </div>
  )
}
