import { useForm } from "react-hook-form"
import z, { set } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form"
import { Switch } from "@radix-ui/react-switch"
import { Button } from "../ui/button"
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const FormSchema = z.object({
  theme: z.string().default("light").optional(),
  useStrava: z.boolean().default(false).optional(),
})
export function SettingsPage() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      theme: "light",
      useStrava: false,
    },
  })
  function onSubmit(data: z.infer<typeof FormSchema>) {
      console.log(data)
    //   setTheme(data?.theme === "dark" ? "dark" : "light");
    //   setIncludeStravaDetails(data?.useStrava === undefined ? false : data.useStrava);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => {
                  return (
                      <FormItem>
                          <div className="space-y-0.5">
                              <FormLabel>Dark Theme or Light Theme</FormLabel>
                              <FormDescription>
                                  Choose between dark or light theme for the application.
                              </FormDescription>
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value ? "dark" : "light"}>
                              <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Theme" />
                                  </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                  <SelectItem value="dark">dark</SelectItem>
                                  <SelectItem value="ligth">light</SelectItem>
                              </SelectContent>
                          </Select>
                      </FormItem>
                  )
              }}
            />
            <FormField
              control={form.control}
              name="useStrava"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-0.5">
                    <FormLabel>Strava Integration</FormLabel>
                    <FormDescription>
                        Enable or disable Strava integration for activity tracking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}