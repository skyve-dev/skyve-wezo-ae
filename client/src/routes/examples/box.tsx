import { createFileRoute } from '@tanstack/react-router'
import { BoxExample } from '../../components/base/Box.example'

export const Route = createFileRoute('/examples/box')({
  component: BoxExample,
})