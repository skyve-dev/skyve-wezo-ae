import { createFileRoute } from '@tanstack/react-router'
import { BoxExamplePage } from '@/components/examples/BoxExamplePage'

export const Route = createFileRoute('/example/Box')({
  component: BoxExamplePage,
})