"use client";

import { useEffect, type ReactNode } from "react";
import { creatorsTheme } from "@/lib/creatorsTheme";

// Applies the creators accent override to document.documentElement (the <html>
// tag), not just a wrapping div. A wrapping div only reaches `{children}` of
// this route's own layout — it never reached the shared chrome (Navbar,
// Footer, CustomCursor) which render as SIBLINGS of <main> in the ROOT layout,
// outside this route's subtree entirely. Setting the vars on <html> reaches
// everything via normal CSS custom-property cascade. Cleans up on unmount
// (navigating back to "/") so the corporate site's ember stays untouched.
export default function CreatorsThemeScope({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ember", creatorsTheme.accent);
    root.style.setProperty("--ember-bright", creatorsTheme.accentBright);
    root.dataset.route = "creators";
    return () => {
      root.style.removeProperty("--ember");
      root.style.removeProperty("--ember-bright");
      delete root.dataset.route;
    };
  }, []);

  return <>{children}</>;
}
