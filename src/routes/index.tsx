import { createFileRoute } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useUserProfile } from "~/hooks/use-user-profile";
import { CreateProfileForm } from "~/components/create-profile-form";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { fetchStorageSize } from "~/lib/api";
import { formatBytes } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const {
    files,
    isLoading: filesLoading,
    setCurrentFile,
  } = useFileSystemState();
  const [storageBytes, setStorageBytes] = useState<number | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const router = useRouter();

  // Deselect any previously selected file when landing on Home
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentFile("");
    }
  }, [isAuthenticated, setCurrentFile]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const size = await fetchStorageSize(token);
        if (!canceled) setStorageBytes(size);
      } catch (e) {
        if (!canceled)
          setStorageError(
            e instanceof Error ? e.message : "Failed to load storage size"
          );
      }
    };
    if (isAuthenticated) run();
    return () => {
      canceled = true;
    };
  }, [isAuthenticated, getToken]);

  const noteCount = useMemo(() => Object.keys(files).length, [files]);
  if (isLoading) {
    return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  if (profileLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <CreateProfileForm />;
  }

  const used = storageBytes ?? 0;
  const max = profile.maxStorage ?? 0;
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="text-2xl font-semibold">
        Hello {profile.firstName} {profile.lastName}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Notes</div>
          <div className="text-3xl font-bold mt-1">
            {filesLoading ? "…" : noteCount}
          </div>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Storage Used</div>
          <div className="text-3xl font-bold">
            {storageBytes === null
              ? storageError
                ? "—"
                : "…"
              : formatBytes(used)}
            {max > 0 && storageBytes !== null && (
              <span className="text-base text-muted-foreground ml-2">
                of {formatBytes(max)}
              </span>
            )}
          </div>
          {max > 0 && <Progress value={pct} />}
          {storageError && (
            <div className="text-xs text-red-600 mt-1">{storageError}</div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Use the sidebar to create a new note or open an existing one.
      </div>
    </div>
  );
}
