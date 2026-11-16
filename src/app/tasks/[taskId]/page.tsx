import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAppUser } from "@/features/auth/guards";
import { getTaskDetails } from "@/features/tasks/queries";
import { TASK_STATUS_META, TASK_TYPE_META, formatDeadline } from "@/features/tasks/format";
import { formatPaiseToRupees } from "@/lib/money";
import { BidsList } from "@/features/tasks/bids-list";
import { BidForm } from "@/features/tasks/bid-form";
import { DeliveryBox } from "@/features/tasks/delivery-box";
import { ReviewBox } from "@/features/tasks/review-box";
import { DisputeBanner } from "@/features/disputes/dispute-banner";
import { OpenDisputeDialog } from "@/features/disputes/open-dispute-dialog";
import { cancelTaskAction } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import { AppNavbar } from "@/components/layout/app-navbar";

export const dynamic = "force-dynamic";

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const user = await requireAppUser();
  const { taskId } = await params;

  if (!user.collegeId) {
    notFound();
  }

  const task = await getTaskDetails(user.collegeId, taskId);

  if (!task) {
    notFound();
  }

  const isOwner = task.studentId === user.id;
  const isEarner = user.roles.some((r) => r.name === "EARNER");
  const isAssignedEarner = task.earnerId === user.id;

  const typeMeta = TASK_TYPE_META[task.type];
  const statusMeta = TASK_STATUS_META[task.status];
  const deadlineInfo = formatDeadline(task.deadline);

  // Check if current user has an existing bid on this task
  const myExistingBid = task.bids.find((b) => b.earnerId === user.id);
  const existingReview = task.reviews[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-background ambient-mesh pb-20 md:pb-12">
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

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/tasks" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          {isOwner && (
            <>
              <span>/</span>
              <Link href="/tasks/my" className="hover:text-foreground transition-colors text-amber-600 dark:text-amber-400 font-medium">
                My Tasks
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-[200px]">{task.title}</span>
        </nav>

        {/* Main Task Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold ${
                  typeMeta?.badgeClass ?? "bg-muted text-muted-foreground"
                }`}
              >
                <span>{typeMeta?.icon}</span>
                <span>{typeMeta?.label ?? task.type}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                <span>{statusMeta.label}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
                Task Budget
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                {formatPaiseToRupees(task.budgetPaise)}
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {task.title}
            </h1>

            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Posted by <strong className="text-foreground">{task.student.name}</strong></span>
              {task.subject && (
                <span>
                  · Subject: <strong className="text-foreground">{task.subject.name}</strong>
                </span>
              )}
              <span className={`font-mono ${deadlineInfo.isPast ? "text-destructive font-bold" : ""}`}>
                · Deadline: {new Date(task.deadline).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ({deadlineInfo.text})
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-foreground space-y-1.5">
            <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">
              Task Scope & Description
            </span>
            <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
          </div>

          {/* Task Poster Actions (e.g. Cancel if OPEN) */}
          {isOwner && task.status === "OPEN" && (
            <form
              action={async () => {
                "use server";
                await cancelTaskAction(taskId);
              }}
              className="flex justify-end border-t border-border/60 pt-3"
            >
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 text-xs rounded-xl">
                Cancel Task
              </Button>
            </form>
          )}
        </div>

        {/* Escrow Status Card */}
        {task.escrowHold && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Payment Held in Escrow ({task.escrowHold.status})
                </span>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                  {formatPaiseToRupees(task.escrowHold.amountPaise)} is held safely by Nootbook in pilot mode. Released to earner upon your acceptance.
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              {task.escrowHold.paymentId}
            </span>
          </div>
        )}

        {/* Dispute Status Banner (if filed) */}
        {task.dispute && <DisputeBanner dispute={task.dispute} />}

        {/* Delivery & Handover Box (when assigned or delivered) */}
        <DeliveryBox
          taskId={task.id}
          status={task.status}
          isOwner={isOwner}
          isAssignedEarner={isAssignedEarner}
          earnerName={task.earner?.name}
        />

        {/* Open Dispute Action (when active or delivered and no dispute yet) */}
        {(task.status === "ASSIGNED" || task.status === "DELIVERED") &&
          !task.dispute &&
          (isOwner || isAssignedEarner) && (
            <OpenDisputeDialog
              taskId={task.id}
              isOwner={isOwner}
              isEarner={isAssignedEarner}
            />
          )}

        {/* Review Box (when completed) */}
        {task.status === "ACCEPTED" && (
          <ReviewBox
            taskId={task.id}
            isOwner={isOwner}
            earnerName={task.earner?.name}
            existingReview={existingReview}
          />
        )}

        {/* Bids Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Proposals & Bids</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {task.bids.length} {task.bids.length === 1 ? "bid received" : "bids received"}
            </span>
          </div>

          {/* For Verified Earner: Bid Form if task is OPEN */}
          {!isOwner && isEarner && task.status === "OPEN" && !deadlineInfo.isPast && (
            <BidForm
              taskId={task.id}
              defaultAmountRupees={Math.round(task.budgetPaise / 100)}
              existingBid={myExistingBid}
            />
          )}

          {/* For Student Non-Earner */}
          {!isOwner && !isEarner && task.status === "OPEN" && (
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-center text-xs text-muted-foreground">
              Are you skilled in formatting, slides, or tutoring? Apply for the{" "}
              <Link href="/earner" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                Earner Role
              </Link>{" "}
              to submit bids and earn money completing tasks.
            </div>
          )}

          {/* List of bids (visible to student owner or bidders) */}
          <BidsList
            taskId={task.id}
            taskStatus={task.status}
            bids={task.bids}
            isOwner={isOwner}
          />
        </section>
      </main>
    </div>
  );
}
