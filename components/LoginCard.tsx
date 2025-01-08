import { toast } from "@/hooks/use-toast";
import {
  buttonBaseClasses,
  cardBaseClasses,
  cardTitleClasses,
  emailSchema,
  passwordSchema,
} from "@/lib/consts";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword, signIn, signInWithRedirect } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Card, CardTitle } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

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
          router.replace("/");
        }
        return;
      }

      if (
        response.nextStep.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        const response = await resetPassword({ username: data.email });
        console.log(response);
        // router.replace(`/auth/force-change-password?email=${data.email}`);
      }

      toast({
        title: "Login failed",
        description: `Unhandled response: ${JSON.stringify(response)}`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error && typeof error === "object" && "name" in error) {
        if (error.name === "NotAuthorizedException") {
          setError("Incorrect username or password");
          return;
        }
      }

      toast({
        title: "Login failed",
        description: `Unhandled error: ${JSON.stringify(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const SignInForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isLoggingIn || isGoogleRedirecting}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Email:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Spongebob@gmail.com"
                      {...field}
                      onChange={(e) => {
                        setError(null);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Password:</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        setError(null);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {error && <p className="text-red-500 mt-4">{error}</p>}
            <Button size="lg" type="submit" className={buttonBaseClasses}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </fieldset>
        </form>
      </Form>
    );
  };

  return (
    <Card className={cardBaseClasses}>
      <CardTitle className={cardTitleClasses}>Login</CardTitle>

      <SignInForm />

      <p className="mt-4">
        Forgot your Password?&nbsp;
        <Link className="underline" href="">
          Reset here.
        </Link>
      </p>

      <p className="mt-4 mx-auto">or</p>

      <Button
        onClick={() => {
          setIsGoogleRedirecting(true);
          signInWithRedirect({ provider: "Google" });
        }}
        variant="outline"
        size="lg"
        type="button"
        className={buttonBaseClasses}
        disabled={isLoggingIn || isGoogleRedirecting}
      >
        {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
      </Button>

      <p className="my-6">
        Don&apos;t have an account?&nbsp;
        <Link className="underline" href="/auth/signup">
          Register for a new account.
        </Link>
      </p>
    </Card>
  );
}
