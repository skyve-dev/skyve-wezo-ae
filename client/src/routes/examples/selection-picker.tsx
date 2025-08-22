import { createFileRoute } from '@tanstack/react-router'
import SelectionPickerExample from '../../components/base/SelectionPicker.example'

export const Route = createFileRoute('/examples/selection-picker')({
  component: SelectionPickerExample,
})