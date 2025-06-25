import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '~/components/pages/settings';

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  return (
    <div className="w-full h-full flex">
      <SettingsPage />
    </div>
  )
}

