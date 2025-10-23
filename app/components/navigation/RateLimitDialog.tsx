"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

const RateLimitDialog: React.FC = () => {
  const [open, setOpen] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const dontShow = localStorage.getItem("dont_show_rate_limit_dialog");
      return dontShow ? false : true;
    }
    return true; // Default to showing dialog on server-side render
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleCheck = () => {
    setDontShowAgain((prev) => !prev);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("dont_show_rate_limit_dialog", "true");
    }
    setOpen(false);
  };

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem("dont_show_rate_limit_dialog", "true");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thank you for trying RiskGuard!</DialogTitle>
          <DialogDescription>
            You hit request rate limit, but no worries, we&apos;ll reset it
            automatically!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p>
            Please check back later to continue using RiskGuard.
          </p>
        </div>
        <DialogFooter className="flex flex-col lg:flex-row justify-center lg:justify-between w-full gap-4 mt-5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dontshowagain"
              checked={dontShowAgain}
              onCheckedChange={handleCheck}
            />
            <p className="text-sm">Don&apos;t show again</p>
          </div>
          <Button variant="outline" onClick={handleContinue}>
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateLimitDialog;
