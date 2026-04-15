"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useLocale } from "@/components/providers/LocaleProvider";

export function LoginForm() {
  const router = useRouter();
  const { tr } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    if (error) {
      setError(error.message ?? tr.auth.invalidCredentials);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center space-y-1">
        <p className="text-3xl">🌿</p>
        <h1 className="font-heading italic text-2xl text-foreground">Health Tracker</h1>
        <p className="text-sm text-muted-foreground">{tr.auth.welcomeBack}</p>
      </div>

      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4" />
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{tr.auth.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{tr.auth.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tr.auth.signingIn : tr.auth.signIn}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {tr.auth.noAccount}{" "}
              <Link href="/register" className="text-primary underline underline-offset-4">
                {tr.auth.signUp}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
