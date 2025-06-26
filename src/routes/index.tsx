import { createFileRoute } from '@tanstack/react-router'
import { PlateEditor } from '~/components/editor/plate-editor'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
      <PlateEditor />
  )
}
