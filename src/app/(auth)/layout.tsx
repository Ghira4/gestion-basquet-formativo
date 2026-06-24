export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-main">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 10%, rgba(85,189,251,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 70% 90%, rgba(42,157,232,0.10) 0%, transparent 45%)
          `,
        }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
