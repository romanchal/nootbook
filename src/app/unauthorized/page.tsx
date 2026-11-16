import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface UnauthorizedPageProps {
  searchParams: Promise<{ required?: string }>;
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const { required } = await searchParams;

  const roleLabels: Record<string, string> = {
    EARNER: "Earner",
    CLASS_ADMIN: "Class Admin",
    DEPARTMENT_ADMIN: "Department Admin",
    COLLEGE_ADMIN: "College Admin",
    SUPER_ADMIN: "Super Admin",
  };

  const humanRole = required ? roleLabels[required] ?? required : "an administrative";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0-10.5a9 9 0 110 18 9 9 0 010-18zm.05 14.25h.01"
          />
        </svg>
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">Access restricted</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This area requires <span className="font-semibold text-foreground">{humanRole}</span> privileges
        for your college. If you believe this is an error, contact your Class or College Admin.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
          Back to Dashboard
        </Link>
        <Link href="/library" className={buttonVariants({ variant: "outline" })}>
          Browse Library
        </Link>
      </div>
    </main>
  );
}
