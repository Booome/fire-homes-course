import { cn } from "@/lib/utils";
import { z } from "zod";

export const breadCrubmClasses =
  "flex items-center gap-2 font-medium [&>li]:list-none text-foreground/70 [&>li:last-child]:text-foreground/90";

export const formItemClasses = cn(
  "space-y-1 ",
  "[&_label]:font-semibold ",
  "[&_input]:border-none [&_input]:shadow ",
  "[&_button]:border-none [&_button]:shadow ",
  "[&_textarea]:border-none [&_textarea]:shadow"
);

export const nameSchema = z
  .string()
  .min(3, { message: "Name must be at least 3 characters" });

export const emailSchema = z.string().email();

export const confirmCodeSchema = z.string().length(6, {
  message: "Confirmation code must be 6 characters",
});

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });
