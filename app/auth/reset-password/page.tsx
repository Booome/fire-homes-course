"use client";

import { ConfirmCodeFormField } from "@/components/auth/ConfirmCodeFormField";
import { PasswordFormField } from "@/components/auth/PasswordFormField";
import { TextFormField } from "@/components/auth/TextFormField";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { confirmCodeSchema, emailSchema, passwordSchema } from "@/lib/consts";
import { unhandledErrorToast } from "@/lib/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmResetPassword, resetPassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
    confirmCode: confirmCodeSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
      confirmCode: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await confirmResetPassword({
        username: data.email,
        newPassword: data.newPassword,
        confirmationCode: data.confirmCode,
      });
      toast({
        title: "Password reset successful",
      });
      router.replace("/auth/login");
    } catch (error) {
      unhandledErrorToast(error);
    }
  };

  const sendConfirmCode = async () => {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { message: "Email is required" });
      return false;
    }
    await resetPassword({ username: email });
    return true;
  };

  return (
    <Card className="pb-8">
      <CardTitle>Reset Password</CardTitle>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset>
            <TextFormField
              control={form.control as never}
              name="email"
              autoComplete="email"
            />

            <PasswordFormField
              control={form.control as never}
              name="newPassword"
              autoComplete="new-password"
            />
            <PasswordFormField
              control={form.control as never}
              name="confirmPassword"
              autoComplete="new-password"
            />

            <ConfirmCodeFormField
              control={form.control as never}
              name="confirmCode"
              email={form.getValues("email")}
              onSendConfirmCode={sendConfirmCode}
              timeout={60}
            />

            <Button type="submit" className="w-full mt-6">
              Reset Password
            </Button>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
