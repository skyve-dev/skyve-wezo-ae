import { createFileRoute } from '@tanstack/react-router'
import SlidingDrawerExamples from '../../examples/SlidingDrawerExamples'

export const Route = createFileRoute('/examples/sliding-drawer')({
  component: SlidingDrawerExamples,
})