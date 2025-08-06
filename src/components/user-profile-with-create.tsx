import { useUserProfileWithCreateForm } from "~/hooks/use-user-profile";
import { CreateProfileForm } from "./create-profile-form";
import { Button } from "~/components/ui/button";
import { ExclamationTriangleIcon, PersonIcon } from "@radix-ui/react-icons";

export function UserProfileWithCreate() {
  const {
    profile,
    isLoading,
    isProfileNotFound,
    isOtherError,
    shouldShowCreateForm,
    error,
    refetch,
  } = useUserProfileWithCreateForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (isOtherError) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <div className="flex items-center gap-2 text-destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>Error loading profile: {error?.message}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Show create profile form if profile not found (404)
  if (shouldShowCreateForm) {
    return (
      <div className="space-y-6">
        <div className="p-4 border border-muted bg-muted/10 rounded-md">
          <div className="flex items-center gap-2">
            <PersonIcon className="h-4 w-4" />
            <span>
              Profile not found. Please create your profile to continue.
            </span>
          </div>
        </div>
        <CreateProfileForm />
      </div>
    );
  }

  // Show existing profile if found
  if (profile) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">User Profile</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">User ID:</span> {profile.userId}
          </div>
          <div>
            <span className="font-medium">Name:</span> {profile.firstName}{" "}
            {profile.lastName}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            {profile.isActive ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Modified:</span>{" "}
            {new Date(profile.lastModifiedDate).toLocaleDateString()}
          </div>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh Profile
        </Button>
      </div>
    );
  }

  return null;
}
