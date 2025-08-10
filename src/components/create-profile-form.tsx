import { useState } from "react";
import { useCreateUserProfile } from "~/hooks/use-user-profile";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ExclamationTriangleIcon, CheckIcon } from "@radix-ui/react-icons";

export function CreateProfileForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const createProfile = useCreateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    try {
      await createProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Clear form on success
      setFirstName("");
      setLastName("");
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold">Create Profile</h2>
          <p className="text-muted-foreground text-sm">
            Enter your first and last name to create your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={
                createProfile.isPending || !firstName.trim() || !lastName.trim()
              }
              className="w-full max-w-xs"
            >
              {createProfile.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </form>

        {/* Error Display */}
        {createProfile.isError && (
          <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
            <div className="flex items-center gap-2 text-destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Error: {createProfile.error?.message}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {createProfile.isSuccess && (
          <div className="p-4 border border-green-200 bg-green-50 rounded-md">
            <div className="flex items-center gap-2 text-green-800">
              <CheckIcon className="h-4 w-4" />
              <span>Profile created successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
