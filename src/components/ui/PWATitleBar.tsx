'use client'

import Image from 'next/image'

export default function PWATitleBar() {
  return (
    <div className="pwa-titlebar">
      <Image
        src="/logo.png"
        alt="SCC"
        width={22}
        height={22}
        className="object-contain shrink-0"
        style={{ filter: 'drop-shadow(0 0 4px rgba(85,189,251,0.5))' }}
      />
      <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
        SCC Basquet Formativo
      </span>
    </div>
  )
}
