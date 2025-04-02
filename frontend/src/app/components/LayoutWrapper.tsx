
"use client";


import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppSelector } from "../hook";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => {
    return state.user.isAuthenticated
  }); // Adjust based on your Redux state
  const isHome = pathname === "/";

  // List of private routes
  const privateRoutes = ["/address", "/my-orders", "/order", "/payment", "/success"]; // Add your private routes

  useEffect(() => {
    const token=localStorage.getItem("accessToken")
    if ( !token && privateRoutes.includes(pathname)) {
      router.push("/"); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, pathname, router, privateRoutes]);

  return <div className={isHome ? "m-4" : ""}>{children}</div>;
}
