import { HouseIcon } from "lucide-react";
import Link from "next/link";
import { AuthAction } from "./AuthAction";

export function Header() {
  return (
    <header className="bg-foreground text-background flex justify-between items-center h-header px-4 tracking-widest">
      <Link href="/" className="flex items-center gap-2 text-3xl">
        <HouseIcon />
        <span>FIRE HOMES</span>
      </Link>

      <nav>
        <ul className="flex items-center gap-6">
          <li>
            <Link className="hover:underline" href="/search">
              PROPERTY SEARCH
            </Link>
          </li>

          <AuthAction />
        </ul>
      </nav>
    </header>
  );
}
