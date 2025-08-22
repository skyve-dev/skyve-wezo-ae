import { createFileRoute } from '@tanstack/react-router'
import { NumberStepperInputExample } from '../../components/base/NumberStepperInput.example'

export const Route = createFileRoute('/examples/number-stepper')({
  component: NumberStepperInputExample,
})