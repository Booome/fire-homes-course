import { confirmCodeSchema } from "@/lib/consts";
import { unhandledErrorToast, unhandledResponseToast } from "@/lib/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmCodeFormField } from "./auth/ConfirmCodeFormField";
import { Button } from "./ui/button";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { Form } from "./ui/form";

const formSchema = z.object({
  confirmCode: confirmCodeSchema,
});

export function ConfirmSignupCard({ email }: { email: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmCode: "",
    },
  });
  const router = useRouter();

  const resendConfirmationCode = async () => {
    try {
      await resendSignUpCode({ username: email! });
      return true;
    } catch (error) {
      unhandledErrorToast(error);
      return false;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await confirmSignUp({
        username: email!,
        confirmationCode: data.confirmCode,
      });
      if (response.isSignUpComplete) {
        router.back();
        return;
      }
      unhandledResponseToast(response);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.name) {
          case "ExpiredCodeException":
            form.setError("confirmCode", {
              message: error.message,
            });
            return;
          case "LimitExceededException":
            form.setError("confirmCode", {
              message: error.message,
            });
            return;
        }
      }
      unhandledErrorToast(error);
    }
  };

  return (
    <Card>
      <CardTitle>Confirm Signup</CardTitle>
      <CardDescription className="mt-2">
        Confirmation code sent to your email &quot;{email}&quot;.
      </CardDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ConfirmCodeFormField
            control={form.control as never}
            name="confirmCode"
            email={email}
            onSendConfirmCode={resendConfirmationCode}
            timeout={120}
            timeoutOnStart={true}
          />

          <Button type="submit" size="lg" className="w-full mt-6">
            Confirm
          </Button>
        </form>
      </Form>
    </Card>
  );
}
