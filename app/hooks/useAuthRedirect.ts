"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const PUBLIC_PATHS = ["/", "/landing", "/login", "/signup"];

export function useAuthRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !pathname) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    if (pathname === "/admin" && user?.email !== "sasuke@uchiha.com") {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);
}