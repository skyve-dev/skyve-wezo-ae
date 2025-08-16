import { createFileRoute } from '@tanstack/react-router'
import SelectionPickerExamples from '../../examples/SelectionPickerExamples'

export const Route = createFileRoute('/examples/selection-picker')({
  component: SelectionPickerExamples,
})