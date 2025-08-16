import { createFileRoute } from '@tanstack/react-router'
import DatePickerExamples from '../../examples/DatePickerExamples'

export const Route = createFileRoute('/examples/date-picker')({
  component: DatePickerExamples,
})

export default DatePickerExamples