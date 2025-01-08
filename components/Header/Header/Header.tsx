import Link from "next/link";
import { GoHome } from "react-icons/go";
import { AuthAction } from "./AuthAction";

export function Header() {
  return (
    <div className="bg-foreground text-background flex justify-between items-center h-24 px-4 tracking-widest">
      <Link href="/" className="flex items-center gap-2 text-3xl">
        <GoHome className="-translate-y-0.5" />
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
    </div>
  );
}
