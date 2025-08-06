import { createFileRoute } from "@tanstack/react-router";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { login } = useKindeAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-8 p-8">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-lg text-muted-foreground">
            Please login to continue
          </p>
        </div>

        {/* Login Button */}
        <Button
          onClick={() => login()}
          size="lg"
          className="px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
