'use client'

import React, { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/practice/select", label: "Practice" },
    { href: "/review", label: "Review" },
  ];

  return (
    <nav className="bg-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Brand (left) */}
          <div className="flex-1">
            <Link href="/" className="text-xl font-semibold text-gray-800">AceCT</Link>
          </div>

          {/* Nav Links (center) */}
          <div className="hidden md:flex flex-1 justify-center space-x-6 items-center">
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
          </div>

          {/* Profile/Logout (right) */}
          <div className="flex-1 flex justify-end">
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 focus:outline-none transition"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
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
                    ? "block text-blue-700 font-medium"
                    : "block text-gray-700 hover:text-blue-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
          <LogoutButton />
        </div>
      )}
    </nav>
  );
}