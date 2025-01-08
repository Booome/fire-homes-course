"use client";

import LoginCard from "@/components/LoginCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={() => {
        router.back();
      }}
    >
      <DialogContent className="p-0">
        <DialogTitle className="hidden">Login</DialogTitle>
        <DialogDescription className="hidden">
          Login to your account to continue
        </DialogDescription>
        <LoginCard
          onSuccess={() => {
            router.back();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
