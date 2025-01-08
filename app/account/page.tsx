"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { deleteUserTab } from "@/lib/dataActions";
import { deleteProfilePicture } from "@/lib/storageAction";
import { unhandledErrorToast } from "@/lib/toasts";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteUser, updatePassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
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
    <Card className="max-w-screen-sm mx-auto mt-5">
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <p>Name: {fullname}</p>
          <p>Email: {email}</p>
        </div>

        <Separator />

        <UpdatePasswordForm />

        <Separator />

        <div>
          <h2 className="text-2xl font-bold text-destructive -mb-2">
            Danger Area
          </h2>
          <DeleteAccountButton />
        </div>
      </CardContent>
    </Card>
  );
}

function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await updatePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      if (error instanceof Error) {
        switch (error.name) {
          case "InvalidPasswordException":
            form.setError("newPassword", {
              message: error.message,
            });
            return;
          case "LimitExceededException":
            setError(error.message);
            return;
        }
      }

      unhandledErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
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
                    <Input
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        setError(null);
                        field.onChange(e);
                      }}
                    />
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
                    <Input
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        setError(null);
                        field.onChange(e);
                      }}
                    />
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
                    <Input
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        setError(null);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full mt-6">
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}

function DeleteAccountButton() {
  const router = useRouter();
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmPassword, setConfirmStringInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const confirmString = "confirm delete";

  const handleDeleteAccount = async () => {
    if (confirmPassword !== confirmString) {
      setError("Input does not match");
      return;
    }

    setIsDeleting(true);
    try {
      await Promise.all([deleteProfilePicture(), deleteUserTab()]);
      await deleteUser();
      toast({
        title: "Account deleted",
        description: "Your account has been deleted",
      });
      router.replace(window.location.pathname);
    } catch (error) {
      unhandledErrorToast(error);
    } finally {
      setIsDeleting(false);
      setOpenConfirmDelete(false);
    }
  };

  return (
    <Dialog open={openConfirmDelete} onOpenChange={setOpenConfirmDelete}>
      <Button
        className="w-full mt-6"
        variant="destructive"
        onClick={() => {
          setError(null);
          setConfirmStringInput("");
          setOpenConfirmDelete(true);
        }}
      >
        Delete Account
      </Button>
      <DialogContent>
        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>

        <DialogDescription asChild>
          <div>
            <p>
              This action is irreversible and will delete your account and all
              associated data.
            </p>
            <p className="mt-4 mb-2">
              Please enter <strong>{confirmString}</strong> to confirm this
              action.
            </p>
            <Input
              type="text"
              placeholder=""
              value={confirmPassword}
              onChange={(e) => {
                setError(null);
                setConfirmStringInput(e.target.value);
              }}
              autoComplete="new-password"
            />
          </div>
        </DialogDescription>

        {error && <p className="text-destructive -mt-2">{error}</p>}

        <div className="flex justify-between w-1/2 gap-2 ml-auto mr-0">
          <Button
            disabled={isDeleting}
            variant="outline"
            className="flex-1"
            onClick={() => setOpenConfirmDelete(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isDeleting}
            variant="destructive"
            onClick={handleDeleteAccount}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
