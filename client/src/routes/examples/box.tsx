import { createFileRoute } from '@tanstack/react-router'
import BoxExamples from '../../examples/BoxExamples'

export const Route = createFileRoute('/examples/box')({
  component: BoxExamples,
})