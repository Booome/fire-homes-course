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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  buttonBaseClasses,
  cardBaseClasses,
  cardTitleClasses,
  emailSchema,
  nameSchema,
  passwordSchema,
} from "@/lib/consts";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithRedirect, signUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

      toast({
        title: "Signup failed",
        description: `Unhandled response: ${JSON.stringify(response)}`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Signup error:", error);

      if (error && typeof error === "object" && "name" in error) {
        if (error.name === "UsernameExistsException") {
          form.setError("email", {
            message: "This email is already registered",
          });
          return;
        }
      }

      toast({
        title: "Signup failed",
        description: `Unhandled error: ${JSON.stringify(error)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cardBaseClasses}>
      <CardTitle className={cardTitleClasses}>Signup</CardTitle>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Name:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Spongebob"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Email:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Spongebob@gmail.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Confirm Password:</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button size="lg" type="submit" className={buttonBaseClasses}>
            Signup
          </Button>
        </form>
      </Form>

      <p className="mt-6 mx-auto">or</p>

      <Button
        onClick={() => signInWithRedirect({ provider: "Google" })}
        variant="outline"
        size="lg"
        type="button"
        className={buttonBaseClasses}
      >
        Continue with Google
      </Button>
    </Card>
  );
}
