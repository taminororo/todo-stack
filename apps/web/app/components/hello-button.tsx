"use client";

import { Button } from "@todo/ui/components/button";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@todo/ui/components/dialog";

export function HelloButton() {
  function handleClick() {
      const [open, setOpen] = useState(false);

return (
  <>
    <Button onClick={() => setOpen(true)}>こんにちは</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </>
);
  }

}
