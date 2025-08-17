import { createFileRoute } from '@tanstack/react-router'
import PhotoManagement from '@/components/PhotoManagement'

export const Route = createFileRoute('/dashboard/photos')({
  component: PhotoManagement,
})