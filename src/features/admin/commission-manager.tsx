"use client";

import { useState, useTransition } from "react";
import { updateCommissionConfigAction } from "./actions";
import { Button } from "@/components/ui/button";

interface CommissionManagerProps {
  initialBps: number;
  initialFixedPaise: number;
  collegeId?: string | null;
}

export function CommissionManager({
  initialBps,
  initialFixedPaise,
  collegeId,
}: CommissionManagerProps) {
  const [bps, setBps] = useState(initialBps);
  const [fixedFeeRupees, setFixedFeeRupees] = useState(initialFixedPaise / 100);
  const [testTaskPrice, setTestTaskPrice] = useState(500);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Live calculation based on Section 5 & Section 17.6
  const commissionPercentage = bps / 100;
  const platformFee = fixedFeeRupees;
  const studentTotal = testTaskPrice + platformFee;
  const earnerCommission = (testTaskPrice * bps) / 10000;
  const earnerReceives = testTaskPrice - earnerCommission;
  const platformRevenue = earnerCommission + platformFee;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("commissionBps", String(bps));
    formData.set("fixedFeePaise", String(Math.round(fixedFeeRupees * 100)));
    if (collegeId) {
      formData.set("collegeId", collegeId);
    }

    startTransition(async () => {
      const res = await updateCommissionConfigAction(formData);
      if (res.error) {
        setMessage({ text: res.error, error: true });
      } else {
        setMessage({ text: "Commission configuration saved successfully! (Logged to AuditLog)" });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Commission & Platform Fee Configuration
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configured in database (`commission_configs`), never hard-coded.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-xs ${
              message.error
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Earner Commission Bps */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-foreground">
              Earner Commission: <span className="text-primary">{commissionPercentage}%</span>
            </label>
            <span className="font-mono text-muted-foreground">{bps} basis points</span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            step="50"
            value={bps}
            onChange={(e) => setBps(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="text-[11px] text-muted-foreground">
            Deducted from the earner payout upon student task acceptance.
          </span>
        </div>

        {/* Payer Fixed Fee */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-foreground">Payer Fixed Platform Fee</label>
            <span className="font-mono text-muted-foreground">₹{fixedFeeRupees}</span>
          </div>
          <input
            type="number"
            min="0"
            max="200"
            value={fixedFeeRupees}
            onChange={(e) => setFixedFeeRupees(Number(e.target.value))}
            className="h-8 w-full rounded border bg-background px-2.5 text-xs text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">
            Added to the agreed task amount at checkout.
          </span>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save Financial Settings"}
        </Button>
      </form>

      {/* Live Financial Simulator (Section 5 Spec) */}
      <div className="rounded-xl border bg-card/60 p-5 space-y-4 shadow-2xs backdrop-blur-xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Interactive Task Settlement Simulator
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preview ledger distribution for an agreed student task.
          </p>
        </div>

        <div className="space-y-1 text-xs">
          <label className="text-muted-foreground">Sample Agreed Task Price (₹)</label>
          <input
            type="number"
            min="50"
            max="10000"
            step="50"
            value={testTaskPrice}
            onChange={(e) => setTestTaskPrice(Number(e.target.value))}
            className="h-8 w-full rounded border bg-background px-2.5 text-xs text-foreground font-mono"
          />
        </div>

        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Agreed Task Price:</span>
            <span className="font-mono font-medium">₹{testTaskPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee to Payer:</span>
            <span className="font-mono font-medium text-emerald-600">+₹{platformFee}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Student Pays in Total:</span>
            <span className="font-mono text-foreground">₹{studentTotal}</span>
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-muted-foreground">Commission ({commissionPercentage}%):</span>
            <span className="font-mono text-rose-500">-₹{earnerCommission}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span>Earner Receives:</span>
            <span className="font-mono text-emerald-600">₹{earnerReceives}</span>
          </div>

          <div className="flex justify-between border-t pt-2 font-bold text-primary">
            <span>Nootbook Platform Gross:</span>
            <span className="font-mono">₹{platformRevenue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
