import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/current-user";
import { Button } from "@/components/ui/button";

// This page reads the auth session (cookies) per request, so it must not be
// statically prerendered. With `cacheComponents` enabled, `instant = false`
// opts the route out of instant prerendering.
export const instant = false;

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>

      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  );
}
