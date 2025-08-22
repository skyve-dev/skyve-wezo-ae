import { createFileRoute } from '@tanstack/react-router'
import { ButtonExample } from '../../components/base/Button.example'

export const Route = createFileRoute('/examples/button')({
  component: ButtonExample,
})