"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "aws-amplify/auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const formSchema = z.object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (email) {
      resetPassword({ username: email }).then((data) => {
        console.log(data);
      });
    }
  }, [email]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return email ? (
    <Card>
      <CardTitle>Reset Password</CardTitle>
      <CardDescription>Confirm code was sent to {email}</CardDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>New Password:</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
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
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full mt-6">
            Reset Password
          </Button>
        </form>
      </Form>
    </Card>
  ) : (
    <Card>
      <CardTitle>No email provided</CardTitle>
    </Card>
  );
}
