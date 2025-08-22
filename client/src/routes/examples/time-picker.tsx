import { createFileRoute } from '@tanstack/react-router'
import TimePickerExample from '../../components/base/TimePicker.example'

export const Route = createFileRoute('/examples/time-picker')({
  component: TimePickerExample,
})