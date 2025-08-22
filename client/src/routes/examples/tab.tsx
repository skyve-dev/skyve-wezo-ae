import { createFileRoute } from '@tanstack/react-router'
import TabExample from '../../components/base/Tab.example'

export const Route = createFileRoute('/examples/tab')({
  component: TabExample,
})