import { isFeatureEnabled } from '@/app/features/featureFlags'

export function EducationSection() {
  if (!isFeatureEnabled('education')) {
    return (
      <div className="p-4 bg-yellow-100 rounded-lg">
        <p className="text-yellow-800">
          This feature is coming soon!
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Education Section</h2>
      {/* Your education feature content here */}
    </div>
  )
}

export function Dashboard() {
  if (!isFeatureEnabled('dashboard')) {
    return null
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      {/* Your dashboard feature content here */}
    </div>
  )
}

export function AlertsSystem() {
  // You can also use feature flags in conditional rendering
  return isFeatureEnabled('alerts') ? (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Alerts</h2>
      {/* Your alerts feature content here */}
    </div>
  ) : null
} 