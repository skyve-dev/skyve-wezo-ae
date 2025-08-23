import { createFileRoute } from '@tanstack/react-router'
import AppShellExample from '../../components/base/AppShell/AppShell.example'

export const Route = createFileRoute('/examples/app-shell')({
  component: AppShellExample,
})