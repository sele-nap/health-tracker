"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  twoFactorEnabled: boolean;
};

type Step = "idle" | "setup" | "verify" | "backupcodes";

export function TwoFactorSection({ twoFactorEnabled }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(twoFactorEnabled);
  const [pending, startTransition] = useTransition();

  function handleEnable() {
    setError("");
    setStep("setup");
  }

  function handleGetUri() {
    if (!password) {
      setError("Password is required");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await authClient.twoFactor.getTotpUri({ password });
      if (res.error) {
        setError(res.error.message ?? "Failed to get TOTP URI");
        return;
      }
      setTotpUri(res.data?.totpURI ?? null);
    });
  }

  function handleVerify() {
    setError("");
    startTransition(async () => {
      const res = await authClient.twoFactor.verifyTotp({ code });
      if (res.error) {
        setError(res.error.message ?? "Invalid code");
        return;
      }
      const backupRes = await authClient.twoFactor.generateBackupCodes({ password });
      if (backupRes.data?.backupCodes) {
        setBackupCodes(backupRes.data.backupCodes);
      }
      setEnabled(true);
      setStep("backupcodes");
    });
  }

  function handleDisable() {
    setError("");
    startTransition(async () => {
      const res = await authClient.twoFactor.disable({ password });
      if (res.error) {
        setError(res.error.message ?? "Failed to disable 2FA");
        return;
      }
      setEnabled(false);
      setStep("idle");
      setPassword("");
    });
  }

  if (step === "backupcodes") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
            2FA is now enabled. Save these backup codes somewhere safe — you won't see them again.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((c, i) => (
              <code key={i} className="text-xs font-mono bg-muted/40 px-2 py-1 rounded text-foreground">
                {c}
              </code>
            ))}
          </div>
          <Button variant="outline" onClick={() => setStep("idle")}>
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "setup") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">Enable two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {!totpUri ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="2fa-password">Confirm your password</Label>
                <Input
                  id="2fa-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleGetUri} disabled={pending}>
                  {pending ? "Loading…" : "Continue"}
                </Button>
                <Button variant="outline" onClick={() => setStep("idle")}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Scan this code with your authenticator app (Ente Auth, Aegis, etc.), then enter the 6-digit code below.
              </p>
              <div className="bg-white p-3 rounded-lg inline-block">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(totpUri)}`}
                  alt="TOTP QR code"
                  width={160}
                  height={160}
                />
              </div>
              <p className="text-xs text-muted-foreground break-all font-mono">{totpUri}</p>
              <div className="space-y-2">
                <Label htmlFor="totp-code">6-digit code</Label>
                <Input
                  id="totp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-32"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleVerify} disabled={pending || code.length !== 6}>
                  {pending ? "Verifying…" : "Verify & enable"}
                </Button>
                <Button variant="outline" onClick={() => setStep("idle")}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading italic text-lg">Two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {enabled ? "2FA is enabled" : "2FA is disabled"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled
                ? "Your account is protected with TOTP authentication."
                : "Add an extra layer of security to your account."}
            </p>
          </div>
          {enabled ? (
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
        </div>

        {enabled ? (
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password to disable</Label>
              <Input
                id="disable-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="max-w-xs"
              />
            </div>
            <Button variant="destructive" onClick={handleDisable} disabled={pending || !password}>
              {pending ? "Disabling…" : "Disable 2FA"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={handleEnable}>
            Enable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
