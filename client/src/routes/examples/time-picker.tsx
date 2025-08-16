import { createFileRoute } from '@tanstack/react-router'
import TimePickerExamples from '../../examples/TimePickerExamples'

export const Route = createFileRoute('/examples/time-picker')({
  component: TimePickerExamples,
})

export default TimePickerExamples