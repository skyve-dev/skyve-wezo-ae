import { createFileRoute } from '@tanstack/react-router'
import DialogExample from '../../components/base/Dialog.example'

export const Route = createFileRoute('/examples/dialog')({
  component: DialogExample,
})