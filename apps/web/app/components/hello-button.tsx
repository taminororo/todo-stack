"use client";

import { useState } from "react";
import { Button } from "@todo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@todo/ui/components/dialog";

export function HelloButton() {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  return (
    <>
      <Button onClick={handleClick}>Click me, Open a dialog</Button>
      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>ボタンを押すと開くダイアログです。</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog >
        
      </Dialog>
    </>
  );
}
