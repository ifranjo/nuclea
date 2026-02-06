export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-white">
      {children}
    </div>
  )
}
