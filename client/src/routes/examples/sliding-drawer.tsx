import { createFileRoute } from '@tanstack/react-router'
import SlidingDrawerExample from '../../components/base/SlidingDrawer.example'

export const Route = createFileRoute('/examples/sliding-drawer')({
  component: SlidingDrawerExample,
})