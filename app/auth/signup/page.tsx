"use client";

import { PasswordFormField } from "@/components/auth/PasswordFormField";
import { TextFormField } from "@/components/auth/TextFormField";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/consts";
import { unhandledErrorToast, unhandledResponseToast } from "@/lib/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithRedirect, signUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const isLoading = isSigningUp || isGoogleRedirecting;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSigningUp(true);
    try {
      const response = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            name: data.name,
            email: data.email,
          },
        },
      });

      if (response.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.replace(`/auth/confirm-signup?email=${data.email}`);
        return;
      }

      unhandledResponseToast(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "UsernameExistsException") {
          form.setError("email", {
            message: error.message,
          });
          return;
        }
      }

      unhandledErrorToast(error);
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <Card>
      <CardTitle>Signup</CardTitle>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isLoading}>
            <TextFormField
              control={form.control as never}
              name="name"
              placeholder="Spongebob"
              onChange={() => setError(null)}
            />

            <TextFormField
              control={form.control as never}
              name="email"
              placeholder="Spongebob@gmail.com"
              onChange={() => setError(null)}
              autoComplete="email"
            />

            <PasswordFormField
              control={form.control as never}
              name="password"
              onChange={() => setError(null)}
              autoComplete="new-password"
            />

            <PasswordFormField
              control={form.control as never}
              name="confirmPassword"
              onChange={() => setError(null)}
              autoComplete="new-password"
            />

            {error && <p className="text-destructive mt-2">{error}</p>}
            <Button size="lg" type="submit" className="w-full mt-6">
              {isSigningUp ? "Signing up..." : "Signup"}
            </Button>
          </fieldset>
        </form>
      </Form>

      <p className="mt-6 mx-auto">or</p>

      <Button
        onClick={() => {
          setIsGoogleRedirecting(true);
          signInWithRedirect({ provider: "Google" });
        }}
        variant="outline"
        size="lg"
        type="button"
        className="w-full mt-6"
        disabled={isLoading}
      >
        {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
      </Button>
    </Card>
  );
}
