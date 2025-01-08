"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../AuthProvider";

export function AuthAction() {
  const { user, signOut, avatarUrl, email, fullname, isAdmin } = useAuth();

  const Avatar = () => {
    return avatarUrl ? (
      <Image
        src={avatarUrl}
        alt="avatar"
        width={32}
        height={32}
        className="rounded-full"
        onError={(e) => {
          const imgElement = e.currentTarget as HTMLImageElement;
          imgElement.outerHTML = `<img src="${avatarUrl}" alt="avatar" class="w-8 h-8 rounded-full" />`;
        }}
      />
    ) : (
      <Skeleton className="h-8 w-8 rounded-full bg-background/50" />
    );
  };

  const UnauthenticatedView = () => {
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
  };

  const AuthenticatedView = () => {
    const itemClassName =
      "px-2 py-1 hover:outline-none rounded text-sm text-right";
    const linkItemClassName = cn(
      itemClassName,
      "uppercase hover:bg-sky-700 hover:cursor-pointer"
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="border-2 border-black p-1 bg-foreground rounded-lg flex flex-col">
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
              <Link href="/account/admin-dashboard">Admin Dashboard</Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild className={linkItemClassName}>
            <Link href="/account/my-favorites">My Favorites</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className={linkItemClassName} onClick={signOut}>
            LOGOUT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return user ? <AuthenticatedView /> : <UnauthenticatedView />;
}
