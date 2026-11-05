import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Nootbook</h1>
      <p className="max-w-md text-muted-foreground">
        Academic library and peer-to-peer task marketplace for college students.
      </p>
      <Button size="lg">Coming soon</Button>
    </main>
  );
}
