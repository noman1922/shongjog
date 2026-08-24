"use client";

import { AlertTriangle, Loader2, LogOut, X } from "lucide-react";
import { useTransition } from "react";

import { signOutAction } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
}: LogoutConfirmationModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
    >
      <div
        className="fixed inset-0"
        onClick={!isPending ? onClose : undefined}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-border/80 dark:border-slate-800 bg-card p-6 shadow-2xl transition-all duration-200 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          <X className="size-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20">
            <AlertTriangle className="size-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground leading-tight">
              Sign out of Shongjog?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to end your active session? You will need to sign in again to access your network feed and messages.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            className="w-full sm:w-auto"
            isDisabled={isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            className="w-full sm:w-auto gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
            isDisabled={isPending}
            onClick={handleSignOut}
            type="button"
            variant="destructive"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            <span>Yes, Log Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
