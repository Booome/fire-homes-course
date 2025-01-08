"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  buttonBaseClasses,
  cardClasses,
  cardContentClasses,
  cardTitleClasses,
} from "@/lib/consts";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    currentPassword: z.string().min(2).max(50),
    newPassword: z.string().min(2).max(50),
    confirmPassword: z.string().min(2).max(50),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Page() {
  const { email, fullname } = useAuth();

  return (
    <Card className={cn(cardClasses, "max-w-screen-sm mx-auto mt-5")}>
      <CardHeader>
        <CardTitle className={cardTitleClasses}>My Account</CardTitle>
      </CardHeader>
      <CardContent className={cardContentClasses}>
        <div className="flex flex-col gap-2">
          <p>Name: {fullname}</p>
          <p>Email: {email}</p>
        </div>

        <Separator />

        <UpdatePasswordForm />

        <Separator />

        <div>
          <h2 className="text-2xl font-bold text-destructive">Danger Area</h2>
          <Button
            variant="destructive"
            className={cn(buttonBaseClasses, "mt-4")}
          >
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log(data);
    setIsSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Update Password</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={buttonBaseClasses}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}
