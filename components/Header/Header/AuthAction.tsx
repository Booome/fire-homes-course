"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "../../AuthProvider";

export function AuthAction() {
  const { user } = useAuth();

  return user ? <AuthenticatedView /> : <UnauthenticatedView />;
}

function UnauthenticatedView() {
  console.log("UnauthenticatedView");

  return (
    <li className="flex items-center gap-2">
      <Link className="hover:underline" href="/auth/login">
        LOGIN
      </Link>

      <Separator orientation="vertical" className="h-6 bg-background/50" />

      <Link className="hover:underline" href="/auth/signup">
        SIGNUP
      </Link>
    </li>
  );
}

function AuthenticatedView() {
  const { signOut, avatarUrl, email, fullname, isAdmin } = useAuth();

  useEffect(() => {
    return () => {
      window.location.reload();
    };
  }, []);

  const itemClassName =
    "px-2 py-1 hover:outline-none rounded text-sm text-right";
  const linkItemClassName = cn(
    itemClassName,
    "uppercase hover:bg-sky-700 hover:cursor-pointer"
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={`Avatar of ${fullname || email}`} />
          <AvatarFallback>{fullname?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-2 border-black p-1 bg-foreground rounded-lg flex flex-col z-10">
        <DropdownMenuItem className={itemClassName}>
          <p className="normal-case text-base font-bold">{fullname}</p>
          <p className="normal-case text-xs">{email}</p>
        </DropdownMenuItem>
        <Separator className="mb-1 bg-background/50" />
        <DropdownMenuItem asChild className={linkItemClassName}>
          <Link href="/account">My Account</Link>
        </DropdownMenuItem>

        {!!isAdmin && (
          <DropdownMenuItem asChild className={linkItemClassName}>
            <Link href="/admin-dashboard">Admin Dashboard</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className={linkItemClassName}>
          <Link href="/account/my-favorites">My Favorites</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={linkItemClassName}
          onClick={() => {
            signOut();
          }}
        >
          LOGOUT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
