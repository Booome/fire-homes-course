"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  buttonBaseClasses,
  cardBaseClasses,
  cardDescriptionClasses,
  cardTitleClasses,
  confirmCodeSchema,
} from "../lib/const";

function ConfirmSignupContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  const formSchema = z.object({
    confirmCode: confirmCodeSchema,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmCode: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);

    try {
      const response = await confirmSignUp({
        username: email!,
        confirmationCode: data.confirmCode,
      });

      if (!response.isSignUpComplete) {
        console.error("Signup not complete:", response);
      }

      router.back();
    } catch (error) {
      const errorName = (error as { name: string }).name;

      switch (errorName) {
        case "ExpiredCodeException":
          form.setError("confirmCode", {
            message: "Confirmation code expired",
          });
          break;
        case "NotAuthorizedException":
          console.log("NotAuthorizedException:", JSON.stringify(error));
          break;
        case "LimitExceededException":
          console.log("LimitExceededException:", JSON.stringify(error));
          form.setError("confirmCode", {
            message: "Too many attempts, please try again later",
          });
          break;
        default:
          console.error("Error confirming signup:", error);
          break;
      }
    }
  };

  const resendConfirmationCode = async () => {
    console.log("Resend confirmation code to:", email);

    try {
      await resendSignUpCode({ username: email! });
    } catch (error) {
      console.error("Error resending confirmation code:", error);
    }
  };

  return email ? (
    <Card className={cardBaseClasses}>
      <CardTitle className={cardTitleClasses}>Confirm Signup</CardTitle>
      <CardDescription className={cardDescriptionClasses}>
        Confirmation code sent to your email &quot;{email}&quot;.
      </CardDescription>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="confirmCode"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Confirmation Code:</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resendConfirmationCode}
                      className="w-8"
                    >
                      <RefreshCw />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className={buttonBaseClasses}>
            Confirm
          </Button>
        </form>
      </Form>
    </Card>
  ) : (
    <Card className={cardBaseClasses}>
      <CardTitle className={cardTitleClasses}>No email provided</CardTitle>
    </Card>
  );
}

export default function ConfirmSignupPage() {
  return (
    <Suspense
      fallback={
        <Card className={cardBaseClasses}>
          <CardTitle className={cardTitleClasses}>Loading...</CardTitle>
        </Card>
      }
    >
      <ConfirmSignupContent />
    </Suspense>
  );
}
