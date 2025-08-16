import { createFileRoute } from '@tanstack/react-router'
import SlidingDrawerTest from '../../examples/SlidingDrawerTest'

export const Route = createFileRoute('/examples/test')({
  component: SlidingDrawerTest,
})

export default SlidingDrawerTest