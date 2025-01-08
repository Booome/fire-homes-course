"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  buttonBaseClasses,
  cardBaseClasses,
  cardTitleClasses,
  emailSchema,
  nameSchema,
  passwordSchema,
} from "../lib/const";

export default function Signup() {
  const router = useRouter();

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
      console.log(response);

      if (response.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        router.replace(`/auth/confirm-signup?email=${data.email}`);
      }
    } catch (error) {
      const errorName = (error as { name: string }).name;

      if (errorName === "UsernameExistsException") {
        form.setError("email", {
          message: "This email is already registered",
        });
      }
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
    </Card>
  );
}
