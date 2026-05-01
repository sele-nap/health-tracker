'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';
import { useCallback, useState, useTransition } from 'react';

type Props = {
  twoFactorEnabled: boolean;
};

type Step = 'idle' | 'setup' | 'verify' | 'backupcodes';

export function TwoFactorSection({ twoFactorEnabled }: Props) {
  const { tr } = useLocale();
  const [step, setStep] = useState<Step>('idle');
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enabled, setEnabled] = useState(twoFactorEnabled);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const copyUri = useCallback(() => {
    if (!totpUri) return;
    navigator.clipboard.writeText(totpUri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [totpUri]);

  function handleEnable() {
    setError('');
    setStep('setup');
  }

  function handleGetUri() {
    if (!password) {
      setError(tr.settings.passwordRequired);
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await authClient.twoFactor.getTotpUri({ password });
      if (res.error) {
        setError(res.error.message ?? tr.settings.failedTotp);
        return;
      }
      setTotpUri(res.data?.totpURI ?? null);
    });
  }

  function handleVerify() {
    setError('');
    startTransition(async () => {
      const res = await authClient.twoFactor.verifyTotp({ code });
      if (res.error) {
        setError(res.error.message ?? tr.settings.invalidCode);
        return;
      }
      const backupRes = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (backupRes.data?.backupCodes) {
        setBackupCodes(backupRes.data.backupCodes);
      }
      setEnabled(true);
      setStep('backupcodes');
    });
  }

  function handleDisable() {
    setError('');
    startTransition(async () => {
      const res = await authClient.twoFactor.disable({ password });
      if (res.error) {
        setError(res.error.message ?? tr.settings.failedDisable);
        return;
      }
      setEnabled(false);
      setStep('idle');
      setPassword('');
    });
  }

  if (step === 'backupcodes') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.settings.twoFactor}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
            {tr.settings.backupCodesMsg}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((c, i) => (
              <code
                key={i}
                className="text-xs font-mono bg-muted/40 px-2 py-1 rounded text-foreground"
              >
                {c}
              </code>
            ))}
          </div>
          <Button variant="outline" onClick={() => setStep('idle')}>
            {tr.settings.done}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">
            {tr.settings.enableTwoFactor}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {!totpUri ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="2fa-password">
                  {tr.settings.confirmPassword2fa}
                </Label>
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
                  {pending ? tr.settings.loading : tr.settings.continueBtn}
                </Button>
                <Button variant="outline" onClick={() => setStep('idle')}>
                  {tr.cancel}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {tr.settings.scanInstructions}
              </p>
              <div className="bg-white p-3 rounded-lg inline-block">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(totpUri)}`}
                  alt="TOTP QR code"
                  width={160}
                  height={160}
                />
              </div>
              <button
                type="button"
                onClick={copyUri}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                {copied ? tr.settings.uriCopied : tr.settings.copyUri}
              </button>
              <div className="space-y-2">
                <Label htmlFor="totp-code">{tr.settings.digitCode}</Label>
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
                <Button
                  onClick={handleVerify}
                  disabled={pending || code.length !== 6}
                >
                  {pending ? tr.settings.verifying : tr.settings.verifyEnable}
                </Button>
                <Button variant="outline" onClick={() => setStep('idle')}>
                  {tr.cancel}
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
        <CardTitle className="font-heading italic text-lg">
          {tr.settings.twoFactor}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {enabled
                ? tr.settings.twoFactorEnabled
                : tr.settings.twoFactorDisabled}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {enabled
                ? tr.settings.twoFactorEnabledDesc
                : tr.settings.twoFactorDisabledDesc}
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
              <Label htmlFor="disable-password">
                {tr.settings.passwordToDisable}
              </Label>
              <Input
                id="disable-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="max-w-xs"
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={pending || !password}
            >
              {pending ? tr.settings.disabling : tr.settings.disableBtn}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={handleEnable}>
            {tr.settings.enableBtn}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
