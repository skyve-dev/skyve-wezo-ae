import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/components/Dashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
})

function DashboardIndexPage() {
  return <Dashboard />
}