import { createFileRoute } from "@tanstack/react-router";
import { PlateEditor } from "~/components/editor/plate-editor";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useUserProfile } from "~/hooks/use-user-profile";
import { CreateProfileForm } from "~/components/create-profile-form";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";
import { useEditorState } from "~/util/editor/editorState";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

function EditorPage() {
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { currentFile, loadFileContent, saveFile } = useFileSystemState();
  const { getHtmlText } = useEditorState();
  const router = useRouter();
  const triedRestoreRef = useRef(false);

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
        const html = await getHtmlText();
        if (cancelled) return;
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
    getHtmlText,
    saveFile,
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

  return <PlateEditor />;
}
