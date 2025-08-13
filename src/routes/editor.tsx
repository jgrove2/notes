import { createFileRoute } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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
  const { currentFile, saveFile, isSaving } = useFileSystemState();
  const { editor } = useCurrentEditor();
  const router = useRouter();

  // Track the last-saved HTML to avoid redundant saves
  const lastSavedHtmlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, router]);

  // Initialize lastSavedHtmlRef once the editor is ready or when switching files
  useEffect(() => {
    if (!editor) return;
    lastSavedHtmlRef.current = editor.getHTML();
  }, [editor, currentFile]);

  // Timer-based autosave regardless of editor update events
  useEffect(() => {
    if (!isAuthenticated || !currentFile) return;

    const intervalMs = Math.max(5, profile?.autoSaveDuration ?? 30) * 1000;

    let cancelled = false;
    const id = setInterval(async () => {
      try {
        if (cancelled) return;
        if (!isAuthenticated || !currentFile) return;
        if (!editor) return;
        if (isSaving) return;

        const token = await getToken();
        if (!token) return;

        const html = editor.getHTML();
        if (!html) return;
        if (lastSavedHtmlRef.current === html) {
          return;
        }

        await saveFile(currentFile, html, token);
        lastSavedHtmlRef.current = html;
      } catch (e) {
        console.error("Autosave failed:", e);
      }
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
    editor,
    getToken,
    saveFile,
    isSaving,
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
