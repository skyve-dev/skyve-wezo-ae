import { createFileRoute } from '@tanstack/react-router'
import { InputExample } from '../../components/base/Input.example'

export const Route = createFileRoute('/examples/input')({
  component: InputExample,
})