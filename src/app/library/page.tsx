import Link from "next/link";
import { requireAppUser } from "@/features/auth/guards";
import { getCollegeDepartments } from "@/features/library/queries";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

const BRANCH_DESCRIPTIONS: Record<string, string> = {
  AI: "Complete Nagpur autonomous curriculum for AI: Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, MLOps, semester syllabi, and verified question papers.",
  CSE: "Core computing, Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks, and autonomous examination question papers.",
  CIVIL: "Structural Analysis, Concrete Technology, Geotechnical Engineering, Surveying, Transportation, and autonomous question papers.",
  IT: "Web Technologies, Cloud Architecture, Information Security, Software Engineering, DevOps, and autonomous question papers.",
  EE: "Electrical Machines, Power Systems, Control Systems, Power Electronics, Energy Systems, and autonomous question papers.",
  ECE: "Analog & Digital Electronics, Signals & Systems, Communication Systems, Embedded Systems, and autonomous question papers.",
  ETC: "Telecommunication Systems, Digital Signal Processing, RF & Microwave Engineering, Optical Fiber, and autonomous question papers.",
  MECH: "Thermodynamics, Fluid Mechanics, Strength of Materials, Theory of Machines, CAD/CAM, and autonomous question papers.",
};

export default async function LibraryRootPage() {
  const user = await requireAppUser();

  if (!user.collegeId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppNavbar
          user={{
            id: user.id,
            name: user.name || "Student",
            email: user.email,
            collegeName: user.college?.name,
            collegeCity: user.college?.city,
            roles: user.roles,
          }}
        />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-xl font-bold">No college assigned</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is not linked to a college campus. Please contact support or your college admin.
          </p>
          <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  // Fetch all departments including both active and upcoming branches
  const departments = await getCollegeDepartments(user.collegeId, { includeAll: true });
  const collegeName = user.college?.name ?? "Priyadarshini Bhagwati College of Engineering, Nagpur (AUTONOMOUS)";
  const collegeCity = user.college?.city ?? "Nagpur";

  const liveDepartments = departments.filter((d) => d.active);
  const comingSoonDepartments = departments.filter((d) => !d.active);

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
      <AppNavbar
        user={{
          id: user.id,
          name: user.name || "Student",
          email: user.email,
          collegeName,
          collegeCity,
          roles: user.roles,
        }}
      />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">Academic Library</span>
        </nav>

        {/* Dedicated College Section Header */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  🏛️ {collegeCity} Campus · AUTONOMOUS
                </span>
                <span className="text-xs text-muted-foreground">
                  Isolated College Space
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {collegeName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Dedicated campus section: Every college maintains an independent academic library with autonomous syllabus mapping, unit-wise notes, and question paper archives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/library/search"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>🔍 Search</span>
              </Link>
              <Link
                href="/library/bookmarks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>🔖 Saved</span>
              </Link>
              <Link
                href="/library/upload"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-blue-800 hover:to-blue-900 transition-all hover:scale-[1.02]"
              >
                <span>+ Upload</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Active Live Branches (Artificial Intelligence) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Active Branch (Full Curriculum Live)
              </h2>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Now Available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {liveDepartments.map((dept) => {
              const description = BRANCH_DESCRIPTIONS[dept.code] || "Autonomous curriculum, verified lecture notes, and university previous year question papers.";
              return (
                <Link
                  key={dept.id}
                  href={`/library/${dept.code.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-card via-card to-blue-500/10 p-6 sm:p-7 shadow-sm transition-all hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold rounded-lg bg-blue-700 text-white px-2.5 py-1 shadow-2xs">
                          {dept.code}
                        </span>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          ● 8 Semesters Available
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {dept._count.subjects} Curriculum Subjects
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform">
                        <span>Explore Semesters</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Section 2: Coming Soon Branches */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>🚀</span> Upcoming Engineering Branches
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Curriculum, semester syllabi, and question paper archives are in active preparation by departmental coordinators.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground w-fit">
              {comingSoonDepartments.length} branches launching soon
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {comingSoonDepartments.map((dept) => {
              const description = BRANCH_DESCRIPTIONS[dept.code] || "Syllabus mapping & exam paper verification in progress.";
              return (
                <Link
                  key={dept.id}
                  href={`/library/${dept.code.toLowerCase()}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-5 transition-all hover:border-amber-500/30 hover:bg-card hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-muted-foreground rounded-lg bg-muted px-2 py-0.5 border border-border/60">
                        {dept.code}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        <span>⏳</span>
                        <span>Coming Soon</span>
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {dept.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                    <span className="text-[11px]">8 Semesters in prep</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
                      View Status →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
