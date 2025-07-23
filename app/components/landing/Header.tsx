'use client'
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import LogoutButton from '../LogoutButton'
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/practice/select", label: "Practice" },
    { href: "/review", label: "Review" },
];

const Header = () => {
    const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        <div className="flex items-center space-x-2 bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          <GraduationCap className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">
            AceCT
          </span>
        </div>
        {/* Centered nav links */}
        <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-blue-700 font-medium no-underline"
                      : "text-gray-700 hover:text-blue-700 no-underline"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
};

export default Header;