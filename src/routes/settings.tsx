import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "~/components/pages/settings";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <div className="text-sm text-muted-foreground">Loading settings…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full h-full flex">
      <SettingsPage />
    </div>
  );
}
