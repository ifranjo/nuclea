export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] overflow-y-auto overflow-x-hidden bg-white">
      {children}
    </div>
  )
}
