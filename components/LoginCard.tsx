import { toast } from "@/hooks/use-toast";
import { emailSchema, passwordSchema } from "@/lib/consts";
import { unhandledErrorToast, unhandledResponseToast } from "@/lib/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordFormField } from "./auth/PasswordFormField";
import { TextFormField } from "./auth/TextFormField";
import { Button } from "./ui/button";
import { Card, CardTitle } from "./ui/card";
import { Form } from "./ui/form";

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default function LoginCard({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);

    try {
      const response = await signIn({
        username: data.email,
        password: data.password,
      });

      if (response.isSignedIn) {
        toast({
          title: "Login successful",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
        return;
      }

      switch (response.nextStep.signInStep) {
        case "CONFIRM_SIGN_UP":
          router.replace(`/auth/confirm-signup?email=${data.email}`);
          return;
      }

      unhandledResponseToast(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NotAuthorizedException") {
          setError(error.message);
          return;
        }
      }

      unhandledErrorToast(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const SignInForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isLoggingIn || isGoogleRedirecting}>
            <TextFormField
              control={form.control as never}
              name="email"
              placeholder="Spongebob@gmail.com"
              onChange={() => setError(null)}
            />

            <PasswordFormField
              control={form.control as never}
              name="password"
              onChange={() => setError(null)}
            />

            {error && <p className="text-red-500 mt-6">{error}</p>}
            <Button size="lg" type="submit" className="w-full mt-6">
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </fieldset>
        </form>
      </Form>
    );
  };

  return (
    <Card>
      <CardTitle>Login</CardTitle>

      <SignInForm />

      <p className="mt-4">
        Forgot your Password?&nbsp;
        <Link className="underline" href="/auth/reset-password">
          Reset here.
        </Link>
      </p>

      <p className="mt-2 mx-auto">or</p>

      <Button
        onClick={() => {
          setIsGoogleRedirecting(true);
          signInWithRedirect({ provider: "Google" });
        }}
        variant="outline"
        size="lg"
        type="button"
        className="w-full mt-4"
        disabled={isLoggingIn || isGoogleRedirecting}
      >
        {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
      </Button>

      <p className="mt-4 mb-2">
        Don&apos;t have an account?&nbsp;
        <Link className="underline" href="/auth/signup">
          Register for a new account.
        </Link>
      </p>
    </Card>
  );
}
