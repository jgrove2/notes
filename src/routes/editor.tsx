import { createFileRoute } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import TiptapEditor from "~/components/editor/TipTapEditor";
import { useUserProfile } from "~/hooks/use-user-profile";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { CreateProfileForm } from "~/components/create-profile-form";
import { useCurrentEditor } from "@tiptap/react";

export const Route = createFileRoute("/editor")({
  component: TiptapPage,
});

function TiptapPage() {
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { currentFile, loadFileContent, saveFile } = useFileSystemState();
  const { editor } = useCurrentEditor();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, router]);
  // Autosave every 10 seconds when a file is open and autosave enabled
  useEffect(() => {
    if (!isAuthenticated || !currentFile || profile?.autoSave === false) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const html = editor?.getHTML();
        if (cancelled) return;
        if (!html) throw new Error("No HTML content");
        await saveFile(currentFile, html, token);
      } catch (e) {
        console.error("Autosave failed:", e);
      }
    };

    const intervalMs = Math.max(5, profile?.autoSaveDuration ?? 30) * 1000;
    const id = setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [
    isAuthenticated,
    currentFile,
    profile?.autoSave,
    profile?.autoSaveDuration,
    getToken,
    saveFile,
    editor,
  ]);
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
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

  return <TiptapEditor />;
}
