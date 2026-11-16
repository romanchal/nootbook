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
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 p-5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 shadow-sm">
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

      <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        Access Restricted
      </h1>
      <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
        This portal requires <span className="font-bold text-foreground">{humanRole}</span> privileges for Priyadarshini Bhagwati College of Engineering. If your account was newly registered, please sign in with your authorized admin email or contact your administrator.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className={buttonVariants({
            size: "lg",
            className: "rounded-xl font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs hover:shadow-md transition-all",
          })}
        >
          Back to Dashboard
        </Link>
        <Link
          href="/library"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "rounded-xl font-bold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all",
          })}
        >
          Browse Library
        </Link>
      </div>
    </main>
  );
}
