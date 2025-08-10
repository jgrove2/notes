import { useForm } from "react-hook-form";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserProfile } from "~/hooks/use-user-profile";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { fetchWithAuth } from "~/lib/api";
import { useEffect, useState } from "react";

const FormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  autoSave: z.boolean().optional(),
  autoSaveDuration: z
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(5, "Min 5 seconds")
    .max(3600, "Max 3600 seconds")
    .optional(),
});

export function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const { getToken } = useKindeAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      autoSave: profile?.autoSave ?? true,
      autoSaveDuration: profile?.autoSaveDuration ?? 30,
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        autoSave: profile.autoSave ?? true,
        autoSaveDuration: profile.autoSaveDuration ?? 30,
      });
    }
  }, [profile, form]);

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No access token available");
      const body: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        autoSave: values.autoSave ?? false,
        autoSaveDuration: values.autoSaveDuration ?? 30,
      };
      const res = await fetchWithAuth(
        "/user/profile",
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
        token
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      setSuccess("Profile updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 p-6"
      >
        <div>
          <h3 className="mb-2 text-xl font-semibold flex items-center gap-2">
            Profile Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your name information and preferences.
          </p>
        </div>

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  placeholder="First name"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  placeholder="Last name"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoSave"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="!mb-0">Enable Auto-save</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoSaveDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auto-save Interval (seconds)</FormLabel>
              <FormControl>
                <input
                  type="number"
                  min={5}
                  max={3600}
                  step={1}
                  value={field.value ?? 30}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-32 rounded-md border px-3 py-2 text-sm bg-background"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
