"use client";

import { useState } from "react";
import { requestOtp, verifyOtp } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await requestOtp({ email });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStep("code");
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await verifyOtp({ email, code });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    // On success the server action redirects; no further handling needed.
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your email and we'll send a 6-digit code."
            : "Enter the 6-digit code we sent you."}
        </p>
      </header>

      {step === "email" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@college.edu"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-sm text-muted-foreground underline underline-offset-4"
          >
            Use a different email
          </button>
        </form>
      )}
    </main>
  );
}
