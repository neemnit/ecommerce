"use client"; // This will be a client component

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  return pathname === "/" ? <Navbar /> : null;
}
