"use client";

import { useActionState } from "react";
import { updateName, changePassword } from "@/server/actions/settings";
import type { UpdateNameState, ChangePasswordState } from "@/server/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const initialNameState: UpdateNameState = {};
const initialPasswordState: ChangePasswordState = {};

type Props = {
  currentName: string;
  email: string;
};

export function SettingsForms({ currentName, email }: Props) {
  const [nameState, nameAction, namePending] = useActionState(updateName, initialNameState);
  const [pwState, pwAction, pwPending] = useActionState(changePassword, initialPasswordState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={nameAction} className="space-y-4">
            {nameState.errors?._form && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {nameState.errors._form[0]}
              </p>
            )}
            {nameState.success && (
              <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
                Name updated.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email-display">Email</Label>
              <Input
                id="email-display"
                value={email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={currentName}
                placeholder="Your name"
                className={cn(nameState.errors?.name && "border-destructive")}
              />
              {nameState.errors?.name && (
                <p className="text-xs text-destructive">{nameState.errors.name[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={namePending}>
              {namePending ? "Saving…" : "Save name"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading italic text-lg">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={pwAction} className="space-y-4">
            {pwState.errors?._form && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {pwState.errors._form[0]}
              </p>
            )}
            {pwState.success && (
              <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
                Password changed successfully.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className={cn(pwState.errors?.currentPassword && "border-destructive")}
              />
              {pwState.errors?.currentPassword && (
                <p className="text-xs text-destructive">{pwState.errors.currentPassword[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className={cn(pwState.errors?.newPassword && "border-destructive")}
              />
              {pwState.errors?.newPassword && (
                <p className="text-xs text-destructive">{pwState.errors.newPassword[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" disabled={pwPending}>
              {pwPending ? "Saving…" : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
