import { createFileRoute } from "@tanstack/react-router";
import { PlateEditor } from "~/components/editor/plate-editor";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUserProfile } from "~/hooks/use-user-profile";
import { CreateProfileForm } from "~/components/create-profile-form";
import { useFileSystemState } from "~/util/fileSystem/useFileSystem";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

function EditorPage() {
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { currentFile, loadFileContent } = useFileSystemState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
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
