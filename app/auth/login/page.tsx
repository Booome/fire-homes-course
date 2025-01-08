"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "@aws-amplify/ui-react/styles.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword, signIn, signInWithRedirect } from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  buttonBaseClasses,
  cardBaseClasses,
  cardTitleClasses,
  emailSchema,
  passwordSchema,
} from "../lib/const";

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();
  const continueWithGoogle = () => signInWithRedirect({ provider: "Google" });

  useEffect(() => {
    if (user) {
      router.back();
    }
  }, [user, router]);

  const formSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    const response = await signIn({
      username: data.email,
      password: data.password,
    });
    console.log(response);

    if (
      response.nextStep.signInStep ===
      "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
    ) {
      const response = await resetPassword({ username: data.email });
      console.log(response);

      // router.replace(`/auth/force-change-password?email=${data.email}`);
    }
  };

  const SignInForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Email:</FormLabel>
                <FormControl>
                  <Input placeholder="Spongebob@gmail.com" {...field} />
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
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button size="lg" type="submit" className={buttonBaseClasses}>
            Login
          </Button>
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
        onClick={continueWithGoogle}
        variant="outline"
        size="lg"
        type="button"
        className={buttonBaseClasses}
      >
        Continue with Google
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
