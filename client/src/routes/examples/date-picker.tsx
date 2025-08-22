import { createFileRoute } from '@tanstack/react-router'
import {DatePickerExample} from '../../components/base/DatePicker.example'

export const Route = createFileRoute('/examples/date-picker')({
  component: DatePickerExample,
})